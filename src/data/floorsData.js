/**
 * Floor Data Index — Combined Building Registry (Code-Split Async Version)
 *
 * Defines loader functions that return dynamic import Promises.
 * This prevents loading all 30+ floor configurations at startup,
 * keeping the initial bundle size small and loading instant.
 */

export const floorsData = {
  // APJ Block
  basement: () => import('./apj-block/basement.js').then(m => m.basement),
  ground: () => import('./apj-block/ground.js').then(m => m.ground),
  first: () => import('./apj-block/first.js').then(m => m.first),
  second: () => import('./apj-block/second.js').then(m => m.second),
  third: () => import('./apj-block/third.js').then(m => m.third),
  fourth: () => import('./apj-block/fourth.js').then(m => m.fourth),
  fifth: () => import('./apj-block/fifth.js').then(m => m.fifth),

  // CV-Raman Block
  cv_raman_basement: () => import('./cv-raman-block/basement.js').then(m => m.basement),
  cv_raman_ground: () => import('./cv-raman-block/ground.js').then(m => m.ground),
  cv_raman_first: () => import('./cv-raman-block/first.js').then(m => m.first),
  cv_raman_second: () => import('./cv-raman-block/second.js').then(m => m.second),
  cv_raman_third: () => import('./cv-raman-block/third.js').then(m => m.third),
  cv_raman_fourth: () => import('./cv-raman-block/fourth.js').then(m => m.fourth),
  cv_raman_fifth: () => import('./cv-raman-block/fifth.js').then(m => m.fifth),

  // Ramanujan Block
  ramanujan_ground: () => import('./ramanujan-block/ground.js').then(m => m.ground),
  ramanujan_first: () => import('./ramanujan-block/first.js').then(m => m.first),
  ramanujan_second: () => import('./ramanujan-block/second.js').then(m => m.second),
  ramanujan_third: () => import('./ramanujan-block/third.js').then(m => m.third),
  ramanujan_fourth: () => import('./ramanujan-block/fourth.js').then(m => m.fourth),

  // SMV Block
  smv_ground: () => import('./smv-block/ground.js').then(m => m.ground),
  smv_first: () => import('./smv-block/first.js').then(m => m.first),
  smv_second: () => import('./smv-block/second.js').then(m => m.second),
  smv_third: () => import('./smv-block/third.js').then(m => m.third),
  smv_fourth: () => import('./smv-block/fourth.js').then(m => m.fourth),
  smv_fifth: () => import('./smv-block/fifth.js').then(m => m.fifth),
  smv_sixth: () => import('./smv-block/sixth.js').then(m => m.sixth),

  // Backwards compatibility fallbacks (SVM mapped to SMV)
  svm_ground: () => import('./smv-block/ground.js').then(m => m.ground),
  svm_first: () => import('./smv-block/first.js').then(m => m.first),
  svm_second: () => import('./smv-block/second.js').then(m => m.second),
  svm_third: () => import('./smv-block/third.js').then(m => m.third),
  svm_fourth: () => import('./smv-block/fourth.js').then(m => m.fourth),
  svm_fifth: () => import('./smv-block/fifth.js').then(m => m.fifth),
  svm_sixth: () => import('./smv-block/sixth.js').then(m => m.sixth),

  // APJ Block aliases
  apj_basement: () => import('./apj-block/basement.js').then(m => m.basement),
  apj_ground: () => import('./apj-block/ground.js').then(m => m.ground),
  apj_first: () => import('./apj-block/first.js').then(m => m.first),
  apj_second: () => import('./apj-block/second.js').then(m => m.second),
  apj_third: () => import('./apj-block/third.js').then(m => m.third),
  apj_fourth: () => import('./apj-block/fourth.js').then(m => m.fourth),
  apj_fifth: () => import('./apj-block/fifth.js').then(m => m.fifth),

  // Atal Block
  atal_ground: () => import('./atal-block/ground.js').then(m => m.ground),
  atal_first: () => import('./atal-block/first.js').then(m => m.first),
  atal_second: () => import('./atal-block/second.js').then(m => m.second),
  atal_third: () => import('./atal-block/third.js').then(m => m.third),

  // Rajraman Block
  rajraman_ground: () => import('./rajraman-block/ground.js').then(m => m.ground),
  rajraman_first: () => import('./rajraman-block/first.js').then(m => m.first),
  rajraman_second: () => import('./rajraman-block/second.js').then(m => m.second),
  rajraman_third: () => import('./rajraman-block/third.js').then(m => m.third),
}

/**
 * Resilient loader getter: maps any floor ID string (e.g. 'fifth', 'APJ-Fifth-Floor', 'apj_fifth')
 * to its corresponding static module loader without throwing missing loader errors.
 */
export const getFloorDataLoader = (floorId) => {
  if (!floorId) return floorsData['ground']
  
  // Custom Smart Builder floors — no static data, handled by Firestore exclusively
  if (floorId.includes('_floor_')) return null
  
  if (floorsData[floorId]) return floorsData[floorId]

  const norm = floorId.toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (floorsData[norm]) return floorsData[norm]

  if (norm.startsWith('apj_') || norm.startsWith('apj')) {
    const cleanFloor = norm.replace(/^apj_?/, '')
    if (floorsData[cleanFloor]) return floorsData[cleanFloor]
  }

  if (norm.includes('fifth') || norm.includes('5th') || norm === '5') {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_fifth']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_fifth']
    if (norm.includes('rajraman')) return floorsData['rajraman_fifth']
    return floorsData['fifth']
  }
  if (norm.includes('fourth') || norm.includes('4th') || norm === '4') {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_fourth']
    if (norm.includes('ramanujan')) return floorsData['ramanujan_fourth']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_fourth']
    if (norm.includes('rajraman')) return floorsData['rajraman_fourth']
    return floorsData['fourth']
  }
  if (norm.includes('third') || norm.includes('3rd') || norm === '3') {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_third']
    if (norm.includes('ramanujan')) return floorsData['ramanujan_third']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_third']
    if (norm.includes('atal')) return floorsData['atal_third']
    if (norm.includes('rajraman')) return floorsData['rajraman_third']
    return floorsData['third']
  }
  if (norm.includes('second') || norm.includes('2nd') || norm === '2') {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_second']
    if (norm.includes('ramanujan')) return floorsData['ramanujan_second']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_second']
    if (norm.includes('atal')) return floorsData['atal_second']
    if (norm.includes('rajraman')) return floorsData['rajraman_second']
    return floorsData['second']
  }
  if (norm.includes('first') || norm.includes('1st') || norm === '1') {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_first']
    if (norm.includes('ramanujan')) return floorsData['ramanujan_first']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_first']
    if (norm.includes('atal')) return floorsData['atal_first']
    if (norm.includes('rajraman')) return floorsData['rajraman_first']
    return floorsData['first']
  }
  if (norm.includes('ground') || norm.includes('g')) {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_ground']
    if (norm.includes('ramanujan')) return floorsData['ramanujan_ground']
    if (norm.includes('smv') || norm.includes('svm')) return floorsData['smv_ground']
    if (norm.includes('atal')) return floorsData['atal_ground']
    if (norm.includes('rajraman')) return floorsData['rajraman_ground']
    return floorsData['ground']
  }
  if (norm.includes('basement') || norm.includes('b')) {
    if (norm.includes('cv_raman') || norm.includes('cvraman')) return floorsData['cv_raman_basement']
    return floorsData['basement']
  }

  // Unknown floor ID — return null instead of defaulting to APJ Ground
  return null
}

