/**
 * patch_third_floor_faculty_v2.js
 *
 * Adds Dr. Sukesh Rao M. and Dr. Sumathi Pawar to 3rd Floor APJ Block faculty directory,
 * updates Dr. Niju Rajan with designation, deduplicates records, and syncs third.js and Firestore.
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

const newDoorFaculty = [
  { name: 'DR. SUKESH RAO M.', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Associate Professor' },
  { name: 'DR. SUMATHI PAWAR', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Professor' },
  { name: 'DR. NIJU RAJAN', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd-III' }
]

async function main() {
  console.log('🚀 Updating 3rd Floor APJ Block Faculty Directory (V2)...')

  const thirdJsPath = path.join(__dirname, '../data/apj-block/third.js')
  const thirdModule = await import('../data/apj-block/third.js')
  let faculty = thirdModule.third.faculty || []

  // Add/Update new door faculty
  newDoorFaculty.forEach(nf => {
    const cleanName = nf.name.toLowerCase().replace(/[^a-z]/g, '')
    const idx = faculty.findIndex(f => f.name.toLowerCase().replace(/[^a-z]/g, '').includes(cleanName) || cleanName.includes(f.name.toLowerCase().replace(/[^a-z]/g, '')))

    if (idx >= 0) {
      faculty[idx] = {
        ...faculty[idx],
        name: nf.name,
        department: nf.department,
        roomId: nf.roomId,
        designation: nf.designation
      }
    } else {
      faculty.push({
        name: nf.name,
        department: nf.department,
        roomId: nf.roomId,
        designation: nf.designation,
        image: ''
      })
    }
  })

  // Deduplicate by normalized name
  const seen = new Set()
  const cleanFacultyList = []

  for (const f of faculty) {
    const norm = f.name.toUpperCase().replace(/MRS\.|MS\.|DR\.|MR\./g, '').replace(/[^A-Z]/g, '')
    if (!seen.has(norm)) {
      seen.add(norm)
      cleanFacultyList.push(f)
    }
  }

  console.log(`\n📝  Updating src/data/apj-block/third.js (${cleanFacultyList.length} unique faculty members)...`)
  let thirdContent = fs.readFileSync(thirdJsPath, 'utf8')
  const facultyArrayStr = `faculty: ${JSON.stringify(cleanFacultyList, null, 2)}`
  thirdContent = thirdContent.replace(/faculty:\s*\[[\s\S]*\]\s*\n\}/, `${facultyArrayStr}\n}`)
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
    faculty: cleanFacultyList,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Third-Floor updated successfully!')

  console.log('\n✨ 3rd Floor faculty update V2 complete!')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
