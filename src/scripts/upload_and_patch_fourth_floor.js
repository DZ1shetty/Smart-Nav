/**
 * upload_and_patch_fourth_floor.js
 *
 * 1. Uploads 5 faculty headshot images to Cloudinary (using smart_nav_preset).
 * 2. Saves local copies in public/ and Google_Drive_Backup/.
 * 3. Updates src/data/apj-block/fourth.js with the new 5 faculty members.
 * 4. Patches Firestore document layouts/Fourth-Floor with the new faculty list.
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Service Account setup for Firestore
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}
const db = admin.firestore()

const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\ad912088-928d-4ab0-8785-66c905160c6c'

const facultyToProcess = [
  {
    name: 'DR. USHA DIVAKARLA',
    designation: 'Professor',
    department: 'ISE',
    roomId: 'staff-room-top-center',
    localFile: path.join(brainDir, 'media__1787840843929.png'),
    targetFilename: 'dr_usha_divakarla.png'
  },
  {
    name: 'DR. MANJULA GURURAJ RAO',
    designation: 'Professor',
    department: 'ISE',
    roomId: 'staff-room-top-center',
    localFile: path.join(brainDir, 'media__1787840844076.png'),
    targetFilename: 'dr_manjula_gururaj_rao.png'
  },
  {
    name: 'DR. VAIKUNTH PAI',
    designation: 'Associate Professor',
    department: 'ISE',
    roomId: 'staff-room-top-center',
    localFile: path.join(brainDir, 'media__1787840844083.png'),
    targetFilename: 'dr_vaikunth_pai.png'
  },
  {
    name: 'DR. VANDANA B S',
    designation: 'Associate Professor',
    department: 'ISE',
    roomId: 'staff-room-top-center',
    localFile: path.join(brainDir, 'media__1787840844079.png'),
    targetFilename: 'dr_vandana_b_s.png'
  },
  {
    name: 'DR. NAGANNA CHETTY',
    designation: 'Associate Professor',
    department: 'ISE',
    roomId: 'staff-room-top-center',
    localFile: path.join(brainDir, 'media__1787840844094.png'),
    targetFilename: 'dr_naganna_chetty.png'
  }
]

async function uploadToCloudinary(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer], { type: 'image/png' })
  const formData = new FormData()
  formData.append('file', blob, path.basename(filePath))
  formData.append('upload_preset', 'smart_nav_preset')

  const res = await fetch('https://api.cloudinary.com/v1_1/jjwuzizy/image/upload', {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary upload error (${res.status}): ${text}`)
  }

  const json = await res.json()
  return json.secure_url
}

async function main() {
  console.log('🚀  Processing 4th Floor Faculty Update...')

  const localPublicDir = path.join(__dirname, '../../public/apj-block-images/4th-floor/faculty')
  const backupFacultyDir = path.join(__dirname, '../../Google_Drive_Backup/APJ-BLOCK/Fourth Floor/Faculty')

  fs.mkdirSync(localPublicDir, { recursive: true })
  fs.mkdirSync(backupFacultyDir, { recursive: true })

  const updatedFacultyList = []

  for (const item of facultyToProcess) {
    console.log(`\n📸  Uploading headshot for: ${item.name}...`)
    
    // Copy locally
    const localDest = path.join(localPublicDir, item.targetFilename)
    const backupDest = path.join(backupFacultyDir, item.targetFilename)
    fs.copyFileSync(item.localFile, localDest)
    fs.copyFileSync(item.localFile, backupDest)
    console.log(`   Saved local copies to public/ and Google_Drive_Backup/`)

    // Upload to Cloudinary
    let cloudinaryUrl = ''
    try {
      cloudinaryUrl = await uploadToCloudinary(item.localFile)
      console.log(`   Uploaded to Cloudinary: ${cloudinaryUrl}`)
    } catch (err) {
      console.warn(`   ⚠️ Cloudinary upload failed: ${err.message}. Fallback to relative path.`)
      cloudinaryUrl = `\${IMG_BASE_URL}/apj-block-images/4th-floor/faculty/${item.targetFilename}`
    }

    updatedFacultyList.push({
      name: item.name,
      department: item.department,
      designation: item.designation,
      roomId: item.roomId,
      image: cloudinaryUrl
    })
  }

  console.log('\n📝  Updating src/data/apj-block/fourth.js...')
  const fourthJsPath = path.join(__dirname, '../data/apj-block/fourth.js')
  let fourthContent = fs.readFileSync(fourthJsPath, 'utf8')

  const facultyArrayStr = `faculty: ${JSON.stringify(updatedFacultyList, null, 2)}`
  fourthContent = fourthContent.replace(/faculty:\s*\[[\s\S]*\]\s*\n\}/, `${facultyArrayStr}\n}`)
  fs.writeFileSync(fourthJsPath, fourthContent, 'utf8')
  console.log('   Updated fourth.js successfully!')

  console.log('\n🔥  Updating Firestore layouts/Fourth-Floor document...')
  const docRef = db.collection('layouts').doc('Fourth-Floor')
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error('❌  Firestore document Fourth-Floor not found!')
    process.exit(1)
  }

  await docRef.update({
    faculty: updatedFacultyList,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Fourth-Floor updated successfully!')

  console.log('\n✨ All operations complete! Next: run drive structure export.')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
