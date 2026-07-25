import admin from 'firebase-admin'
import fs from 'fs'

const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function syncFifthDirections() {
  console.log(
    '🚀 Syncing Fifth Floor directions from local JSON to Firestore...'
  )

  const localPath = './OLD_LOCAL_DATA/data/layouts/fifth.json'
  const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'))
  const localRooms = localData.rooms || []

  const docName = 'Fifth-Floor'
  const layoutRef = db.collection('layouts').doc(docName)
  const directionsRef = db.collection('directions').doc(docName)

  try {
    const snap = await layoutRef.get()
    if (!snap.exists) {
      console.error(`❌ Document ${docName} not found in Firestore layouts!`)
      process.exit(1)
    }

    const firestoreData = snap.data()
    const firestoreRooms = firestoreData.rooms || []

    // Create a mapping of roomId -> directions from local data
    const localDirectionsMap = {}
    const idMapping = {
      washroom: 'washroom-5',
      lab: 'lab-csl08',
      'stairs-top': 'stairs-top-5',
      lift: 'lift-5',
      'stairs-bottom': 'stairs-bottom-5',
    }

    localRooms.forEach((room) => {
      if (room.directions && room.directions !== 'TBD') {
        const firestoreId = idMapping[room.id] || room.id
        localDirectionsMap[firestoreId] = room.directions
      }
    })

    // Update firestore rooms with local directions
    let updatedCount = 0
    const updatedRooms = firestoreRooms.map((fRoom) => {
      if (localDirectionsMap[fRoom.id]) {
        updatedCount++
        return { ...fRoom, directions: localDirectionsMap[fRoom.id] }
      }
      return fRoom
    })

    console.log(`📝 Prepared updates for ${updatedCount} rooms.`)

    // Batch update
    const batch = db.batch()

    // 1. Update layouts collection
    batch.update(layoutRef, {
      rooms: updatedRooms,
      lastEdited: new Date().toISOString(),
    })

    // 2. Update directions collection
    batch.set(
      directionsRef,
      {
        floorId: 'fifth',
        directions: localDirectionsMap,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    )

    await batch.commit()

    console.log(
      `✅ Successfully synced ${updatedCount} directions for Fifth Floor.`
    )
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

syncFifthDirections()
