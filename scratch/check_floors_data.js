import { floorsData } from '../src/data/floorsData.js'

console.log('Available keys in floorsData:')
console.log(Object.keys(floorsData))

console.log('\nChecking svm_third:')
console.log(floorsData.svm_third ? 'Exists!' : 'UNDEFINED')

console.log('\nChecking all svm keys:')
for (const key of Object.keys(floorsData)) {
  if (key.startsWith('svm_')) {
    console.log(`- ${key}: ${floorsData[key] ? 'Defined' : 'Undefined'} (building: ${floorsData[key]?.buildingName}, rooms: ${floorsData[key]?.rooms?.length})`)
  }
}
process.exit(0)
