import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')

const fileHashMap = {} // hash -> array of relative file paths

function scanDir(dir, baseDir = projectRoot) {
  if (!fs.existsSync(dir)) return
  const items = fs.readdirSync(dir)
  items.forEach(it => {
    const fullPath = path.join(dir, it)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (it !== 'node_modules' && it !== '.git' && it !== 'dist') {
        scanDir(fullPath, baseDir)
      }
    } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(it)) {
      const buf = fs.readFileSync(fullPath)
      const hash = crypto.createHash('md5').update(buf).digest('hex')
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
      fileHashMap[hash] = fileHashMap[hash] || []
      fileHashMap[hash].push(relPath)
    }
  })
}

console.log('Scanning public/ and Google_Drive_Backup/ for duplicate image files...')
scanDir(path.join(projectRoot, 'public'))
scanDir(path.join(projectRoot, 'Google_Drive_Backup'))

const duplicates = Object.entries(fileHashMap).filter(([hash, files]) => files.length > 1)
console.log(`Found ${duplicates.length} sets of duplicate image files.\n`)

duplicates.sort((a, b) => b[1].length - a[1].length)

duplicates.forEach(([hash, files]) => {
  if (files.length > 2 || files.some(f => f.includes('ccl41') || f.includes('lc26') || f.includes('lc27'))) {
    console.log(`Hash ${hash} (${files.length} duplicate copies):`)
    files.forEach(f => console.log(`   - ${f}`))
    console.log('')
  }
})
