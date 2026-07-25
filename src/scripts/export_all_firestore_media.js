import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'
import { URL } from 'url'

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

fs.mkdirSync(backupDir, { recursive: true })

function sanitizeName(name) {
  return (name || 'Unnamed')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Downloads HTTP/HTTPS URL or copies local path
 */
async function fetchAndSaveMedia(srcUrl, destPath, maxRedirects = 5) {
  if (!srcUrl || typeof srcUrl !== 'string') return false

  // Normalize local path
  if (!srcUrl.startsWith('http://') && !srcUrl.startsWith('https://')) {
    let relativePath = srcUrl
    if (relativePath.startsWith('/')) relativePath = relativePath.slice(1)
    
    const possibleLocalPaths = [
      path.join(projectRoot, 'public', relativePath),
      path.join(projectRoot, relativePath),
      path.join(projectRoot, 'OLD_LOCAL_DATA', 'public-backup', relativePath)
    ]

    for (const p of possibleLocalPaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true })
        fs.copyFileSync(p, destPath)
        return true
      }
    }
    return false
  }

  // Handle remote HTTP/HTTPS download
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve(false)

    try {
      const parsedUrl = new URL(srcUrl)
      const client = parsedUrl.protocol === 'https:' ? https : http

      const req = client.get(srcUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*'
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, srcUrl).toString()
          return fetchAndSaveMedia(redirectUrl, destPath, maxRedirects - 1).then(resolve)
        }

        if (res.statusCode === 200) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true })
          const fileStream = fs.createWriteStream(destPath)
          res.pipe(fileStream)
          fileStream.on('finish', () => {
            fileStream.close(() => resolve(true))
          })
          fileStream.on('error', () => {
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
            resolve(false)
          })
        } else {
          resolve(false)
        }
      })

      req.on('error', () => resolve(false))
      req.setTimeout(10000, () => {
        req.destroy()
        resolve(false)
      })
    } catch (e) {
      resolve(false)
    }
  })
}

async function exportAllFirestoreMedia() {
  console.log('🚀 Starting Complete Firestore Media & Image Export to Google_Drive_Backup...\n')

  const collections = ['layouts', 'directions']
  let totalSaved = 0
  let totalSkipped = 0

  for (const colName of collections) {
    console.log(`🔍 Scanning Firestore Collection: '${colName}'...`)
    const snapshot = await db.collection(colName).get()
    console.log(`   Found ${snapshot.docs.length} documents in '${colName}'.`)

    for (const docSnap of snapshot.docs) {
      const docData = docSnap.data()
      const docId = docSnap.id

      const buildingName = sanitizeName(docData.buildingName || 'General')
      const floorLabel = sanitizeName(docData.label || docId)

      const baseFloorFolder = path.join(backupDir, buildingName, floorLabel)
      const roomsFolder = path.join(baseFloorFolder, 'Rooms')
      const facultyFolder = path.join(baseFloorFolder, 'Faculty')
      const floorPlanFolder = path.join(baseFloorFolder, 'FloorPlans')

      // Save document JSON metadata
      const metaPath = path.join(baseFloorFolder, `${colName}_metadata.json`)
      fs.mkdirSync(baseFloorFolder, { recursive: true })
      fs.writeFileSync(metaPath, JSON.stringify(docData, null, 2))

      // 1. Check Floor Map / Blueprint Image
      if (docData.mapImage) {
        const ext = path.extname(docData.mapImage.split('?')[0]) || '.png'
        const mapDest = path.join(floorPlanFolder, `${floorLabel}_Blueprint${ext}`)
        const ok = await fetchAndSaveMedia(docData.mapImage, mapDest)
        if (ok) {
          totalSaved++
          console.log(`   🗺️ Floor Blueprint Saved: [${buildingName}/${floorLabel}] ${floorLabel}_Blueprint${ext}`)
        }
      }

      // 2. Check Rooms Array
      if (Array.isArray(docData.rooms)) {
        for (const room of docData.rooms) {
          const rName = sanitizeName(room.name || room.label || room.id)
          const roomImg = room.image || room.photo
          if (roomImg) {
            const ext = path.extname(roomImg.split('?')[0]) || '.png'
            const roomDest = path.join(roomsFolder, `${rName}${ext}`)
            const ok = await fetchAndSaveMedia(roomImg, roomDest)
            if (ok) {
              totalSaved++
              console.log(`   ✅ Room Image Saved: [${buildingName}/${floorLabel}/Rooms] ${rName}${ext}`)
            } else {
              totalSkipped++
            }
          }
        }
      }

      // 3. Check Faculty Array
      if (Array.isArray(docData.faculty)) {
        for (const f of docData.faculty) {
          const fName = sanitizeName(f.name || f.id || 'Faculty')
          const fImg = f.avatar || f.photo || f.facultyImage || f.image
          if (fImg) {
            const ext = path.extname(fImg.split('?')[0]) || '.jpg'
            const fDest = path.join(facultyFolder, `${fName}${ext}`)
            const ok = await fetchAndSaveMedia(fImg, fDest)
            if (ok) {
              totalSaved++
              console.log(`   👤 Faculty Image Saved: [${buildingName}/${floorLabel}/Faculty] ${fName}${ext}`)
            } else {
              totalSkipped++
            }
          }
        }
      }
    }
  }

  console.log(`\n🎉 Complete Media Export Finished!`)
  console.log(`   Total Images Exported & Saved: ${totalSaved}`)
  console.log(`   Target Directory: ${backupDir}\n`)
}

exportAllFirestoreMedia().catch(console.error)
