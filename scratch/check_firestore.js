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

async function check() {
  const layoutSnap = await db.collection('layouts').doc('Svm-Sixth-Floor').get()
  const directionsSnap = await db.collection('directions').doc('Svm-Sixth-Floor').get()
  
  if (layoutSnap.exists) {
    const data = layoutSnap.data()
    console.log('--- LAYOUT ROOMS ---')
    console.log(JSON.stringify(data.rooms.map(r => ({
      id: r.id,
      name: r.name,
      label: r.label,
      description: r.description,
      directions: r.directions,
      image: r.image
    })), null, 2))
    console.log('--- FACULTY ---')
    console.log(JSON.stringify(data.faculty || [], null, 2))
  } else {
    console.log('Document Svm-Fifth-Floor layout does not exist!')
  }

  if (directionsSnap.exists) {
    const data = directionsSnap.data()
    console.log('--- DIRECTIONS ---')
    console.log(JSON.stringify(data.directions, null, 2))
  } else {
    console.log('Document Svm-Fifth-Floor directions does not exist!')
  }
  process.exit(0)
}

check()

