/**
 * repair_firestore.js
 *
 * Admin script that syncs ALL building floor data from static files into Firestore.
 * Run with: node src/scripts/repair_firestore.js
 *
 * Firestore Structure (organised hierarchy):
 *   Collection: layouts
 *     Documents (per floor, named like "APJ-Ground-Floor", "Cv-Raman-First-Floor", etc.)
 *       Fields: floorId, buildingName, label, rooms[], faculty[], boundaryVertices[], locked, lastEdited
 *
 *   Collection: directions
 *     Documents (same names as layouts)
 *       Fields: floorId, directions{roomId: text}, lastUpdated
 *
 * Buildings covered:
 *   1. APJ-BLOCK          → prefix: (none / bare floor name)
 *   2. CV-RAMAN-BLOCK     → prefix: cv_raman_
 *   3. RAMANUJAN-BLOCK    → prefix: ramanujan_
 *   4. SVM-BLOCK          → prefix: svm_
 *   5. ATAL-BLOCK         → prefix: atal_
 *   6. V . RAJRAMAN-BLOCK → prefix: rajraman_
 */

import admin from 'firebase-admin'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── APJ BLOCK ──────────────────────────────────────────────────────────────
import { basement }  from '../data/apj-block/basement.js'
import { ground }    from '../data/apj-block/ground.js'
import { first }     from '../data/apj-block/first.js'
import { second }    from '../data/apj-block/second.js'
import { third }     from '../data/apj-block/third.js'
import { fourth }    from '../data/apj-block/fourth.js'
import { fifth }     from '../data/apj-block/fifth.js'

// ── CV-RAMAN BLOCK ─────────────────────────────────────────────────────────
import { basement as cv_raman_basement } from '../data/cv-raman-block/basement.js'
import { ground   as cv_raman_ground   } from '../data/cv-raman-block/ground.js'
import { first    as cv_raman_first    } from '../data/cv-raman-block/first.js'
import { second   as cv_raman_second   } from '../data/cv-raman-block/second.js'
import { third    as cv_raman_third    } from '../data/cv-raman-block/third.js'
import { fourth   as cv_raman_fourth   } from '../data/cv-raman-block/fourth.js'
import { fifth    as cv_raman_fifth    } from '../data/cv-raman-block/fifth.js'

// ── RAMANUJAN BLOCK ────────────────────────────────────────────────────────
import * as ramanujan from '../data/ramanujan-block/floors.js'

// ── SMV BLOCK ──────────────────────────────────────────────────────────────
import * as smv from '../data/smv-block/floors.js'

// ── ATAL BLOCK ─────────────────────────────────────────────────────────────
import * as atal from '../data/atal-block/floors.js'

// ── V . RAJRAMAN-BLOCK ─────────────────────────────────────────────────────
import * as rajraman from '../data/rajraman-block/floors.js'

// ── SERVICE ACCOUNT ────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

/**
 * Converts a floorId into its Firestore document name.
 * Follows a consistent naming convention:
 *   "ground"              → "Ground-Floor"
 *   "cv_raman_ground"     → "Cv-Raman-Ground-Floor"
 *   "ramanujan_first"     → "Ramanujan-First-Floor"
 *   "atal_basement"       → "Atal-Basement-Floor"
 *   "rajraman_ground"     → "Rajraman-Ground-Floor"
 */
const toDocName = (floorId) => {
  if (!floorId) return ''
  const parts = floorId.split('_')
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-') + '-Floor'
}

/**
 * Full registry of all floor data across all buildings.
 * Add new buildings here — the script handles everything automatically.
 */
const floorsDataMap = {
  // APJ Block
  basement,
  ground,
  first,
  second,
  third,
  fourth,
  fifth,

  // CV-Raman Block
  cv_raman_basement,
  cv_raman_ground,
  cv_raman_first,
  cv_raman_second,
  cv_raman_third,
  cv_raman_fourth,
  cv_raman_fifth,

  // Ramanujan Block
  ramanujan_ground:   ramanujan.ground,
  ramanujan_first:    ramanujan.first,
  ramanujan_second:   ramanujan.second,
  ramanujan_third:    ramanujan.third,
  ramanujan_fourth:   ramanujan.fourth,

  // SMV Block
  smv_ground:   smv.ground,
  smv_first:    smv.first,
  smv_second:   smv.second,
  smv_third:    smv.third,
  smv_fourth:   smv.fourth,
  smv_fifth:    smv.fifth,
  smv_sixth:    smv.sixth,

  // Backwards compatibility fallbacks
  svm_ground:   smv.ground,
  svm_first:    smv.first,
  svm_second:   smv.second,
  svm_third:    smv.third,
  svm_fourth:   smv.fourth,
  svm_fifth:    smv.fifth,
  svm_sixth:    smv.sixth,

  // Atal Block
  atal_ground:   atal.ground,
  atal_first:    atal.first,
  atal_second:   atal.second,
  atal_third:    atal.third,

  // Rajraman Block
  rajraman_ground:   rajraman.ground,
  rajraman_first:    rajraman.first,
  rajraman_second:   rajraman.second,
  rajraman_third:    rajraman.third,
}

/**
 * Buildings where static coordinates always override Firestore coordinates.
 * Useful when a new building boundary/blueprint is pushed and you want
 * the static data to be the canonical source of spatial truth.
 */
const FORCE_STATIC_COORDS_PREFIXES = ['svm_fourth', 'smv_fourth', 'ramanujan_ground', 'ramanujan_third']

const shouldForceStaticCoords = (floorId) =>
  FORCE_STATIC_COORDS_PREFIXES.some(prefix => floorId.startsWith(prefix))

// ── MAIN REPAIR FUNCTION ────────────────────────────────────────────────────
async function repairFirestore() {
  console.log('🛠️  Starting Firestore Sync for all buildings...\n')

  const buildings = [
    'APJ-BLOCK', 'CV-RAMAN-BLOCK', 'RAMANUJAN-BLOCK',
    'SVM-BLOCK', 'ATAL-BLOCK', 'V . RAJRAMAN-BLOCK',
  ]
  console.log(`📦 Buildings covered: ${buildings.join(', ')}\n`)

  for (const [floorId, staticData] of Object.entries(floorsDataMap)) {
    if (!staticData) {
      console.warn(`⚠️ Skipping undefined static data for floorId: ${floorId}`);
      continue;
    }
    const docName = toDocName(floorId)
    const layoutRef    = db.collection('layouts').doc(docName)
    const directionsRef = db.collection('directions').doc(docName)
    const forceStaticCoords = shouldForceStaticCoords(floorId)

    const defaultLabel = staticData.label ||
      floorId.split('_').slice(floorId.includes('_') ? floorId.split('_').indexOf(floorId.split('_').at(-1)) : 0)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ' Floor'

    console.log(`⏳ Processing [${staticData.buildingName}] ${docName} ...`)

    try {
      const snap = await layoutRef.get()

      // ── CREATE: Document doesn't exist yet ──────────────────────────────
      if (!snap.exists) {
        await layoutRef.set({
          floorId,
          buildingName: staticData.buildingName,
          label:        staticData.label || defaultLabel,
          rooms:        staticData.rooms  || [],
          faculty:      staticData.faculty || [],
          mapImage:     staticData.mapImage || null,
          boundaryVertices: staticData.boundaryVertices || [],
          mainWidth:    staticData.mainWidth    || null,
          bulgeWidth:   staticData.bulgeWidth   || null,
          bulgeHeight:  staticData.bulgeHeight  || null,
          viewWidth:    staticData.viewWidth    || null,
          viewHeight:   staticData.viewHeight   || null,
          locked:       true,
          lastEdited:   new Date().toISOString(),
        })

        // Seed directions document
        const directionsData = {}
        ;(staticData.rooms || []).forEach(room => {
          directionsData[room.id] = room.directions || ''
        })
        await directionsRef.set({
          floorId,
          buildingName: staticData.buildingName,
          directions:   directionsData,
          lastUpdated:  new Date().toISOString(),
        })

        console.log(`  ✅ Created ${docName}`)
        continue
      }

      // ── UPDATE: Document already exists — merge carefully ───────────────
      const firestoreData = snap.data()

      const updatedRooms = (staticData.rooms || []).map(sRoom => {
        const fRoom = (firestoreData.rooms || []).find(r => r.id === sRoom.id)
        if (fRoom) {
          return {
            ...sRoom,
            // Spatial: prefer Firestore (user-edited positions), unless forceStaticCoords
            x:      forceStaticCoords ? sRoom.x : (fRoom.x ?? sRoom.x),
            y:      forceStaticCoords ? sRoom.y : (fRoom.y ?? sRoom.y),
            w:      forceStaticCoords ? sRoom.w : (fRoom.w ?? sRoom.w),
            h:      forceStaticCoords ? sRoom.h : (fRoom.h ?? sRoom.h),
            width:  forceStaticCoords ? (sRoom.width  ?? sRoom.w)  : (fRoom.width  ?? fRoom.w  ?? sRoom.width  ?? sRoom.w  ?? 0),
            height: forceStaticCoords ? (sRoom.height ?? sRoom.h)  : (fRoom.height ?? fRoom.h  ?? sRoom.height ?? sRoom.h  ?? 0),
            // Content: prefer Firestore (admin-edited metadata)
            directions:  fRoom.directions  || sRoom.directions  || '',
            description: fRoom.description || sRoom.description || '',
            image:       sRoom.image       || fRoom.image       || '',
          }
        }
        return sRoom
      })

      await layoutRef.update({
        buildingName:     staticData.buildingName,
        label:            staticData.label || defaultLabel,
        rooms:            updatedRooms,
        faculty:          staticData.faculty || [],
        lastEdited:       new Date().toISOString(),
        boundaryVertices: forceStaticCoords
          ? (staticData.boundaryVertices || [])
          : (firestoreData.boundaryVertices && firestoreData.boundaryVertices.length > 0
              ? firestoreData.boundaryVertices
              : (staticData.boundaryVertices || [])),
        mainWidth:    forceStaticCoords ? (staticData.mainWidth || null) : (firestoreData.mainWidth || staticData.mainWidth || null),
        bulgeWidth:   forceStaticCoords ? (staticData.bulgeWidth || null) : (firestoreData.bulgeWidth || staticData.bulgeWidth || null),
        bulgeHeight:  forceStaticCoords ? (staticData.bulgeHeight || null) : (firestoreData.bulgeHeight || staticData.bulgeHeight || null),
        viewWidth:    forceStaticCoords ? (staticData.viewWidth || null) : (firestoreData.viewWidth || staticData.viewWidth || null),
        viewHeight:   forceStaticCoords ? (staticData.viewHeight || null) : (firestoreData.viewHeight || staticData.viewHeight || null),
      })

      // Sync directions
      const directionsData = {}
      updatedRooms.forEach(room => {
        directionsData[room.id] = room.directions || ''
      })
      await directionsRef.set({
        floorId,
        buildingName: staticData.buildingName,
        directions:   directionsData,
        lastUpdated:  new Date().toISOString(),
      })

      console.log(`  ✅ Updated ${docName}`)
    } catch (error) {
      console.error(`  ❌ Error on ${docName}:`, error.message)
    }
  }

  console.log('\n✨ Firestore sync complete for all buildings!')
  
  console.log('📂 Automatically updating Google_Drive_Backup folder...')
  try {
    execSync('node src/scripts/export_directions_to_backup.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    })
  } catch (err) {
    console.error('⚠️ Google_Drive_Backup sync warning:', err.message)
  }

  process.exit(0)
}

repairFirestore()
