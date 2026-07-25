import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

async function exportDirectionsToDriveBackup() {
  console.log('🚀 Exporting directions to Google_Drive_Backup...')

  const backupDir = path.join(__dirname, '../../Google_Drive_Backup')
  
  const layoutsSnap = await db.collection('layouts').get()
  const directionsSnap = await db.collection('directions').get()

  const directionsMapByDocId = {}
  directionsSnap.forEach(doc => {
    directionsMapByDocId[doc.id] = doc.data()
  })

  let exportedFloors = 0
  let totalRoomsWithDirections = 0

  for (const docSnap of layoutsSnap.docs) {
    const layoutData = docSnap.data()
    const docId = docSnap.id
    const buildingName = (layoutData.buildingName || 'GENERAL').trim()
    const floorLabel = (layoutData.label || docId).trim()

    // Determine floor directory in Google_Drive_Backup
    // Note: check for existing matching folder in building dir
    const buildingDir = path.join(backupDir, buildingName)
    if (!fs.existsSync(buildingDir)) {
      fs.mkdirSync(buildingDir, { recursive: true })
    }

    // Match floor directory case-insensitively or exact
    let floorDir = path.join(buildingDir, floorLabel)
    if (fs.existsSync(buildingDir)) {
      const existingDirs = fs.readdirSync(buildingDir)
      const match = existingDirs.find(d => d.toLowerCase() === floorLabel.toLowerCase())
      if (match) {
        floorDir = path.join(buildingDir, match)
      }
    }
    fs.mkdirSync(floorDir, { recursive: true })

    // Gather directions from both layout rooms and directions collection
    const dirDoc = directionsMapByDocId[docId] || {}
    const dirCollectionMap = dirDoc.directions || {}

    const rooms = layoutData.rooms || []
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
        totalRoomsWithDirections++
      }
    })

    // Also check if dirCollectionMap has rooms not in rooms array
    for (const [rId, dirText] of Object.entries(dirCollectionMap)) {
      if (dirText && !directionsObj[rId]) {
        directionsObj[rId] = dirText
        detailedDirections.push({
          roomId: rId,
          roomName: rId,
          directions: dirText
        })
        totalRoomsWithDirections++
      }
    }

    // 1. Write directions.json in floorDir
    const directionsData = {
      buildingName,
      floorLabel,
      floorId: layoutData.floorId || docId,
      lastUpdated: new Date().toISOString(),
      directions: directionsObj,
      detailedDirections
    }

    fs.writeFileSync(
      path.join(floorDir, 'directions.json'),
      JSON.stringify(directionsData, null, 2)
    )

    // 2. Write Directions folder with directions.json & directions.txt
    const directionsFolder = path.join(floorDir, 'Directions')
    fs.mkdirSync(directionsFolder, { recursive: true })

    fs.writeFileSync(
      path.join(directionsFolder, 'directions.json'),
      JSON.stringify(directionsData, null, 2)
    )

    // Generate human-readable directions.txt
    let txtContent = `========================================================\n`
    txtContent += `DIRECTIONS FOR ${buildingName.toUpperCase()} - ${floorLabel.toUpperCase()}\n`
    txtContent += `========================================================\n\n`

    if (detailedDirections.length === 0) {
      txtContent += `No specific room directions configured for this floor.\n`
    } else {
      detailedDirections.forEach((item, index) => {
        txtContent += `${index + 1}. ${item.roomName} (ID: ${item.roomId})\n`
        txtContent += `   Directions: ${item.directions}\n\n`
      })
    }

    fs.writeFileSync(
      path.join(directionsFolder, 'directions.txt'),
      txtContent
    )

    exportedFloors++
    console.log(`✅ Exported directions for [${buildingName}] ${floorLabel} (${detailedDirections.length} rooms)`)
  }

  console.log(`\n🎉 Successfully exported directions for ${exportedFloors} floors across all buildings!`)
  console.log(`Total room directions exported: ${totalRoomsWithDirections}`)
}

exportDirectionsToDriveBackup().catch(console.error).then(() => process.exit(0))
