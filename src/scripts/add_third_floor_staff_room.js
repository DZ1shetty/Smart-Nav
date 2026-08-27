/**
 * add_third_floor_staff_room.js
 *
 * Adds an extra staff room ("STAFF ROOM") near E&C Staff Room on the 3rd Floor of APJ Block.
 * 1. Updates src/data/apj-block/third.js
 * 2. Patches Firestore layouts/Third-Floor document
 */

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
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}
const db = admin.firestore()

const newRoom = {
  id: 'ec-staff-room-extra',
  name: 'STAFF ROOM',
  label: 'STAFF ROOM',
  type: 'staffroom',
  x: 20,
  y: 1040,
  w: 220,
  h: 80,
  width: 220,
  height: 80,
  directions: 'Located on the left corridor of the 3rd Floor between the E&C Staff Rooms.',
  description: 'E&C Staff Room Auxiliary',
  image: 'https://placehold.co/600x400?text=Staff+Room',
  tags: ["staff", "office", "ece"],
  clickable: true
}

async function main() {
  console.log('🚀 Adding extra Staff Room near E&C Staff Room on 3rd Floor APJ Block...')

  const thirdJsPath = path.join(__dirname, '../data/apj-block/third.js')
  const thirdModule = await import('../data/apj-block/third.js')
  let rooms = thirdModule.third.rooms || []

  // Adjust ec-staff-room-1 and ec-staff-room-2 height/y slightly to accommodate the new room cleanly
  rooms = rooms.map(r => {
    if (r.id === 'ec-staff-room-1') {
      return { ...r, h: 90, height: 90 }
    }
    if (r.id === 'ec-staff-room-2') {
      return { ...r, y: 1125, h: 95, height: 95 }
    }
    return r
  })

  // Check if room already exists
  const existingIdx = rooms.findIndex(r => r.id === newRoom.id)
  if (existingIdx >= 0) {
    rooms[existingIdx] = newRoom
  } else {
    // Insert after ec-staff-room-1
    const idx1 = rooms.findIndex(r => r.id === 'ec-staff-room-1')
    if (idx1 >= 0) {
      rooms.splice(idx1 + 1, 0, newRoom)
    } else {
      rooms.push(newRoom)
    }
  }

  const updatedThirdObject = { ...thirdModule.third, rooms }

  console.log('\n📝  Updating src/data/apj-block/third.js...')
  let thirdContent = fs.readFileSync(thirdJsPath, 'utf8')
  const roomsArrayStr = `rooms: ${JSON.stringify(rooms, null, 2)}`
  thirdContent = thirdContent.replace(/rooms:\s*\[[\s\S]*?\n  \],\n  faculty:/, `${roomsArrayStr},\n  faculty:`)
  fs.writeFileSync(thirdJsPath, thirdContent, 'utf8')
  console.log('   Updated third.js successfully!')

  console.log('\n🔥  Updating Firestore layouts/Third-Floor document...')
  const docRef = db.collection('layouts').doc('Third-Floor')
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error('❌  Firestore document Third-Floor not found!')
    process.exit(1)
  }

  await docRef.update({
    rooms: rooms,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Third-Floor updated successfully!')

  console.log('\n✨ Extra staff room added successfully!')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
