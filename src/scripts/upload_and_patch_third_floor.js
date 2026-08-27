/**
 * upload_and_patch_third_floor.js
 *
 * 1. Uploads 21 faculty headshot images to Cloudinary (smart_nav_preset).
 * 2. Saves local copies in public/ and Google_Drive_Backup/.
 * 3. Updates src/data/apj-block/third.js with names, designations, and Cloudinary URLs.
 * 4. Patches Firestore document layouts/Third-Floor with the new faculty list.
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

const assetsDir =
  'C:\\Users\\ASUS\\.cursor\\projects\\d-Programming-Trash-Programming-Trash-SNSFSE-Major-Project\\assets'

const facultyToProcess = [
  {
    name: 'DR. SHUBHA B.',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-1',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-407766f0-b61b-4913-986c-fad62d435ba4.png'),
    targetFilename: 'dr_shubha_b.png'
  },
  {
    name: 'DR. ANUSHA R SHARATH',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-1',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-e498fe5d-1f67-44b2-b4b3-99d785814b85.png'),
    targetFilename: 'dr_anusha_r_sharath.png'
  },
  {
    name: 'DR. NIJU RAJAN',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-1',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-6c500446-475b-41cb-b585-71c132de4dfd.png'),
    targetFilename: 'dr_niju_rajan.png'
  },
  {
    name: 'DR. SUKESH RAO M',
    designation: 'Associate Professor',
    department: 'ECE',
    roomId: 'ec-staff-room-1',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-ac6c0375-d8ce-4f55-9711-aaaf35ab2bc9.png'),
    targetFilename: 'dr_sukesh_rao_m.png'
  },
  {
    name: 'DR. SUMATHI PAWAR',
    designation: 'Professor',
    department: 'ECE',
    roomId: 'ec-staff-room-1',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-199663a4-e2de-40b7-aa85-ef6cbdd6f000.png'),
    targetFilename: 'dr_sumathi_pawar.png'
  },
  {
    name: 'DR. CHAITHRA K',
    designation: 'Assistant Professor Gd.III',
    department: 'Mathematics',
    roomId: 'ec-staff-room-extra',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-d7e466d2-4002-4447-9e31-ef269095e927.png'),
    targetFilename: 'dr_chaithra_k.png'
  },
  {
    name: 'MS. BHAVYA K',
    designation: 'Assistant Professor Gd.I',
    department: 'ECE',
    roomId: 'ec-staff-room-extra',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-96c0ac3a-ed08-48af-8d46-88811e17de7d.png'),
    targetFilename: 'ms_bhavya_k.png'
  },
  {
    name: 'DR. SANTHOSH POOJARY',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-extra',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-1dc7cb15-9447-4f17-9381-13057f0c92f5.png'),
    targetFilename: 'dr_santhosh_poojary.png'
  },
  {
    name: 'DR. ULLAL HARSHINI DEVI',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-extra',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-80468b35-c417-46c8-821f-75be2beb91d5.png'),
    targetFilename: 'dr_ullal_harshini_devi.png'
  },
  {
    name: 'DR. SNEHA NAYAK',
    designation: 'Associate Professor',
    department: 'ECE',
    roomId: 'ec-staff-room-extra',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-b470fdfc-eac2-4427-90f9-761578acb7a0.png'),
    targetFilename: 'dr_sneha_nayak.png'
  },
  {
    name: 'MS. SHANKARI N.',
    designation: 'Assistant Professor Gd.I',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-dc533d18-129e-4ec9-84ec-6f785e0bbef0.png'),
    targetFilename: 'ms_shankari_n.png'
  },
  {
    name: 'MS. NAGAPRIYA KAMATH',
    designation: 'Assistant Professor Gd.II',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-86a99c31-e2a8-436b-a7e9-47184f3f0fab.png'),
    targetFilename: 'ms_nagapriya_kamath.png'
  },
  {
    name: 'DR. ASHWINI K',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-25655cbe-6395-414d-86f2-0a320fc4f714.png'),
    targetFilename: 'dr_ashwini_k.png'
  },
  {
    name: 'DR. CHARISHMA',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-4233209b-5fcd-4b71-a551-c1b525512c3f.png'),
    targetFilename: 'dr_charishma.png'
  },
  {
    name: 'MS. RAMYA SHETTY',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-43f19aa0-8a2c-4c77-a557-662720218a20.png'),
    targetFilename: 'ms_ramya_shetty.png'
  },
  {
    name: 'MS. HARSHITHA BHAT',
    designation: 'Assistant Professor Gd.I',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-d7b2ef33-5b07-4483-ad0e-2ec69f58ca1f.png'),
    targetFilename: 'ms_harshitha_bhat.png'
  },
  {
    name: 'MS. ANUPAMA B',
    designation: 'Assistant Professor Gd.I',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-6c0c00b4-7fcd-4b39-a94c-478bab138a3c.png'),
    targetFilename: 'ms_anupama_b.png'
  },
  {
    name: 'MR. VASUDEVA PAI',
    designation: 'Asst. Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-d0dbed08-23f7-41bb-bd97-ec6c5f1ee822.png'),
    targetFilename: 'mr_vasudeva_pai.png'
  },
  {
    name: 'DR. DEVIDAS',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-35aaf330-48e3-44e2-bcef-4133569d2f56.png'),
    targetFilename: 'dr_devidas.png'
  },
  {
    name: 'DR. CHAITRA S N',
    designation: 'Assistant Professor Gd.III',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-66578d35-5154-4490-b5f4-bbc7e68869b5.png'),
    targetFilename: 'dr_chaitra_s_n.png'
  },
  {
    name: 'MS. TANZILA NARGIS',
    designation: 'Assistant Professor Gd.II',
    department: 'ECE',
    roomId: 'ec-staff-room-2',
    localFile: path.join(assetsDir, 'c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_89cf9985e55e862be75cc6d3325db5e5_images_image-fadaba1e-3e1d-4ef1-b3ef-ec34e4eff3f0.png'),
    targetFilename: 'ms_tanzila_nargis.png'
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
  console.log('Processing 3rd Floor Faculty Update...')

  const missing = facultyToProcess.filter((item) => !fs.existsSync(item.localFile))
  if (missing.length) {
    console.error('Missing source images:')
    missing.forEach((item) => console.error(`  ${item.name}: ${item.localFile}`))
    process.exit(1)
  }

  const localPublicDir = path.join(__dirname, '../../public/apj-block-images/3th-floor/faculty')
  const backupFacultyDir = path.join(__dirname, '../../Google_Drive_Backup/APJ-BLOCK/Third Floor/Faculty')

  fs.mkdirSync(localPublicDir, { recursive: true })
  fs.mkdirSync(backupFacultyDir, { recursive: true })

  const updatedFacultyList = []

  for (const item of facultyToProcess) {
    console.log(`\nUploading headshot for: ${item.name}...`)

    const localDest = path.join(localPublicDir, item.targetFilename)
    const backupDest = path.join(backupFacultyDir, item.targetFilename)
    fs.copyFileSync(item.localFile, localDest)
    fs.copyFileSync(item.localFile, backupDest)
    console.log('   Saved local copies to public/ and Google_Drive_Backup/')

    let cloudinaryUrl = ''
    try {
      cloudinaryUrl = await uploadToCloudinary(item.localFile)
      console.log(`   Uploaded to Cloudinary: ${cloudinaryUrl}`)
    } catch (err) {
      console.warn(`   Cloudinary upload failed: ${err.message}. Fallback to relative path.`)
      cloudinaryUrl = `\${IMG_BASE_URL}/apj-block-images/3th-floor/faculty/${item.targetFilename}`
    }

    updatedFacultyList.push({
      name: item.name,
      department: item.department,
      designation: item.designation,
      roomId: item.roomId,
      image: cloudinaryUrl
    })
  }

  console.log('\nUpdating src/data/apj-block/third.js...')
  const thirdJsPath = path.join(__dirname, '../data/apj-block/third.js')
  let thirdContent = fs.readFileSync(thirdJsPath, 'utf8')

  const facultyArrayStr = `faculty: ${JSON.stringify(updatedFacultyList, null, 2)}`
  thirdContent = thirdContent.replace(/faculty:\s*\[[\s\S]*\]\s*\n\}/, `${facultyArrayStr}\n}`)
  fs.writeFileSync(thirdJsPath, thirdContent, 'utf8')
  console.log('   Updated third.js successfully!')

  console.log('\nUpdating Firestore layouts/Third-Floor document...')
  const docRef = db.collection('layouts').doc('Third-Floor')
  const snap = await docRef.get()

  if (!snap.exists) {
    console.error('Firestore document Third-Floor not found!')
    process.exit(1)
  }

  await docRef.update({
    faculty: updatedFacultyList,
    lastEdited: new Date().toISOString()
  })
  console.log('   Firestore Third-Floor updated successfully!')

  console.log('\nAll operations complete!')
}

main().catch((err) => {
  console.error('Error in script:', err)
  process.exit(1)
})
