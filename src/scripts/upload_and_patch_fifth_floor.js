/**
 * upload_and_patch_fifth_floor.js
 *
 * 1. Uploads 5 faculty headshot images to Cloudinary (using smart_nav_preset).
 * 2. Saves local copies in public/ and Google_Drive_Backup/.
 * 3. Updates src/data/apj-block/fifth.js with updated names & secure image URLs.
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
    keyName: 'MR. KRISHNARAJ RAO N S',
    updatedName: 'MR. KRISHNARAJ RAO',
    designation: 'Assistant Professor Gd.III',
    localFile: path.join(brainDir, 'media__1787841693634.png'),
    targetFilename: 'mr_krishnaraj_rao.png'
  },
  {
    keyName: 'DR. PREETHI SALIAN K',
    updatedName: 'DR. PREETHI SALIAN K',
    designation: 'Associate Professor',
    localFile: path.join(brainDir, 'media__1787841734997.png'),
    targetFilename: 'dr_preethi_salian_k.png'
  },
  {
    keyName: 'DR. VASUDEVA',
    updatedName: 'DR. VASUDEVA',
    designation: 'Professor',
    localFile: path.join(brainDir, 'media__1787841740227.png'),
    targetFilename: 'dr_vasudeva.png'
  },
  {
    keyName: 'MS. ALAKA ANANTH',
    updatedName: 'MS. ALAKA ANANTH',
    designation: 'Assistant Professor Gd.III',
    localFile: path.join(brainDir, 'media__1787841760365.png'),
    targetFilename: 'ms_alaka_ananth.png'
  },
  {
    keyName: 'MR. SRIKANTH BHAT K.',
    updatedName: 'MR. SRIKANTH BHAT K.',
    designation: 'Assistant Professor Grade.II',
    localFile: path.join(brainDir, 'media__1787841771722.png'),
    targetFilename: 'mr_srikanth_bhat_k.png'
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
  console.log('🚀  Processing 5th Floor Faculty Image Update...')

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
    if (f.name === 'MR. KRISHNARAJ RAO N S' || f.name === 'MR. KRISHNARAJ RAO') {
      return { ...f, name: 'MR. KRISHNARAJ RAO', image: uploadedUrls['MR. KRISHNARAJ RAO N S'] || f.image }
    }
    if (f.name === 'MS. PREETHI' || f.name === 'DR. PREETHI SALIAN K') {
      return { ...f, name: 'DR. PREETHI SALIAN K', image: uploadedUrls['DR. PREETHI SALIAN K'] || f.image }
    }
    if (f.name === 'MR. VASUDEVA' || f.name === 'DR. VASUDEVA') {
      return { ...f, name: 'DR. VASUDEVA', image: uploadedUrls['DR. VASUDEVA'] || f.image }
    }
    if (f.name === 'MS. ALAKA ANANTH') {
      return { ...f, image: uploadedUrls['MS. ALAKA ANANTH'] || f.image }
    }
    if (f.name === 'MR. SRIKANTH BHAT K.') {
      return { ...f, image: uploadedUrls['MR. SRIKANTH BHAT K.'] || f.image }
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

  console.log('\n✨ 5th Floor faculty image update complete!')
}

main().catch(err => {
  console.error('❌ Error in script:', err)
  process.exit(1)
})
