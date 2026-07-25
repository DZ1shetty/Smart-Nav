import admin from 'firebase-admin'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function checkAll() {
  const floors = [
    'Svm-Ground-Floor',
    'Svm-First-Floor',
    'Svm-Second-Floor',
    'Svm-Third-Floor',
    'Svm-Fourth-Floor',
    'Svm-Fifth-Floor',
    'Svm-Sixth-Floor'
  ]

  for (const floor of floors) {
    const snap = await db.collection('layouts').doc(floor).get()
    if (snap.exists) {
      const data = snap.data()
      console.log(`Floor: ${floor}`)
      console.log(`  - rooms count: ${data.rooms ? data.rooms.length : 'undefined'}`)
      console.log(`  - buildingName: ${data.buildingName}`)
      console.log(`  - label: ${data.label}`)
    } else {
      console.log(`Floor: ${floor} DOES NOT EXIST`)
    }
  }
  process.exit(0)
}

checkAll()
