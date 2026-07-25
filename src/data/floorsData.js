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
