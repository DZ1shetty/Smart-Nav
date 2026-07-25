import admin from 'firebase-admin'
import fs from 'fs'

const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

async function peek() {
  const doc = await db.collection('layouts').doc('Cv-Raman-Fifth-Floor').get()
  if (doc.exists) {
    const data = doc.data()
    console.log('Document ID: Cv-Raman-Fifth-Floor')
    console.log('Rooms:')
    ;(data.rooms || []).forEach(r => {
      console.log(` - ID: ${r.id}, Name: ${r.name}, Coords: (${r.x}, ${r.y}), Size: ${r.w}x${r.h}`)
    })
  } else {
    console.log('Document not found in layouts collection')
  }
}

peek()
