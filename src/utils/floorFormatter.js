/**
 * Floor Label Formatter Utility
 * Maps any floor label or key containing numbers/abbreviations to full letters/words
 * (e.g. "1st Floor" -> "FIRST FLOOR") universally.
 */

export const getFloorFullNameInWords = (label) => {
  if (!label) return ''
  const l = label.toLowerCase()
  let base = ''
  if (l.includes('basement')) base = 'BASEMENT'
  else if (l.includes('ground')) base = 'GROUND'
  else if (l.includes('1st') || l.includes('first')) base = 'FIRST'
  else if (l.includes('2nd') || l.includes('second')) base = 'SECOND'
  else if (l.includes('3rd') || l.includes('third')) base = 'THIRD'
  else if (l.includes('4th') || l.includes('fourth')) base = 'FOURTH'
  else if (l.includes('5th') || l.includes('fifth')) base = 'FIFTH'
  else if (l.includes('6th') || l.includes('sixth')) base = 'SIXTH'
  else base = label.toUpperCase().replace(' FLOOR', '')

  return `${base} FLOOR`
}

export const formatFloorKeyToWords = (floorKey) => {
  if (!floorKey) return ''
  const l = floorKey.toLowerCase()
  let block = ''
  if (l.startsWith('cv_raman_')) block = 'CV-RAMAN BLOCK'
  else if (l.startsWith('ramanujan_')) block = 'RAMANUJAN BLOCK'
  else if (l.startsWith('svm_') || l.startsWith('smv_')) block = 'SMV BLOCK'
  else if (l.startsWith('atal_')) block = 'ATAL BLOCK'
  else if (l.startsWith('rajraman_')) block = 'RAJRAMAN BLOCK'
  else block = 'APJ-BLOCK'

  let floor = ''
  if (l.includes('basement')) floor = 'BASEMENT FLOOR'
  else if (l.includes('ground')) floor = 'GROUND FLOOR'
  else if (l.includes('first')) floor = 'FIRST FLOOR'
  else if (l.includes('second')) floor = 'SECOND FLOOR'
  else if (l.includes('third')) floor = 'THIRD FLOOR'
  else if (l.includes('fourth')) floor = 'FOURTH FLOOR'
  else if (l.includes('fifth')) floor = 'FIFTH FLOOR'
  else if (l.includes('sixth')) floor = 'SIXTH FLOOR'
  else floor = floorKey.split('_').pop().toUpperCase() + ' FLOOR'

  return `${block} • ${floor}`
}
