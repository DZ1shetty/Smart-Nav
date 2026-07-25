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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

const backupDir = path.join(projectRoot, 'Google_Drive_Backup')
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true })
}
fs.mkdirSync(backupDir, { recursive: true })

async function downloadOrCopyFile(srcUrl, destPath) {
  if (!srcUrl) return false

  // Handle local relative / absolute public file paths
  if (!srcUrl.startsWith('http://') && !srcUrl.startsWith('https://')) {
    const cleanPath = srcUrl.startsWith('/') ? srcUrl.slice(1) : srcUrl
    const localFile = path.join(projectRoot, 'public', cleanPath)
    if (fs.existsSync(localFile)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      fs.copyFileSync(localFile, destPath)
      return true
    }
    return false
  }

  // Handle remote HTTP/HTTPS URLs
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    const file = fs.createWriteStream(destPath)
    const client = srcUrl.startsWith('https') ? https : http

    client.get(srcUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close(() => resolve(true))
        })
      } else {
        file.close()
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
        resolve(false)
      }
    }).on('error', () => {
      file.close()
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
      resolve(false)
    })
  })
}

function sanitizeName(name) {
  return (name || 'Unnamed')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim()
}

// Regex to discover image URLs inside direction strings
function extractImageUrlsFromText(text) {
  if (!text || typeof text !== 'string') return []
  const matches = text.match(/(https?:\/\/[^\s"']+\.(?:png|jpg|jpeg|svg|webp|gif))/gi)
  return matches || []
}

async function exportFirestoreToDriveStructure() {
  console.log('📦 Exporting ALL Firestore Collections (Rooms, Faculty, Maps & Directions) to Google Drive Backup folder...\n')

  // 1. Fetch directions collection map
  const directionsSnapshot = await db.collection('directions').get()
  const directionsMapByDocId = {}
  directionsSnapshot.forEach(doc => {
    directionsMapByDocId[doc.id] = doc.data()
  })

  // 2. Export Layouts Collection (Rooms, Faculty, Maps & Directions)
  const layoutSnapshot = await db.collection('layouts').get()
  console.log(`Found ${layoutSnapshot.docs.length} floor layout documents in Firestore.\n`)

  let totalRoomsExported = 0
  let totalFacultyExported = 0
  let totalMapsExported = 0
  let totalDirectionImagesExported = 0
  let totalDirectionsExported = 0

  for (const docSnap of layoutSnapshot.docs) {
    const docData = docSnap.data()
    const docId = docSnap.id
    const buildingName = sanitizeName(docData.buildingName || 'GENERAL')
    const floorLabel = sanitizeName(docData.label || docSnap.id)

    const floorFolder = path.join(backupDir, buildingName, floorLabel)
    const roomsFolder = path.join(floorFolder, 'Rooms')
    const facultyFolder = path.join(floorFolder, 'Faculty')
    const mapFolder = path.join(floorFolder, 'Floor_Map')
    const directionsFolder = path.join(floorFolder, 'Directions')

    fs.mkdirSync(roomsFolder, { recursive: true })
    fs.mkdirSync(facultyFolder, { recursive: true })
    fs.mkdirSync(mapFolder, { recursive: true })
    fs.mkdirSync(directionsFolder, { recursive: true })

    // Save metadata manifest
    const manifestPath = path.join(floorFolder, 'layout_metadata.json')
    fs.writeFileSync(manifestPath, JSON.stringify(docData, null, 2))

    // A. Floor Map Background Image
    if (docData.mapImage) {
      const ext = path.extname(docData.mapImage.split('?')[0]) || '.png'
      const destPath = path.join(mapFolder, `Floor_Plan_Blueprint${ext}`)
      const success = await downloadOrCopyFile(docData.mapImage, destPath)
      if (success) {
        totalMapsExported++
        console.log(`  🗺️ Floor Map: [${buildingName}/${floorLabel}] Floor_Plan_Blueprint${ext}`)
      }
    }

    // B. Export Room Images
    const rooms = docData.rooms || []
    for (const room of rooms) {
      const roomName = sanitizeName(room.name || room.label || room.id)
      const imageUrl = room.image || room.photo
      if (imageUrl) {
        const ext = path.extname(imageUrl.split('?')[0]) || '.png'
        const destPath = path.join(roomsFolder, `${roomName}${ext}`)
        const success = await downloadOrCopyFile(imageUrl, destPath)
        if (success) {
          totalRoomsExported++
          console.log(`  ✅ Room Image: [${buildingName}/${floorLabel}] ${roomName}${ext}`)
        }
      }
    }

    // C. Export Faculty Images
    const facultyList = docData.faculty || []
    for (const f of facultyList) {
      const fName = sanitizeName(f.name || f.id || 'Faculty')
      const avatarUrl = f.avatar || f.photo || f.facultyImage || f.image
      if (avatarUrl) {
        const ext = path.extname(avatarUrl.split('?')[0]) || '.jpg'
        const destPath = path.join(facultyFolder, `${fName}${ext}`)
        const success = await downloadOrCopyFile(avatarUrl, destPath)
        if (success) {
          totalFacultyExported++
          console.log(`  👤 Faculty Headshot: [${buildingName}/${floorLabel}] ${fName}${ext}`)
        }
      }
    }

    // D. Export Directions for this floor
    const dirDoc = directionsMapByDocId[docId] || {}
    const dirCollectionMap = dirDoc.directions || {}
    const directionsObj = {}
    const detailedDirections = []

    rooms.forEach(room => {
      const rId = room.id || room.name
      const rName = room.name || room.label || rId
      const dirText = (room.directions && room.directions.trim() !== '')
        ? room.directions
        : (dirCollectionMap[rId] || '')

      if (dirText) {
        directionsObj[rId] = dirText
        detailedDirections.push({
          roomId: rId,
          roomName: rName,
          directions: dirText
        })
        totalDirectionsExported++

        // Extract embedded images in direction text if any
        const embeddedUrls = extractImageUrlsFromText(dirText)
        for (let i = 0; i < embeddedUrls.length; i++) {
          const url = embeddedUrls[i]
          const ext = path.extname(url.split('?')[0]) || '.png'
          const destPath = path.join(directionsFolder, `${rId}_direction_${i + 1}${ext}`)
          downloadOrCopyFile(url, destPath).then(ok => {
            if (ok) totalDirectionImagesExported++
          })
        }
      }
    })

    const directionsData = {
      buildingName,
      floorLabel,
      floorId: docData.floorId || docId,
      lastUpdated: new Date().toISOString(),
      directions: directionsObj,
      detailedDirections
    }

    // Write directions.json at floor level and inside Directions/
    fs.writeFileSync(path.join(floorFolder, 'directions.json'), JSON.stringify(directionsData, null, 2))
    fs.writeFileSync(path.join(directionsFolder, 'directions.json'), JSON.stringify(directionsData, null, 2))

    let txtContent = `========================================================\n`
    txtContent += `DIRECTIONS FOR ${buildingName.toUpperCase()} - ${floorLabel.toUpperCase()}\n`
    txtContent += `========================================================\n\n`
    detailedDirections.forEach((item, index) => {
      txtContent += `${index + 1}. ${item.roomName} (ID: ${item.roomId})\n`
      txtContent += `   Directions: ${item.directions}\n\n`
    })
    fs.writeFileSync(path.join(directionsFolder, 'directions.txt'), txtContent)
    console.log(`  🧭 Directions Exported: [${buildingName}/${floorLabel}] (${detailedDirections.length} room directions)`)
  }

  console.log(`\n✨ Export complete!`)
  console.log(`   • Room Images: ${totalRoomsExported}`)
  console.log(`   • Faculty Headshots: ${totalFacultyExported}`)
  console.log(`   • Floor Blueprint Maps: ${totalMapsExported}`)
  console.log(`   • Total Room Directions Exported: ${totalDirectionsExported}`)
  console.log(`   • Direction Images: ${totalDirectionImagesExported}`)
  console.log(`📁 Structured Backup Directory: ${backupDir}`)

  // Create ZIP Archive via PowerShell for 1-click Google Drive upload
  const zipPath = path.join(projectRoot, 'Campus_Navigation_Firestore_Drive_Backup.zip')
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

  try {
    console.log('⚡ Generating Google Drive Backup ZIP Archive...')
    execSync(`powershell -Command "Compress-Archive -Path '${backupDir}\\*' -DestinationPath '${zipPath}' -Force"`)
    const stats = fs.statSync(zipPath)
    console.log(`\n🎁 Created ZIP Archive for Google Drive Upload: ${zipPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
  } catch (err) {
    console.warn('Zip creation warning:', err.message)
  }
}

exportFirestoreToDriveStructure().catch(console.error)

