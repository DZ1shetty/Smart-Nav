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
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

// Helper to fix image URL strings
function fixImageUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Replace legacy public-backup or OLD_LOCAL_DATA paths with /public/
  let fixed = url;
  if (fixed.includes('/OLD_LOCAL_DATA/public-backup/')) {
    fixed = fixed.replaceAll('/OLD_LOCAL_DATA/public-backup/', '/public/');
  }
  if (fixed.includes('/public-backup/')) {
    fixed = fixed.replaceAll('/public-backup/', '/public/');
  }
  if (fixed.includes('/Smart_Nav/')) {
    fixed = fixed.replaceAll('/Smart_Nav/', '/Smart-Nav/');
  }
  return fixed;
}

async function fixAllFirestoreLayouts() {
  console.log('=== FIXING FIRESTORE LAYOUT ROOM IMAGES ===\n')
  const snap = await db.collection('layouts').get()
  
  let totalFixedDocs = 0
  let totalFixedRooms = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    const docId = doc.id
    const rooms = data.rooms || []
    let docChanged = false

    const updatedRooms = rooms.map(room => {
      const newRoom = { ...room }
      
      if (room.image) {
        const fixed = fixImageUrl(room.image)
        if (fixed !== room.image) {
          console.log(`  ✏️  [${docId}] Room ${room.id}: fixed image -> "${fixed}"`)
          newRoom.image = fixed
          docChanged = true
          totalFixedRooms++
        }
      }

      if (Array.isArray(room.images)) {
        const fixedImgs = room.images.map(img => fixImageUrl(img))
        if (JSON.stringify(fixedImgs) !== JSON.stringify(room.images)) {
          newRoom.images = fixedImgs
          docChanged = true
        }
      }

      return newRoom
    })

    if (docChanged) {
      await db.collection('layouts').doc(docId).update({ rooms: updatedRooms })
      totalFixedDocs++
      console.log(`✅ Updated Firestore document [${docId}]`)
    }
  }

  console.log(`\n🎉 Firestore repair complete: ${totalFixedDocs} documents updated, ${totalFixedRooms} room image URLs repaired.\n`)
}

function fixStaticDataFiles() {
  console.log('=== FIXING STATIC DATA FILES IN src/data/ ===\n')
  const dataDir = path.join(projectRoot, 'src', 'data')
  const blockDirs = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory())

  let totalFilesUpdated = 0

  for (const block of blockDirs) {
    const blockPath = path.join(dataDir, block)
    const files = fs.readdirSync(blockPath).filter(f => f.endsWith('.js'))

    for (const file of files) {
      const filePath = path.join(blockPath, file)
      let content = fs.readFileSync(filePath, 'utf8')
      const original = content

      if (content.includes('/OLD_LOCAL_DATA/public-backup/')) {
        content = content.replaceAll('/OLD_LOCAL_DATA/public-backup/', '/public/')
      }
      if (content.includes('/public-backup/')) {
        content = content.replaceAll('/public-backup/', '/public/')
      }
      if (content.includes('/Smart_Nav/')) {
        content = content.replaceAll('/Smart_Nav/', '/Smart-Nav/')
      }

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8')
        totalFilesUpdated++
        console.log(`  ✏️ Updated static file: src/data/${block}/${file}`)
      }
    }
  }

  console.log(`\n🎉 Static data repair complete: ${totalFilesUpdated} static files updated.\n`)
}

async function run() {
  await fixAllFirestoreLayouts()
  fixStaticDataFiles()
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); })
