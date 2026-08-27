/**
 * purge_and_set_third_floor_faculty.js
 *
 * Purges all unverified 3rd Floor APJ Block faculty members and keeps ONLY the 21 members
 * extracted directly from the user's nameplate photos.
 *
 * Updates src/data/apj-block/third.js and Firestore layouts/Third-Floor.
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

// Exactly the 21 faculty members verified from the door nameplate images
const verifiedFaculty = [
  // Door 1 (Photo 1)
  { name: 'Dr. Shubha B.', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Dr. Anusha R. Sharath', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd-III', image: '' },

  // Door 6 (Photo 6)
  { name: 'Dr. Niju Rajan', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Dr. Sukesh Rao M.', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Associate Professor', image: '' },

  // Door 7 (Photo 7)
  { name: 'Dr. Sumathi Pawar', department: 'ECE', roomId: 'ec-staff-room-1', designation: 'Professor', image: '' },

  // Door 2 (Photo 2 - Staff Room)
  { name: 'Dr. Chaithra K.', department: 'Mathematics', roomId: 'ec-staff-room-extra', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Ms. Bhavya K.', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Assistant Professor', image: '' },
  { name: 'Dr. Santhosh Poojary', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Asst. Professor Gd-III', image: '' },
  { name: 'Dr. Harshini U.', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Asst. Professor Gd-III', image: '' },
  { name: 'Dr. Sneha Nayak', department: 'ECE', roomId: 'ec-staff-room-extra', designation: 'Associate Professor Gd-III', image: '' },

  // Door 3 (Photo 3)
  { name: 'Mrs. Shankari N.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor', image: '' },
  { name: 'Mrs. Nagapriya Kamath', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor', image: '' },
  { name: 'Dr. Ashwini K.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },

  // Door 4 (Photo 4)
  { name: 'Dr. Charishma', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Mrs. Ramya Shetty', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Ms. Harshitha Bhat', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor', image: '' },
  { name: 'Ms. Anupama B.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-I', image: '' },

  // Door 5 (Photo 5)
  { name: 'Mr. Vasudeva Pai', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Dr. Devidas', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Dr. Chaithra S. N.', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-III', image: '' },
  { name: 'Ms. Tanzila Nargis', department: 'ECE', roomId: 'ec-staff-room-2', designation: 'Assistant Professor Gd-II', image: '' }
]

async function main() {
  console.log('🚀 Setting 3rd Floor APJ Block Faculty Directory to ONLY image-verified members (21 total)...')

  const thirdJsPath = path.join(__dirname, '../data/apj-block/third.js')

  console.log('\n📝 Updating src/data/apj-block/third.js...')
  let thirdContent = fs.readFileSync(thirdJsPath, 'utf8')
  const facultyArrayStr = `faculty: ${JSON.stringify(verifiedFaculty, null, 2)}`
  thirdContent = thirdContent.replace(/faculty:\s*\[[\s\S]*\]\s*\n\}/, `${facultyArrayStr}\n}`)
  fs.writeFileSync(thirdJsPath, thirdContent, 'utf8')
  console.log('   Updated third.js successfully!')

  console.log('\n🔥 Updating Firestore layouts/Third-Floor document...')
  const docRef = db.collection('layouts').doc('Third-Floor')
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error('❌ Firestore document Third-Floor not found!')
    process.exit(1)
  }

  await docRef.update({
    faculty: verifiedFaculty,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Third-Floor updated successfully!')

  console.log('\n✨ Purge complete! Exactly 21 faculty members are set on 3rd Floor.')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
