import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function readAtalGround() {
  const docRef = db.collection('layouts').doc('Atal-Ground-Floor')
  const snap = await docRef.get()
  if (snap.exists) {
    console.log(JSON.stringify(snap.data(), null, 2))
  } else {
    console.log('Document not found')
  }
  process.exit(0)
}

readAtalGround()
