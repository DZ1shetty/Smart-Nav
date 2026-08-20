import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')
const serviceAccountPath = path.join(projectRoot, 'serviceAccountKey.json')

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

async function checkCvRaman() {
  const doc = await db.collection('layouts').doc('Cv-Raman-Second-Floor').get()
  if (doc.exists) {
    const rooms = doc.data().rooms || []
    console.log('Cv-Raman-Second-Floor rooms count:', rooms.length)
    rooms.forEach(r => {
      console.log(`Room [${r.id}] Name: "${r.name || r.label}" Image: "${r.image}"`)
    })
  } else {
    console.log('Doc Cv-Raman-Second-Floor not found')
  }
}

checkCvRaman().then(() => process.exit(0))
