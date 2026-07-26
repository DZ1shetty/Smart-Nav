/**
 * fix_apj_image_urls.js
 * 
 * Fixes all Firestore image URLs for APJ-Block floors that incorrectly contain
 * the legacy path: .../MJ/Major_Project/OLD_LOCAL_DATA/public-backup/...
 * 
 * Corrects them to: .../OLD_LOCAL_DATA/public-backup/...
 * 
 * Usage: node src/scripts/fix_apj_image_urls.js
 */

import admin from 'firebase-admin'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const serviceAccount = require('../../serviceAccountKey.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

const GITHUB_USER = 'DZ1shetty'
const GITHUB_REPO = 'Smart-Nav'  // Correct: hyphen, not underscore
const GITHUB_BRANCH = 'main'

// All broken URL patterns to fix -> the one correct pattern
const CORRECT_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/OLD_LOCAL_DATA/public-backup`

// Patterns that need to be replaced (repo underscore + legacy MJ path)
const BAD_PATTERNS = [
  // Old MJ path with underscore repo name
  `https://raw.githubusercontent.com/${GITHUB_USER}/Smart_Nav/${GITHUB_BRANCH}/MJ/Major_Project/OLD_LOCAL_DATA/public-backup`,
  // Old MJ path with hyphen repo name
  `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/MJ/Major_Project/OLD_LOCAL_DATA/public-backup`,
  // Wrong underscore repo name, correct path
  `https://raw.githubusercontent.com/${GITHUB_USER}/Smart_Nav/${GITHUB_BRANCH}/OLD_LOCAL_DATA/public-backup`,
]

// APJ-Block floor documents in the 'layouts' collection
const APJ_FLOORS = [
  'Basement-Floor',
  'Ground-Floor',
  'First-Floor',
  'Second-Floor',
  'Third-Floor',
  'Fourth-Floor',
  'Fifth-Floor',
]

function fixUrl(url) {
  if (!url || typeof url !== 'string') return url
  for (const badPattern of BAD_PATTERNS) {
    if (url.startsWith(badPattern)) {
      return CORRECT_BASE + url.slice(badPattern.length)
    }
  }
  return url
}

async function fixFloor(floorDocId) {
  const ref = db.collection('layouts').doc(floorDocId)
  const doc = await ref.get()

  if (!doc.exists) {
    console.log(`⚠️  ${floorDocId}: Document not found, skipping.`)
    return
  }

  const data = doc.data()
  const rooms = data.rooms || []
  let changed = false
  let fixCount = 0

  const fixedRooms = rooms.map((room) => {
    const newRoom = { ...room }

    // Fix room.image
    if (room.image) {
      const fixed = fixUrl(room.image)
      if (fixed !== room.image) {
        console.log(`  ✏️  ${room.id} image: fixed URL`)
        newRoom.image = fixed
        changed = true
        fixCount++
      }
    }

    // Fix room.images array
    if (Array.isArray(room.images)) {
      const fixedImgs = room.images.map((img) => fixUrl(img))
      if (JSON.stringify(fixedImgs) !== JSON.stringify(room.images)) {
        newRoom.images = fixedImgs
        changed = true
        fixCount++
      }
    }

    // Fix faculty image URLs if any
    if (Array.isArray(room.faculty)) {
      const fixedFaculty = room.faculty.map((f) => {
        const fNew = { ...f }
        if (f.image) {
          const fixed = fixUrl(f.image)
          if (fixed !== f.image) {
            fNew.image = fixed
            changed = true
            fixCount++
          }
        }
        return fNew
      })
      newRoom.faculty = fixedFaculty
    }

    return newRoom
  })

  // Also fix mapImage
  let mapImage = data.mapImage
  if (mapImage) {
    const fixedMap = fixUrl(mapImage)
    if (fixedMap !== mapImage) {
      mapImage = fixedMap
      changed = true
      fixCount++
      console.log(`  ✏️  mapImage: fixed URL`)
    }
  }

  if (!changed) {
    console.log(`✅  ${floorDocId}: No broken URLs found.`)
    return
  }

  await ref.update({
    rooms: fixedRooms,
    ...(mapImage !== data.mapImage ? { mapImage } : {}),
  })

  console.log(`✅  ${floorDocId}: Fixed ${fixCount} URL(s) and saved to Firestore.`)
}

async function main() {
  console.log('🔧 Fixing APJ-Block image URLs in Firestore...\n')
  console.log(`   TARGET (correct): ${CORRECT_BASE}/...`)
  console.log(`   Fixing ${BAD_PATTERNS.length} broken URL pattern(s)...\n`)


  for (const floor of APJ_FLOORS) {
    process.stdout.write(`Processing ${floor}...\n`)
    await fixFloor(floor)
  }

  console.log('\n🎉 Done! All APJ-Block floors processed.')
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
