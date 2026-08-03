/**
 * SMART NAV — Search Engine v4.0
 *
 * Improvements over v3:
 *  - Levenshtein edit-distance for typo tolerance ("pandit" finds "Pandit")
 *  - Alias / synonym expansion (BTL05 → BTL-05, lift → elevator, washroom → toilet …)
 *  - Deduplicated faculty indexing (no more double results for the same person)
 *  - Floor-name awareness ("fifth floor" surfaces all 5th-floor rooms)
 *  - Multi-token query support ("karuna pandit" → intersect token scores)
 *  - Directions text excluded from ranking (was polluting scores)
 *  - Dynamic Firestore overlay merges cleanly with static fallback
 *  - Results grouped by type (rooms first, then faculty) in alternatives
 *  - Lower, smarter confidence threshold
 */

import { searchIndex } from './searchIndex'
import { getFirestoreDocName } from '../config'
import { getFloorFullNameInWords } from '../utils/floorFormatter'
import { floorIdToUrl } from '../utils/slugHelpers'

// ─── ENGINE CONFIG ────────────────────────────────────────────────────────────
const CONFIDENCE_THRESHOLD = 18 // Lower so fuzzy hits surface
const MAX_ALTERNATIVES = 8

// ─── CACHE ───────────────────────────────────────────────────────────────────
let SEARCH_POOL_CACHE = null
let DYNAMIC_FLOORS_DATA = null

/** Called by SearchSystem.jsx whenever Firestore pushes new data. */
export const updateSearchData = (dynamicData) => {
  DYNAMIC_FLOORS_DATA = dynamicData
  SEARCH_POOL_CACHE = null // bust cache
}

// ─── ALIASES ─────────────────────────────────────────────────────────────────
/**
 * Canonical alias table.
 * Each entry: [query-alias, canonical-term-that-appears-in-data]
 * This lets users type colloquial terms and still hit the right room.
 */
const ALIAS_MAP = [
  // Common room shorthands
  ['elevator', 'lift'],
  ['toilet', 'washroom'],
  ['wc', 'washroom'],
  ['bathroom', 'washroom'],
  ['restroom', 'washroom'],
  ['stairs', 'staircase'],
  ['stair', 'stairs'],
  // Department shorthands
  ['cs', 'cse'],
  ['computer science', 'cse'],
  ['is', 'ise'],
  ['information science', 'ise'],
  ['ec', 'ece'],
  ['electronics', 'ece'],
  ['me', 'mech'],
  ['mechanical', 'mech'],
  ['cv', 'civil'],
  ['ai', 'aiml'],
  ['artificial intelligence', 'aiml'],
  ['bt', 'biotech'],
  ['ee', 'eee'],
  ['electrical', 'eee'],
  
  // Faculty/staff
  ['staff room', 'staffroom'],
  ['head of department', 'hod'],
  
  // Amenities
  ['canteen', 'cafeteria'],
  ['food court', 'cafeteria'],
  ['first aid', 'medical'],
  
  // Numeric shorthand: "lh505" → "lh-505", "btl5" → "btl 5"
]

/**
 * Expand the query through alias substitutions.
 * Returns an array of strings to test (original + expanded variants).
 */
const expandAliases = (query) => {
  const q = query.toLowerCase().trim()
  const variants = new Set([q])
  for (const [alias, canonical] of ALIAS_MAP) {
    if (q === alias) {
      variants.add(canonical)
    } else {
      // Use word boundaries to avoid replacing substrings (e.g. "cs" in "csl08")
      const regex = new RegExp(`\\b${alias}\\b`, 'g')
      if (regex.test(q)) {
        variants.add(q.replace(regex, canonical))
      }
    }
  }
  // Normalise room codes: "lh505" → "lh 505" → "lh-505"
  const dashified = q.replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
  const spaced = q.replace(/([a-zA-Z]+)(\d+)/, '$1 $2')
  if (dashified !== q) variants.add(dashified)
  if (spaced !== q) variants.add(spaced)
  return [...variants]
}

// ─── FLOOR LABEL → KEY MAP ───────────────────────────────────────────────────
const FLOOR_LABEL_MAP = {
  basement: ['basement', 'b'],
  ground: ['ground', 'ground floor', 'gf', 'g floor'],
  first: ['first', '1st', '1 floor', 'first floor'],
  second: ['second', '2nd', '2 floor', 'second floor'],
  third: ['third', '3rd', '3 floor', 'third floor'],
  fourth: ['fourth', '4th', '4 floor', 'fourth floor'],
  fifth: ['fifth', '5th', '5 floor', 'fifth floor'],
}

const detectFloorIntent = (query) => {
  const q = query.toLowerCase()
  for (const [key, aliases] of Object.entries(FLOOR_LABEL_MAP)) {
    for (const alias of aliases) {
      if (q === alias) return key
      const regex = new RegExp(`\\b${alias}\\b`)
      if (regex.test(q)) return key
    }
  }
  return null
}

// ─── LEVENSHTEIN (for typo tolerance) ────────────────────────────────────────
const levenshtein = (a, b) => {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : Math.min(row[j - 1], prev, row[j]) + 1
      row[j - 1] = prev
      prev = val
    }
    row[b.length] = prev
  }
  return row[b.length]
}

// ─── CORE SCORING ─────────────────────────────────────────────────────────────
/**
 * Score how well `query` matches `target` string.
 * Returns 0..1000.
 */
const scoreToken = (target, query) => {
  if (!target || !query) return 0
  const t = target
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
  const q = query.toLowerCase()

  // Exact match
  if (t === q) return 1000

  // Skeleton (strip non-alpha)
  const sT = t.replace(/\s+/g, '')
  const sQ = q.replace(/\s+/g, '')
  if (sT === sQ) return 960

  // Prefix match (very strong signal)
  if (t.startsWith(q)) return 850 + q.length * 5
  if (sT.startsWith(sQ)) return 800 + sQ.length * 5

  // Word-boundary prefix (e.g. "btl" hits "BTL 05")
  const words = t.split(/[\s\-_]+/)
  for (const word of words) {
    if (word === q) return 750
    if (word.startsWith(q)) return 700 + q.length * 3
  }

  // Substring containment
  if (t.includes(q)) return 600 + (q.length / t.length) * 150

  // Levenshtein typo tolerance (only for words ≥ 4 chars)
  if (q.length >= 4) {
    let bestLev = Infinity
    for (const word of words) {
      if (Math.abs(word.length - q.length) <= 3) {
        bestLev = Math.min(bestLev, levenshtein(word, q))
      }
    }
    // Allow up to 2 edits for short words, 3 for longer
    const maxEdits = q.length <= 5 ? 1 : q.length <= 8 ? 2 : 3
    if (bestLev <= maxEdits) {
      return Math.max(0, 500 - bestLev * 80)
    }
  }

  // Fuzzy subsequence (last resort)
  let score = 0,
    qIdx = 0,
    lastI = -1,
    run = 0
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      run = lastI === i - 1 ? run + 1 : 0
      score += 10 + run * 15
      lastI = i
      qIdx++
    }
  }
  if (qIdx === q.length) {
    return Math.min(350, score * 0.5 + (q.length / t.length) * 100)
  }

  return 0
}

/**
 * Score an item against a multi-token query.
 * Multi-token queries ("karuna pandit") require ALL tokens to match at least
 * somewhat, and the final score is the average of per-token bests.
 */
const scoreItem = (item, queryVariants) => {
  let bestTotal = 0

  for (const qVariant of queryVariants) {
    const tokens = qVariant.split(/\s+/).filter(Boolean)

    // Per-token: find best score across all item fields
    const fields = [
      item.name,
      item.roomName,
      item.department,
      item.designation,
      item.type,
      item.description,
      item.buildingName,
      item.floorLabel,
      ...(item.tags || []),
    ]
    const fieldStr = fields.filter(Boolean).join(' ')

    let tokenScores = tokens.map((tok) => {
      let best = 0
      // Score against each field individually
      for (const field of fields) {
        if (field) best = Math.max(best, scoreToken(field, tok))
      }
      // Also score against the entire combined field string
      best = Math.max(best, scoreToken(fieldStr, tok))
      return best
    })

    // Multi-token: every token must fire (even weakly)
    if (tokens.length > 1 && tokenScores.some((s) => s === 0)) continue

    const avg = tokenScores.reduce((a, b) => a + b, 0) / tokenScores.length
    // Multi-token bonus — if BOTH tokens fire, it's a strong signal
    const bonus = tokens.length > 1 ? 50 : 0
    bestTotal = Math.max(bestTotal, avg + bonus)
  }

  return bestTotal
}

// ─── INDEX BUILDER ────────────────────────────────────────────────────────────
const FLOOR_LABELS = {
  basement: 'Basement Floor',
  ground: 'Ground Floor',
  first: 'First Floor',
  second: 'Second Floor',
  third: 'Third Floor',
  fourth: 'Fourth Floor',
  fifth: 'Fifth Floor',
  cv_raman_basement: 'Basement Floor',
  cv_raman_ground: 'Ground Floor',
  cv_raman_first: 'First Floor',
  cv_raman_second: 'Second Floor',
  cv_raman_third: 'Third Floor',
  cv_raman_fourth: 'Fourth Floor',
  cv_raman_fifth: 'Fifth Floor',
  ramanujan_ground: 'Ground Floor',
  ramanujan_first: 'First Floor',
  ramanujan_second: 'Second Floor',
  ramanujan_third: 'Third Floor',
  ramanujan_fourth: 'Fourth Floor',
  smv_ground: 'Ground Floor',
  smv_first: 'First Floor',
  smv_second: 'Second Floor',
  smv_third: 'Third Floor',
  smv_fourth: 'Fourth Floor',
  smv_fifth: 'Fifth Floor',
  smv_sixth: 'Sixth Floor',
  atal_ground: 'Ground Floor',
  atal_first: 'First Floor',
  atal_second: 'Second Floor',
  atal_third: 'Third Floor',
  rajraman_basement: 'Basement Floor',
  rajraman_ground: 'Ground Floor',
  rajraman_first: 'First Floor',
  rajraman_second: 'Second Floor',
  rajraman_third: 'Third Floor',
  rajraman_fourth: 'Fourth Floor',
  rajraman_fifth: 'Fifth Floor',
}


const buildSearchPool = () => {
  if (SEARCH_POOL_CACHE) return SEARCH_POOL_CACHE

  // Merge strategy: Firestore data overlays onto static fallback per-floor.
  // Firestore doc keys are like "Fifth-Floor"; we normalise them to floor keys.
  const staticData = searchIndex
  const dynamicData = DYNAMIC_FLOORS_DATA || {}

  // Build a lookup: floorKey → enriched floor data
  const mergedFloors = {}
  for (const [floorKey, staticFloor] of Object.entries(staticData)) {
    const docKey = getFirestoreDocName(floorKey)
    const dynamic = dynamicData[floorKey] || dynamicData[docKey] || {}

    mergedFloors[floorKey] = {
      ...staticFloor,
      rooms: dynamic.rooms || staticFloor.rooms || [],
      faculty: dynamic.faculty || staticFloor.faculty || [],
      label: getFloorFullNameInWords(dynamic.label || staticFloor.label || FLOOR_LABELS[floorKey]),
    }
  }


  const pool = []
  const seenFaculty = new Set() // deduplicate faculty

  for (const [floorKey, floorData] of Object.entries(mergedFloors)) {
    const floorLabel = floorData.label || FLOOR_LABELS[floorKey]

    // Build a per-room faculty lookup for linked-staff context
    const roomFacultyMap = {}
    for (const fac of floorData.faculty || []) {
      if (!roomFacultyMap[fac.roomId]) roomFacultyMap[fac.roomId] = []
      roomFacultyMap[fac.roomId].push(fac.name)
    }

    // ── Rooms ────────────────────────────────────────────────────────────
    for (const room of floorData.rooms || []) {
      const linkedFaculty = roomFacultyMap[room.id] || []
      pool.push({
        _kind: 'room',
        id: room.id,
        name: room.name,
        type: room.type || 'room',
        floorKey,
        floorLabel,
        buildingName: floorData.buildingName || 'APJ-BLOCK',
        linkedFaculty,
        faculty: room.faculty || null,
        tags: room.tags || [],
        department: room.department || '',
        directions: room.directions || '',
        description: room.description || '',
      })
    }

    // ── Faculty (explicit list) ───────────────────────────────────────────
    for (const fac of floorData.faculty || []) {
      const dedupKey = `${fac.name}::${fac.roomId}`
      if (seenFaculty.has(dedupKey)) continue
      seenFaculty.add(dedupKey)

      const room = floorData.rooms?.find((r) => r.id === fac.roomId)
      pool.push({
        _kind: 'faculty',
        id: fac.roomId,
        name: fac.name,
        type: 'faculty',
        floorKey,
        floorLabel,
        buildingName: floorData.buildingName || 'APJ-BLOCK',
        roomName: room?.name || 'Staff Area',
        department: fac.department || room?.department || '',
        designation: fac.designation || '',
        directions: room?.directions || '',
        tags: room?.tags || [],
      })
    }

  }

  SEARCH_POOL_CACHE = pool
  return pool
}

// ─── MAIN RESOLVER ───────────────────────────────────────────────────────────
export const resolveNavigationQuery = (query, context = {}) => {
  if (!query || query.trim().length < 1) return null

  const raw = query.trim()
  const pool = buildSearchPool()

  // Check if user is asking for a specific floor
  const floorIntent = detectFloorIntent(raw)

  // Expand into alias variants for scoring
  const queryVariants = expandAliases(raw)

  const scored = pool
    .map((item) => {
      let rawScore = scoreItem(item, queryVariants)

      // ── Contextual boosts ────────────────────────────────────────────────
      // Floor proximity boost (current floor gets +12%)
      if (item.floorKey === context.currentFloor) rawScore *= 1.12

      // Floor-intent: if user typed "third floor", boost all third-floor items
      if (floorIntent && item.floorKey.includes(floorIntent))
        rawScore = Math.max(rawScore, 400)

      // Faculty gets a small identity boost (people searches are common)
      if (item._kind === 'faculty') rawScore += 15

      // Lab rooms with "BTL" get a priority boost (very popular search)
      if (item.name?.toUpperCase().includes('BTL')) rawScore += 40

      // ── Confidence mapping (0..100) ──────────────────────────────────────
      const confidence = Math.min(100, Math.round((rawScore / 1050) * 100))

      // ── Build description ─────────────────────────────────────────────────
      let description = ''
      const bld = item.buildingName ? `${item.buildingName} · ` : ''
      if (item._kind === 'faculty') {
        const dept = item.department ? ` · ${item.department}` : ''
        description = `${item.roomName} · ${bld}${item.floorLabel}${dept}`
      } else {
        const typeLabel = item.type.replace('_', ' ')
        const staff =
          item.linkedFaculty?.length > 0
            ? item.linkedFaculty[0]
            : item.faculty || null
        const staffStr = staff ? ` · ${staff}` : ''
        description = `${typeLabel} · ${bld}${item.floorLabel}${staffStr}`
      }


      // ── URL ───────────────────────────────────────────────────────────────
      const baseUrl = floorIdToUrl(item.floorKey)
      const url =
        item._kind === 'faculty'
          ? `${baseUrl}?room=${item.id}&faculty=${encodeURIComponent(item.name)}`
          : `${baseUrl}?room=${item.id}`

      return {
        id: item.id,
        title: item.name,
        url,
        description,
        directions: item.directions || null,
        confidence_score: confidence,
        category_tags: [item._kind, item.type, item.floorKey],
        _kind: item._kind,
        _floorKey: item.floorKey,
        _floorLabel: item.floorLabel,
        _department: item.department || '',
      }
    })
    .filter((r) => r.confidence_score >= CONFIDENCE_THRESHOLD)
    .sort((a, b) => {
      // Primary: confidence
      const diff = b.confidence_score - a.confidence_score
      if (diff !== 0) return diff
      // Secondary: rooms before faculty (rooms are the destination)
      if (a._kind !== b._kind) return a._kind === 'room' ? -1 : 1
      return 0
    })

  if (scored.length === 0) return null

  const top = scored[0]
  // Alternatives: exclude top result, cap at MAX_ALTERNATIVES
  top.alternatives = scored.slice(1, MAX_ALTERNATIVES + 1)

  return top
}

export const getSearchPool = () => buildSearchPool()
