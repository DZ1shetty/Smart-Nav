import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'smart-nav-44e26.firebasestorage.app',
})

const bucket = admin.storage().bucket()
const IMAGES_DIR = path.join(
  __dirname,
  '../../OLD_LOCAL_DATA/public-backup/apj-block-images'
)

async function uploadFile(filePath, destPath) {
  await bucket.upload(filePath, {
    destination: destPath,
    public: true, // This attempts to make the file publicly readable
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  })

  // Format for Firebase Storage public URL (Storage APIs)
  // If public:true fails due to bucket settings, this URL might still need a token.
  // But we'll try the direct Google Cloud Storage public link first.
  return `https://storage.googleapis.com/${bucket.name}/${destPath}`
}

async function startUpload() {
  console.log('🚀 Starting Firebase Storage Upload...')
  const mapping = {}

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Local images directory not found!')
    process.exit(1)
  }

  function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const name = path.join(dir, file)
      if (fs.statSync(name).isDirectory()) {
        getFiles(name, allFiles)
      } else {
        // Only upload image files
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
          allFiles.push(name)
        }
      }
    }
    return allFiles
  }

  const files = getFiles(IMAGES_DIR)
  console.log(`📦 Found ${files.length} images to upload.`)

  for (const file of files) {
    const relativePath = path.relative(IMAGES_DIR, file).replace(/\\/g, '/')
    const destPath = `apj-block-images/${relativePath}`

    process.stdout.write(`📤 Uploading: ${relativePath}... `)
    try {
      const url = await uploadFile(file, destPath)
      mapping[relativePath] = url
      console.log('✅')
    } catch (err) {
      console.log('❌')
      console.error(`   Error: ${err.message}`)
    }
  }

  fs.writeFileSync('./image_mapping.json', JSON.stringify(mapping, null, 2))
  console.log('\n✨ All done!')
  console.log('📄 Mapping saved to image_mapping.json')
  process.exit(0)
}

startUpload()
