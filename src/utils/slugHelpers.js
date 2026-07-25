/**
 * SMART NAV - Route & Slug Helper
 * Handles bidirectional mapping between internal IDs (building keys, floor IDs)
 * and human-friendly URL slugs (e.g., /APJ-Block/Ground-Floor).
 */

// ─── BUILDING MAPPING ────────────────────────────────────────────────────────
export const buildingSlugMap = {
  'apj': 'APJ-Block',
  'cv-raman': 'CV-Raman-Block',
  'ramanujan': 'Ramanujan-Block',
  'smv': 'SMV-Block',
  'atal': 'Atal-Block',
  'rajraman': 'Rajraman-Block'
}

const buildingKeyLookup = {
  'apj': 'apj',
  'apj-block': 'apj',
  'cv-raman': 'cv-raman',
  'cv-raman-block': 'cv-raman',
  'cv_raman': 'cv-raman',
  'ramanujan': 'ramanujan',
  'ramanujan-block': 'ramanujan',
  'smv': 'smv',
  'smv-block': 'smv',
  'svm': 'smv',
  'svm-block': 'smv',
  'atal': 'atal',
  'atal-block': 'atal',
  'rajraman': 'rajraman',
  'rajraman-block': 'rajraman',
  'v-rajraman': 'rajraman',
  'v-rajraman-block': 'rajraman',
  'v.-rajraman-block': 'rajraman'
}

export const getBuildingKeyFromSlug = (slug) => {
  if (!slug) return null
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  return buildingKeyLookup[normalized] || buildingKeyLookup[slug.toLowerCase()] || null
}

export const getBuildingSlugFromKey = (key) => {
  if (!key) return 'APJ-Block'
  const normalized = getBuildingKeyFromSlug(key)
  return buildingSlugMap[normalized] || 'APJ-Block'
}

// ─── FLOOR ID <-> URL MAPPING ───────────────────────────────────────────────

const floorIdToSlugData = {
  // APJ Block
  'basement': { buildingSlug: 'APJ-Block', floorSlug: 'Basement-Floor' },
  'ground': { buildingSlug: 'APJ-Block', floorSlug: 'Ground-Floor' },
  'first': { buildingSlug: 'APJ-Block', floorSlug: 'First-Floor' },
  'second': { buildingSlug: 'APJ-Block', floorSlug: 'Second-Floor' },
  'third': { buildingSlug: 'APJ-Block', floorSlug: 'Third-Floor' },
  'fourth': { buildingSlug: 'APJ-Block', floorSlug: 'Fourth-Floor' },
  'fifth': { buildingSlug: 'APJ-Block', floorSlug: 'Fifth-Floor' },

  // CV-Raman Block
  'cv_raman_basement': { buildingSlug: 'CV-Raman-Block', floorSlug: 'Basement-Floor' },
  'cv_raman_ground': { buildingSlug: 'CV-Raman-Block', floorSlug: 'Ground-Floor' },
  'cv_raman_first': { buildingSlug: 'CV-Raman-Block', floorSlug: '1st-Floor' },
  'cv_raman_second': { buildingSlug: 'CV-Raman-Block', floorSlug: '2nd-Floor' },
  'cv_raman_third': { buildingSlug: 'CV-Raman-Block', floorSlug: '3rd-Floor' },
  'cv_raman_fourth': { buildingSlug: 'CV-Raman-Block', floorSlug: '4th-Floor' },
  'cv_raman_fifth': { buildingSlug: 'CV-Raman-Block', floorSlug: '5th-Floor' },

  // Ramanujan Block
  'ramanujan_ground': { buildingSlug: 'Ramanujan-Block', floorSlug: 'Ground-Floor' },
  'ramanujan_first': { buildingSlug: 'Ramanujan-Block', floorSlug: '1st-Floor' },
  'ramanujan_second': { buildingSlug: 'Ramanujan-Block', floorSlug: '2nd-Floor' },
  'ramanujan_third': { buildingSlug: 'Ramanujan-Block', floorSlug: '3rd-Floor' },
  'ramanujan_fourth': { buildingSlug: 'Ramanujan-Block', floorSlug: '4th-Floor' },

  // SMV Block
  'smv_ground': { buildingSlug: 'SMV-Block', floorSlug: 'Ground-Floor' },
  'smv_first': { buildingSlug: 'SMV-Block', floorSlug: '1st-Floor' },
  'smv_second': { buildingSlug: 'SMV-Block', floorSlug: '2nd-Floor' },
  'smv_third': { buildingSlug: 'SMV-Block', floorSlug: '3rd-Floor' },
  'smv_fourth': { buildingSlug: 'SMV-Block', floorSlug: '4th-Floor' },
  'smv_fifth': { buildingSlug: 'SMV-Block', floorSlug: '5th-Floor' },
  'smv_sixth': { buildingSlug: 'SMV-Block', floorSlug: '6th-Floor' },

  // SVM aliases for SMV
  'svm_ground': { buildingSlug: 'SMV-Block', floorSlug: 'Ground-Floor' },
  'svm_first': { buildingSlug: 'SMV-Block', floorSlug: '1st-Floor' },
  'svm_second': { buildingSlug: 'SMV-Block', floorSlug: '2nd-Floor' },
  'svm_third': { buildingSlug: 'SMV-Block', floorSlug: '3rd-Floor' },
  'svm_fourth': { buildingSlug: 'SMV-Block', floorSlug: '4th-Floor' },
  'svm_fifth': { buildingSlug: 'SMV-Block', floorSlug: '5th-Floor' },
  'svm_sixth': { buildingSlug: 'SMV-Block', floorSlug: '6th-Floor' },

  // Atal Block
  'atal_ground': { buildingSlug: 'Atal-Block', floorSlug: 'Ground-Floor' },
  'atal_first': { buildingSlug: 'Atal-Block', floorSlug: '1st-Floor' },
  'atal_second': { buildingSlug: 'Atal-Block', floorSlug: '2nd-Floor' },
  'atal_third': { buildingSlug: 'Atal-Block', floorSlug: '3rd-Floor' },

  // Rajraman Block
  'rajraman_basement': { buildingSlug: 'Rajraman-Block', floorSlug: 'Basement-Floor' },
  'rajraman_ground': { buildingSlug: 'Rajraman-Block', floorSlug: 'Ground-Floor' },
  'rajraman_first': { buildingSlug: 'Rajraman-Block', floorSlug: '1st-Floor' },
  'rajraman_second': { buildingSlug: 'Rajraman-Block', floorSlug: '2nd-Floor' },
  'rajraman_third': { buildingSlug: 'Rajraman-Block', floorSlug: '3rd-Floor' },
  'rajraman_fourth': { buildingSlug: 'Rajraman-Block', floorSlug: '4th-Floor' },
  'rajraman_fifth': { buildingSlug: 'Rajraman-Block', floorSlug: '5th-Floor' }
}

/**
 * Returns the pretty URL path for a given floor ID.
 * e.g., 'ground' -> '/APJ-Block/Ground-Floor'
 * e.g., 'cv_raman_first' -> '/CV-Raman-Block/1st-Floor'
 */
export const floorIdToUrl = (floorId) => {
  if (!floorId) return '/APJ-Block/Ground-Floor'
  const found = floorIdToSlugData[floorId]
  if (found) {
    return `/${found.buildingSlug}/${found.floorSlug}`
  }

  // Fallback: infer building & floor from string structure
  if (floorId.startsWith('cv_raman_')) {
    const floorPart = floorId.replace('cv_raman_', '')
    return `/CV-Raman-Block/${formatFloorPartToSlug(floorPart)}`
  }
  if (floorId.startsWith('ramanujan_')) {
    const floorPart = floorId.replace('ramanujan_', '')
    return `/Ramanujan-Block/${formatFloorPartToSlug(floorPart)}`
  }
  if (floorId.startsWith('smv_') || floorId.startsWith('svm_')) {
    const floorPart = floorId.replace(/^(smv_|svm_)/, '')
    return `/SMV-Block/${formatFloorPartToSlug(floorPart)}`
  }
  if (floorId.startsWith('atal_')) {
    const floorPart = floorId.replace('atal_', '')
    return `/Atal-Block/${formatFloorPartToSlug(floorPart)}`
  }
  if (floorId.startsWith('rajraman_')) {
    const floorPart = floorId.replace('rajraman_', '')
    return `/Rajraman-Block/${formatFloorPartToSlug(floorPart)}`
  }

  return `/APJ-Block/${formatFloorPartToSlug(floorId)}`
}

const formatFloorPartToSlug = (part) => {
  const norm = part.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (norm === 'basement' || norm === 'b') return 'Basement-Floor'
  if (norm === 'ground' || norm === 'g' || norm === 'gf') return 'Ground-Floor'
  if (norm === 'first' || norm === '1st' || norm === '1') return 'First-Floor'
  if (norm === 'second' || norm === '2nd' || norm === '2') return 'Second-Floor'
  if (norm === 'third' || norm === '3rd' || norm === '3') return 'Third-Floor'
  if (norm === 'fourth' || norm === '4th' || norm === '4') return 'Fourth-Floor'
  if (norm === 'fifth' || norm === '5th' || norm === '5') return 'Fifth-Floor'
  if (norm === 'sixth' || norm === '6th' || norm === '6') return 'Sixth-Floor'
  return `${part.charAt(0).toUpperCase()}${part.slice(1)}-Floor`
}

/**
 * Resolves (buildingSlug, floorSlug) from URL to internal floorId.
 * e.g., ('APJ-Block', 'Ground-Floor') -> 'ground'
 * e.g., ('CV-Raman-Block', '1st-Floor') -> 'cv_raman_first'
 */
export const urlToFloorId = (buildingSlug, floorSlug) => {
  if (!buildingSlug || !floorSlug) return null

  const bKey = getBuildingKeyFromSlug(buildingSlug)
  if (!bKey) return null

  const normFloor = floorSlug.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Standard floor key names for each building
  let floorName = 'ground'
  if (normFloor.includes('basement') || normFloor === 'b') floorName = 'basement'
  else if (normFloor.includes('ground') || normFloor === 'g' || normFloor === 'gf') floorName = 'ground'
  else if (normFloor.includes('first') || normFloor.includes('1st') || normFloor === '1') floorName = 'first'
  else if (normFloor.includes('second') || normFloor.includes('2nd') || normFloor === '2') floorName = 'second'
  else if (normFloor.includes('third') || normFloor.includes('3rd') || normFloor === '3') floorName = 'third'
  else if (normFloor.includes('fourth') || normFloor.includes('4th') || normFloor === '4') floorName = 'fourth'
  else if (normFloor.includes('fifth') || normFloor.includes('5th') || normFloor === '5') floorName = 'fifth'
  else if (normFloor.includes('sixth') || normFloor.includes('6th') || normFloor === '6') floorName = 'sixth'

  if (bKey === 'apj') {
    return floorName
  }
  if (bKey === 'cv-raman') {
    return `cv_raman_${floorName}`
  }
  if (bKey === 'ramanujan') {
    return `ramanujan_${floorName}`
  }
  if (bKey === 'smv') {
    return `smv_${floorName}`
  }
  if (bKey === 'atal') {
    return `atal_${floorName}`
  }
  if (bKey === 'rajraman') {
    return `rajraman_${floorName}`
  }

  return floorName
}
