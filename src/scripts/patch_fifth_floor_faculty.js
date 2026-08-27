/**
 * patch_fifth_floor_faculty.js
 *
 * Patches ONLY the faculty field in the APJ Fifth Floor Firestore document.
 * Run with:  node src/scripts/patch_fifth_floor_faculty.js
 */

import admin from 'firebase-admin'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

const IMG_BASE_URL = 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public'

const newFaculty = [
  {
    name: 'DR. CHINMAI SHETTY',
    department: 'ISE',
    roomId: 'CFR01',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.18-pm.jpeg`
  },
  {
    name: 'DR. RASHMI NAVEEN',
    department: 'ISE',
    roomId: 'CFR01',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.19-pm.jpeg`
  },
  {
    name: 'MS. ANUSHA N',
    department: 'ISE',
    roomId: 'CFR01',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.16-pm.jpeg`
  },
  {
    name: 'DR. DEEPA',
    department: 'ISE',
    roomId: 'CFR01',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.19-pm-1.jpeg`
  },
  {
    name: 'MS. PRATHEEKSHA HEGDE N',
    department: 'ISE',
    roomId: 'CFR02',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.21-pm-2.jpeg`
  },
  {
    name: 'MS. ALAKA ANANTH',
    department: 'ISE',
    roomId: 'CFR02',
    image: ''
  },
  {
    name: 'MR. SRIKANTH BHAT K.',
    department: 'ISE',
    roomId: 'CFR02',
    image: ''
  },
  {
    name: 'MS. PRATHYAKSHINI',
    department: 'ISE',
    roomId: 'CFR02',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.22-pm.jpeg`
  },
  {
    name: 'MR. KRISHNARAJ RAO N S',
    department: 'CSE',
    roomId: 'CFR03',
    image: ''
  },
  {
    name: 'DR. SANTHOSH S',
    department: 'ISE',
    roomId: 'CFR03',
    image: ''
  },
  {
    name: 'DR. RAMESH G.',
    department: 'ISE',
    roomId: 'CFR03',
    image: ''
  },
  {
    name: 'DR. BOLA SUNIL KAMATH',
    department: 'ISE',
    roomId: 'CFR03',
    image: ''
  },
  {
    name: 'DR. JASON ELROY MARTIS',
    department: 'ISE',
    roomId: '',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.15-pm-2.jpeg`
  },
  {
    name: 'MS. PREETHI',
    department: 'ISE',
    roomId: '',
    image: ''
  },
  {
    name: 'DR. RAVI B.',
    department: 'ISE',
    roomId: '',
    image: `${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.15-pm-1.jpeg`
  },
  {
    name: 'MR. VASUDEVA',
    department: 'ISE',
    roomId: '',
    image: ''
  }
]

const DOC_NAME = 'Fifth-Floor'

async function patchFaculty() {
  const docRef = db.collection('layouts').doc(DOC_NAME)
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error(`❌  Document "${DOC_NAME}" not found in layouts collection.`)
    process.exit(1)
  }

  console.log(`✅  Found document "${DOC_NAME}". Patching faculty...`)
  await docRef.update({ faculty: newFaculty, lastEdited: new Date().toISOString() })
  console.log(`✅  Faculty updated! ${newFaculty.length} members written.`)
  newFaculty.forEach((f, i) => console.log(`   ${i + 1}. ${f.name} (${f.department}) — Room: ${f.roomId || 'Staff Area'}`))
  process.exit(0)
}

patchFaculty().catch((err) => {
  console.error('❌  Script failed:', err)
  process.exit(1)
})
