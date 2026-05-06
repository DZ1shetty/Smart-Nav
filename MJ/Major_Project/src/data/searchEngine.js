/**
 * GOD-LEVEL NAVIGATION SEARCH ENGINE (Core Engine v3.0)
 * 
 * Hyper-optimized search with contiguous subsequence matching, 
 * word-boundary detection, and multi-vector ranking.
 */

import { floorsData } from './floorsData';

/// --- ENGINE CONFIG ---
const SCHEMA_VERSION = "3.0";
const CONFIDENCE_THRESHOLD = 25;

// Internal Cache for the Search Pool
let SEARCH_POOL_CACHE = null;
let DYNAMIC_FLOORS_DATA = null;

/**
 * Updates the search engine with dynamic data from Firestore.
 */
export const updateSearchData = (dynamicData) => {
  DYNAMIC_FLOORS_DATA = dynamicData;
  SEARCH_POOL_CACHE = null; // Invalidate cache
};

/**
 * Pre-indexes all searchable items into a flat, efficient pool.
 */
const buildSearchPool = () => {
  if (SEARCH_POOL_CACHE) return SEARCH_POOL_CACHE;

  const activeData = DYNAMIC_FLOORS_DATA || floorsData;
  const facultyMap = {};
  
  Object.entries(activeData).forEach(([floorKey, floorInfo]) => {
    floorInfo.faculty?.forEach(fac => {
      if (!facultyMap[fac.roomId]) facultyMap[fac.roomId] = [];
      facultyMap[fac.roomId].push(fac.name);
    });
  });

  const pool = [];
  Object.entries(activeData).forEach(([floorKey, floorInfo]) => {
    // Index Rooms
    floorInfo.rooms?.forEach(room => {
      const linkedFaculty = facultyMap[room.id] || [];
      pool.push({
        id: room.id,
        name: room.name,
        type: room.type || 'room',
        floorKey,
        floorLabel: floorInfo.label,
        linkedFaculty: linkedFaculty,
        faculty: room.faculty,
        tags: room.tags || [],
        department: room.department,
        directions: room.directions || "",
        // Semantic searchable string
        searchable: `${room.name} ${room.faculty || ''} ${linkedFaculty.join(' ')} ${room.type} ${room.department || ''} ${room.directions || ''} ${room.tags?.join(' ') || ''}`.toLowerCase()
      });
    });

    // Index Faculty (Explicit Entries)
    floorInfo.faculty?.forEach(fac => {
      const room = floorInfo.rooms?.find(r => r.id === fac.roomId);
      pool.push({
        id: fac.roomId,
        name: fac.name,
        type: 'faculty',
        floorKey,
        floorLabel: floorInfo.label,
        roomName: room?.name || 'Staff Area',
        directions: room?.directions || "",
        searchable: `${fac.name} ${fac.department || ''} ${fac.designation || ''} ${room?.name || ''}`.toLowerCase()
      });
    });
  });

  SEARCH_POOL_CACHE = pool;
  return pool;
};

/**
 * 'God-Level' Fuzzy Scoring Algorithm
 * Uses contiguous subsequence matching and word-boundary priority.
 */
const getGodLevelScore = (target, query) => {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  
  if (t === q) return 1000; // Absolute Perfect Match
  if (t.startsWith(q)) return 800 + q.length * 10; // Strong Prefix

  // Skeleton Match (Ignore non-alphanumeric)
  const skeletonT = t.replace(/[^a-z0-9]/g, '');
  const skeletonQ = q.replace(/[^a-z0-9]/g, '');
  if (skeletonT === skeletonQ) return 950;
  if (skeletonT.startsWith(skeletonQ)) return 750 + skeletonQ.length * 5;
  
  // Word Boundary Priority (e.g., 'btl' matching 'BTL 05')
  const words = t.split(/[\s\-_]+/);
  for (const word of words) {
    const skeletonWord = word.replace(/[^a-z0-9]/g, '');
    if (word.startsWith(q) || skeletonWord.startsWith(skeletonQ)) return 700 + q.length * 5;
  }

  // Contiguous Subsequence Matching
  let score = 0;
  let qIdx = 0;
  let lastTIdx = -1;
  let contiguousCount = 0;
  
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      // Check if this match is contiguous with the last one
      if (lastTIdx === i - 1) {
        contiguousCount++;
      } else {
        contiguousCount = 0;
      }
      
      score += (10 + contiguousCount * 20);
      lastTIdx = i;
      qIdx++;
    }
  }

  // Full Subsequence Found
  if (qIdx === q.length) {
    const coverage = q.length / t.length;
    const finalScore = (score * 0.4) + (coverage * 150);
    return Math.min(600, finalScore);
  }

  return 0;
};

/**
 * Main Resolver
 */
export const resolveNavigationQuery = (query, context = {}) => {
  if (!query || query.trim().length < 1) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const pool = buildSearchPool();
  
  const results = pool.map(item => {
    // 1. Calculate Primary Score (Direct Name Match)
    const primaryScore = getGodLevelScore(item.name, normalizedQuery);
    
    // 2. Keyword/Semantic Score
    let semanticScore = 0;
    const keywords = item.searchable.split(' ');
    for (const word of keywords) {
      const s = getGodLevelScore(word, normalizedQuery);
      if (s > semanticScore) semanticScore = s;
    }

    // 3. Signal Fusion
    let totalScore = Math.max(primaryScore, semanticScore * 0.8);

    // Dynamic Contextual Boosts
    if (item.floorKey === context.currentFloor) totalScore *= 1.1; // 10% Floor Proximity Boost
    if (item.name.toLowerCase().includes('btl')) totalScore += 50; // Priority for Labs
    if (item.type === 'faculty') totalScore += 20; // Slight boost for personnel

    // Map to 0-100 scale for UI
    const finalConfidence = Math.min(100, (totalScore / 1000) * 100);

    // 4. Intelligence-Driven Formatting
    let description = "";
    if (item.type === 'faculty') {
      description = `Faculty member in ${item.roomName} (${item.floorLabel}).`;
    } else {
      const staff = item.linkedFaculty?.length > 0 
        ? item.linkedFaculty[0] 
        : (item.faculty || null);
      description = `${item.type.replace('_', ' ')} on ${item.floorLabel}${staff ? ` • Managed by ${staff}` : ''}`;
    }

    return {
      id: item.id,
      title: item.name,
      url: `/floor/${item.floorKey}?room=${item.id}${item.type === 'faculty' ? `&faculty=${encodeURIComponent(item.name)}` : ''}`,
      description,
      directions: item.directions,
      confidence_score: Math.round(finalConfidence),
      category_tags: [item.type, item.floorKey]
    };
  })
  .filter(r => r.confidence_score >= CONFIDENCE_THRESHOLD)
  .sort((a, b) => b.confidence_score - a.confidence_score);

  if (results.length === 0) return null;

  const topResult = results[0];
  topResult.alternatives = results.slice(1, 8);
  
  return topResult;
};
