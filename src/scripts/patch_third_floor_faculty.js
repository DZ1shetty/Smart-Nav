/**
 * patch_third_floor_faculty.js
 *
 * Updates the 3rd Floor APJ Block faculty directory with exact names, titles, and departments
 * read from the 5 door nameplate photos.
 *
 * Patches src/data/apj-block/third.js and Firestore layouts/Third-Floor.
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

// Door Nameplate Faculty Data
const doorFacultyList = [
  // Door 1: E&C Staff Room
  { name: 'DR. SHUBHA B.', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd-III' },
  { name: 'DR. ANUSHA R. SHARATH', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd. III' },

  // Door 2: Staff Room (Math & ECE)
  { name: 'DR. CHAITHRA K.', department: 'Mathematics', roomId: 'ec-staff-room-extra', designation: 'Assistant Professor Gd-III' },
  { name: 'MS. BHAVYA K.', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Assistant Professor' },
  { name: 'DR. SANTHOSH POOJARY', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Asst. Professor Gd. III' },
  { name: 'DR. HARSHINI U.', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Asst. Professor Gd. III' },
  { name: 'DR. SNEHA NAYAK', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Associate Professor Gd-III' },

  // Door 3: E&C Staff Room
  { name: 'MRS. SHANKARI N.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor' },
  { name: 'MRS. NAGAPRIYA KAMATH', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor' },
  { name: 'DR. ASHWINI K.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },

  // Door 4: E&C Staff Room
  { name: 'DR. CHARISHMA', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },
  { name: 'MRS. RAMYA SHETTY', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },
  { name: 'MS. HARSHITHA BHAT', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor' },
  { name: 'MS. ANUPAMA B.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-I' },

  // Door 5: E&C Staff Room
  { name: 'MR. VASUDEVA PAI', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },
  { name: 'DR. DEVIDAS', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },
  { name: 'DR. CHAITHRA S. N.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III' },
  { name: 'MS. TANZILA NARGIS', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Prof. Gd-II' }
]

async function main() {
  console.log('🚀 Updating 3rd Floor APJ Block Faculty Directory...')

  const thirdJsPath = path.join(__dirname, '../data/apj-block/third.js')
  const thirdModule = await import('../data/apj-block/third.js')
  let currentFaculty = thirdModule.third.faculty || []

  // Merge/update door faculty into existing list
  doorFacultyList.forEach(df => {
    const cleanName = df.name.toLowerCase().replace(/[^a-z]/g, '')
    const existingIdx = currentFaculty.findIndex(f => f.name.toLowerCase().replace(/[^a-z]/g, '') === cleanName)

    if (existingIdx >= 0) {
      currentFaculty[existingIdx] = {
        ...currentFaculty[existingIdx],
        name: df.name,
        department: df.department,
        roomId: df.roomId,
        designation: df.designation
      }
    } else {
      currentFaculty.push({
        name: df.name,
        department: df.department,
        roomId: df.roomId,
        designation: df.designation,
        image: ''
      })
    }
  })

  console.log(`\n📝  Updating src/data/apj-block/third.js (${currentFaculty.length} total members)...`)
  let thirdContent = fs.readFileSync(thirdJsPath, 'utf8')
  const facultyArrayStr = `faculty: ${JSON.stringify(currentFaculty, null, 2)}`
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
    faculty: currentFaculty,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Third-Floor updated successfully!')

  console.log('\n✨ 3rd Floor faculty update complete!')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
