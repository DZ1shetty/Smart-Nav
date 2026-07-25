import admin from 'firebase-admin'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function search() {
  const layoutsSnap = await db.collection('layouts').get()
  
  layoutsSnap.forEach(doc => {
    const data = doc.data()
    const rooms = data.rooms || []
    rooms.forEach(room => {
      // Look for coordinate matches or room names containing "STAFFROOM"
      const xDiff1 = Math.abs((room.x || 0) - 202)
      const yDiff1 = Math.abs((room.y || 0) - 171)
      const xDiff2 = Math.abs((room.x || 0) - 534)
      const yDiff2 = Math.abs((room.y || 0) - 179)
      
      const isMatch1 = xDiff1 <= 10 && yDiff1 <= 10
      const isMatch2 = xDiff2 <= 10 && yDiff2 <= 10
      
      const isStaffRoomName = room.name && room.name.toUpperCase().includes('STAFFROOM')
      
      if (isMatch1 || isMatch2 || isStaffRoomName) {
        console.log(`Document: ${doc.id}`)
        console.log(`Room:`, room)
        console.log('---')
      }
    })
  })
  
  process.exit(0)
}

search()
