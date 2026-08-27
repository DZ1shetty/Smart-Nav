/**
 * upload_and_patch_fifth_floor_part4.js
 *
 * 1. Uploads 5 high-resolution faculty headshot images to Cloudinary (using smart_nav_preset).
 * 2. Saves local copies in public/ and Google_Drive_Backup/.
 * 3. Updates src/data/apj-block/fifth.js with updated images for Ms. Prathyakshini, Ms. Pratheeksha Hegde N, Ms. Anusha N, Dr. Jason Elroy Martis, Dr. Ravi B.
 * 4. Patches Firestore document layouts/Fifth-Floor with the updated faculty list.
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

const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\ad912088-928d-4ab0-8785-66c905160c6c'

const facultyHeadshotsToUpload = [
  {
    keyName: 'MS. PRATHYAKSHINI',
    updatedName: 'MS. PRATHYAKSHINI',
    designation: 'Assistant Professor Gd.II',
    localFile: path.join(brainDir, 'media__1787842461709.png'),
    targetFilename: 'ms_prathyakshini.png'
  },
  {
    keyName: 'MS. PRATHEEKSHA HEGDE N',
    updatedName: 'MS. PRATHEEKSHA HEGDE N',
    designation: 'Assistant Professor Gd.II',
    localFile: path.join(brainDir, 'media__1787842468271.png'),
    targetFilename: 'ms_pratheeksha_hegde_n.png'
  },
  {
    keyName: 'MS. ANUSHA N',
    updatedName: 'MS. ANUSHA N',
    designation: 'Assistant Professor Gd.I',
    localFile: path.join(brainDir, 'media__1787842479044.png'),
    targetFilename: 'ms_anusha_n.png'
  },
  {
    keyName: 'DR. JASON ELROY MARTIS',
    updatedName: 'DR. JASON ELROY MARTIS',
    designation: 'Associate Professor & System Administrator',
    localFile: path.join(brainDir, 'media__1787842495518.png'),
    targetFilename: 'dr_jason_elroy_martis.png'
  },
  {
    keyName: 'DR. RAVI B.',
    updatedName: 'DR. RAVI B.',
    designation: 'Associate Professor',
    localFile: path.join(brainDir, 'media__1787842502540.png'),
    targetFilename: 'dr_ravi_b.png'
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
  console.log('🚀  Processing 5th Floor Faculty Image Update Part 4...')

  const localPublicDir = path.join(__dirname, '../../public/apj-block-images/5th-floor/faculty')
  const backupFacultyDir = path.join(__dirname, '../../Google_Drive_Backup/APJ-BLOCK/Fifth Floor/Faculty')

  fs.mkdirSync(localPublicDir, { recursive: true })
  fs.mkdirSync(backupFacultyDir, { recursive: true })

  const uploadedUrls = {}

  for (const item of facultyHeadshotsToUpload) {
    console.log(`\n📸  Uploading headshot for: ${item.updatedName}...`)

    // Save local copies
    const localDest = path.join(localPublicDir, item.targetFilename)
    const backupDest = path.join(backupFacultyDir, item.targetFilename)
    fs.copyFileSync(item.localFile, localDest)
    fs.copyFileSync(item.localFile, backupDest)
    console.log(`   Saved local copies to public/ and Google_Drive_Backup/`)

    // Upload to Cloudinary
    let url = ''
    try {
      url = await uploadToCloudinary(item.localFile)
      console.log(`   Uploaded to Cloudinary: ${url}`)
    } catch (err) {
      console.warn(`   ⚠️ Cloudinary upload failed: ${err.message}`)
      url = `https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/apj-block-images/5th-floor/faculty/${item.targetFilename}`
    }

    uploadedUrls[item.keyName] = url
  }

  // Load existing fifth.js data
  const fifthJsPath = path.join(__dirname, '../data/apj-block/fifth.js')
  const fifthModule = await import('../data/apj-block/fifth.js')
  let currentFaculty = fifthModule.fifth.faculty || []

  // Update images and names in faculty array
  const updatedFacultyList = currentFaculty.map(f => {
    if (f.name === 'MS. PRATHYAKSHINI') {
      return { ...f, image: uploadedUrls['MS. PRATHYAKSHINI'] || f.image }
    }
    if (f.name === 'MS. PRATHEEKSHA HEGDE N') {
      return { ...f, image: uploadedUrls['MS. PRATHEEKSHA HEGDE N'] || f.image }
    }
    if (f.name === 'MS. ANUSHA N' || f.name === 'DR. ANUSHA N.') {
      return { ...f, name: 'MS. ANUSHA N', image: uploadedUrls['MS. ANUSHA N'] || f.image }
    }
    if (f.name === 'DR. JASON ELROY MARTIS') {
      return { ...f, image: uploadedUrls['DR. JASON ELROY MARTIS'] || f.image }
    }
    if (f.name === 'DR. RAVI B.' || f.name === 'DR. RAVI B') {
      return { ...f, name: 'DR. RAVI B.', image: uploadedUrls['DR. RAVI B.'] || f.image }
    }
    return f
  })

  console.log('\n📝  Updating src/data/apj-block/fifth.js...')
  let fifthContent = fs.readFileSync(fifthJsPath, 'utf8')
  const facultyArrayStr = `faculty: ${JSON.stringify(updatedFacultyList, null, 2)}`
  fifthContent = fifthContent.replace(/faculty:\s*\[[\s\S]*\]\s*\n\}/, `${facultyArrayStr}\n}`)
  fs.writeFileSync(fifthJsPath, fifthContent, 'utf8')
  console.log('   Updated fifth.js successfully!')

  console.log('\n🔥  Updating Firestore layouts/Fifth-Floor document...')
  const docRef = db.collection('layouts').doc('Fifth-Floor')
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error('❌  Firestore document Fifth-Floor not found!')
    process.exit(1)
  }

  await docRef.update({
    faculty: updatedFacultyList,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Fifth-Floor updated successfully!')

  console.log('\n✨ 5th Floor Part 4 faculty image update complete!')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
