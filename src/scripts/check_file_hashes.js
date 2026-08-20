import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')

function getHash(filePath) {
  if (!fs.existsSync(filePath)) return 'FILE_NOT_FOUND'
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(buf).digest('hex')
}

const ccl41Hash = getHash(path.join(projectRoot, 'public', 'ccl41_door.png'))
console.log('Hash of public/ccl41_door.png:', ccl41Hash)

const cv2ndDir = path.join(projectRoot, 'public', 'cv-raman-block-images', 'second-floor')
const cv2ndFiles = fs.readdirSync(cv2ndDir)

console.log('\n--- Hashes in public/cv-raman-block-images/second-floor ---')
cv2ndFiles.forEach(f => {
  const fp = path.join(cv2ndDir, f)
  const h = getHash(fp)
  const isDupOfCcl41 = (h === ccl41Hash)
  console.log(`File: ${f} -> Hash: ${h} (Is duplicate of CCL-41 image? ${isDupOfCcl41})`)
})
