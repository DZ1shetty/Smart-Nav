import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')

const sampleUrls = [
  // APJ Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/apj-block-images/ground-floor/alumni-lounge.jpg',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/apj-block-images/ground-floor/ground-board-room.jpg',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/apj-block-images/basement/eel02.png',
  
  // Atal Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/atal-block-images/ground-floor/al01.png',
  
  // CV Raman Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/cv-raman-block-images/second-floor/lc26.png',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/cv-raman-block-images/second-floor/lc27.png',
  
  // Rajraman Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/rajraman-block-images/lab1.png',
  
  // Ramanujan Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/ramanujan-block-images/lh001.png',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/ramanujan-block-images/lh201.png',
  
  // SMV Block
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/ccl41_door.png',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/nc01_door.png',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/smv01_door.png',
  'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/adl01_door.png',
]

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode })
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message })
    })
  })
}

async function verifyAll() {
  console.log('Testing GitHub CDN URLs for all 7 campus buildings...\n')
  for (const url of sampleUrls) {
    const res = await checkUrl(url)
    console.log(`[${res.status === 200 ? '✅ 200 OK' : '❌ ' + res.status}] ${url}`)
  }
}

verifyAll()
