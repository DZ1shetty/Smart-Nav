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

async function findCcl41() {
  const snap = await db.collection('layouts').get()
  snap.forEach(doc => {
    const data = doc.data()
    const rooms = data.rooms || []
    rooms.forEach(r => {
      if (r.image && r.image.includes('ccl41')) {
        console.log(`FOUND CCL41 in Doc [${doc.id}]: Room ID="${r.id}" Name="${r.name || r.label}" Image="${r.image}"`)
      }
    })
  })
}

findCcl41().then(() => process.exit(0))
