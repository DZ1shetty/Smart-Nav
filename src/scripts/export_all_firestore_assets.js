import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'
import { execSync } from 'child_process'

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

const backupDir = path.join(projectRoot, 'Google_Drive_Backup')
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true })
}
fs.mkdirSync(backupDir, { recursive: true })

function downloadOrCopyFile(srcUrl, destPath) {
  if (!srcUrl || typeof srcUrl !== 'string') return Promise.resolve(false)

  if (srcUrl.includes('placehold.co') || srcUrl.includes('via.placeholder.com')) {
    return Promise.resolve(false)
  }

  if (!srcUrl.startsWith('http://') && !srcUrl.startsWith('https://')) {
    const cleanPath = srcUrl.startsWith('/') ? srcUrl.slice(1) : srcUrl
    const localFile = path.join(projectRoot, 'public', cleanPath)
    if (fs.existsSync(localFile)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      fs.copyFileSync(localFile, destPath)
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }

    const client = srcUrl.startsWith('https') ? https : http

    client.get(srcUrl, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadOrCopyFile(res.headers.location, destPath).then(resolve)
      }

      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath)
        res.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close(() => resolve(true))
        })
      } else {
        resolve(false)
      }
    }).on('error', () => {
      resolve(false)
    })
  })
}

function sanitizeName(name) {
  return (name || 'Unnamed')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim()
}

async function exportAllFirestoreAssets() {
  console.log('🚀 Starting Comprehensive Firestore Image Export to Google_Drive_Backup...\n')

  const snapshot = await db.collection('layouts').get()
  console.log(`Found ${snapshot.docs.length} floor layout documents in Firestore.\n`)

  let totalSaved = 0

  for (const docSnap of snapshot.docs) {
    const docData = docSnap.data()
    const docId = docSnap.id
    const buildingName = sanitizeName(docData.buildingName || 'GENERAL_BUILDING')
    const floorLabel = sanitizeName(docData.label || docId)

    const floorFolder = path.join(backupDir, buildingName, floorLabel)
    const mapsFolder = path.join(floorFolder, 'Floor_Maps')
    const roomsFolder = path.join(floorFolder, 'Rooms')
    const facultyFolder = path.join(floorFolder, 'Faculty')

    fs.mkdirSync(floorFolder, { recursive: true })

    // Save document JSON
    fs.writeFileSync(
      path.join(floorFolder, `${docId}_firestore_doc.json`),
      JSON.stringify(docData, null, 2)
    )

    // 1. Map Image
    if (docData.mapImage) {
      const mapUrl = docData.mapImage
      const ext = path.extname(mapUrl.split('?')[0]) || '.png'
      const destPath = path.join(mapsFolder, `${floorLabel}_Map${ext}`)
      const ok = await downloadOrCopyFile(mapUrl, destPath)
      if (ok) {
        totalSaved++
        console.log(`  🗺️ Map Image: [${buildingName}/${floorLabel}] ${floorLabel}_Map${ext}`)
      }
    }

    // 2. Rooms
    const rooms = docData.rooms || []
    for (const room of rooms) {
      const roomName = sanitizeName(room.name || room.label || room.id)
      const roomImg = room.image || room.photo
      if (roomImg) {
        const ext = path.extname(roomImg.split('?')[0]) || '.png'
        const destPath = path.join(roomsFolder, `${roomName}${ext}`)
        const ok = await downloadOrCopyFile(roomImg, destPath)
        if (ok) {
          totalSaved++
          console.log(`  🚪 Room Image: [${buildingName}/${floorLabel}] ${roomName}${ext}`)
        }
      }
    }

    // 3. Faculty
    const facultyList = docData.faculty || []
    for (const f of facultyList) {
      const fName = sanitizeName(f.name || f.id || 'Faculty')
      
      const avatarUrl = f.avatar || f.photo || f.facultyImage
      if (avatarUrl) {
        const ext = path.extname(avatarUrl.split('?')[0]) || '.jpg'
        const destPath = path.join(facultyFolder, `${fName}${ext}`)
        const ok = await downloadOrCopyFile(avatarUrl, destPath)
        if (ok) {
          totalSaved++
          console.log(`  👤 Faculty Headshot: [${buildingName}/${floorLabel}] ${fName}${ext}`)
        }
      }

      if (f.image && f.image !== f.avatar) {
        const ext = path.extname(f.image.split('?')[0]) || '.png'
        const destPath = path.join(facultyFolder, `${fName}_DoorPhoto${ext}`)
        const ok = await downloadOrCopyFile(f.image, destPath)
        if (ok) {
          totalSaved++
          console.log(`  🚪 Faculty Door Photo: [${buildingName}/${floorLabel}] ${fName}_DoorPhoto${ext}`)
        }
      }
    }
  }

  console.log(`\n🎉 Comprehensive Export Complete! Total Files Saved: ${totalSaved}`)
  console.log(`📁 Backup Folder: ${backupDir}`)

  const zipPath = path.join(projectRoot, 'Campus_Navigation_Firestore_Drive_Backup.zip')
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

  try {
    console.log('⚡ Creating ZIP Archive for Google Drive Upload...')
    execSync(`powershell -Command "Compress-Archive -Path '${backupDir}\\*' -DestinationPath '${zipPath}' -Force"`)
    const stats = fs.statSync(zipPath)
    console.log(`\n🎁 ZIP Archive Ready: ${zipPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
  } catch (e) {
    console.warn('Zip warning:', e.message)
  }
}

exportAllFirestoreAssets().catch(console.error)
