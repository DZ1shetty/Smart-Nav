import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')
const serviceAccountPath = path.join(projectRoot, 'serviceAccountKey.json')

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath)
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

async function inspectFirestore() {
  console.log('=== INSPECTING ALL FIRESTORE FLOOR LAYOUT DOCUMENTS ===\n')
  const snap = await db.collection('layouts').get()
  
  console.log(`Found ${snap.docs.length} layout documents in Firestore.\n`)

  const mismatchedOrSuspicious = []

  snap.forEach(doc => {
    const data = doc.data()
    const docId = doc.id
    const rooms = data.rooms || []
    
    console.log(`\nDoc: [${docId}] (Building: ${data.buildingName}, Floor: ${data.label}) - Total Rooms: ${rooms.length}`)
    
    rooms.forEach(r => {
      const img = r.image || ''
      const imgs = r.images || []
      
      // Check for suspicious images like ccl41_door, placeholder, or mismatched names
      if (img.includes('ccl41') || img.includes('placehold') || !img) {
        mismatchedOrSuspicious.push({
          docId,
          building: data.buildingName,
          floor: data.label,
          roomId: r.id,
          roomName: r.name || r.label,
          currentImage: img
        })
      }
      console.log(`   - Room [${r.id}] ("${r.name || r.label}") -> image: "${img}"`)
    })
  })

  console.log('\n==================================================')
  console.log(`SUMMARY: ${mismatchedOrSuspicious.length} rooms have suspicious/missing/mismatched images in Firestore.`)
  console.log('==================================================')
  mismatchedOrSuspicious.forEach(m => {
    console.log(`[${m.docId}] Room "${m.roomId}" (${m.roomName}) => "${m.currentImage}"`)
  })
}

inspectFirestore().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); })
