import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const fourthFloorData = [
  { id: "staff-room-top-left", directions: "i. Stairs-1: Turn right, cross the center area to the left side of the building, then turn right and walk to the very top.\nii. Stairs-2: Turn left towards the left side of the building, turn right and walk all the way up.\niii. LIFT: Turn left to the left wall, then turn right and walk all the way up." },
  { id: "csl-06", directions: "i. Stairs-1: Turn right, cross over to the left side of the floor, turn right and walk past CSL 05.\nii. Stairs-2: Turn left towards the left hallway, turn right and walk straight up past the Washroom.\niii. LIFT: Turn left to the left hallway, turn right and walk past CSL 05." },
  { id: "csl-05", directions: "i. Stairs-1: Turn right, cross over to the left area, turn right and it will be on your left.\nii. Stairs-2: Turn left to the left side, turn right and walk past the Washroom.\niii. LIFT: Turn left across the hall, then turn right and it is immediately there." },
  { id: "washroom-4", directions: "i. Stairs-1: Turn right and cross straight into the middle intersection, it is right there.\nii. Stairs-2: Turn left to the left hallway, turn right and walk past the HOD Cabin.\niii. LIFT: Turn left and walk straight, the washroom is exactly in front of you." },
  { id: "cse-hod-cabin", directions: "i. Stairs-1: Turn right, walk towards the Washroom, then turn left.\nii. Stairs-2: Turn left to the left hallway, turn right and walk past CSL 03.\niii. LIFT: Turn left, walk straight, and it is immediately on your right." },
  { id: "csl-03", directions: "i. Stairs-1: Turn right, cross towards the left side, turn left and walk past the HOD Cabin.\nii. Stairs-2: Turn left to the left hallway, and turn right to walk past CSL 04.\niii. LIFT: Turn left to the left side, then turn left to walk past the HOD Cabin." },
  { id: "csl-04", directions: "i. Stairs-1: Turn right, cross to the left side, turn left and walk all the way down past CSL 03.\nii. Stairs-2: Turn left to the left side, and it is the first room on your left.\niii. LIFT: Turn left to the left side, turn left and walk to the very end." },
  { id: "isl-03", directions: "i. Stairs-1: Turn left and walk up past ISL 02.\nii. Stairs-2: Walk straight ahead along the right side passing the middle area.\niii. LIFT: Turn right, then turn left and walk past ISL 02." },
  { id: "isl-02", directions: "i. Stairs-1: Turn left, and it is the very first room on your right.\nii. Stairs-2: Walk straight ahead along the right side, just past the middle intersection.\niii. LIFT: Turn right, then turn left. It is immediately on your right." },
  { id: "isl-01", directions: "i. Stairs-1: Turn right and walk down past the Server Room.\nii. Stairs-2: Walk straight ahead past CSL 02.\niii. LIFT: Turn right, then turn right and walk down. It is on your left." },
  { id: "csl-02", directions: "i. Stairs-1: Turn right and walk down past ISL 01.\nii. Stairs-2: Walk straight ahead. It is the first room on your right.\niii. LIFT: Turn right, then turn right and walk down past ISL 01." },
  { id: "csl-01", directions: "i. Stairs-1: Turn right and walk all the way straight down to the end.\nii. Stairs-2: Turn right, and it is immediately there on your right.\niii. LIFT: Turn right, then turn right and walk all the way down to the end." },
  { id: "staff-room-top-center", directions: "i. Stairs-1: Walk forward and turn left, go all the way to the top wall, then turn left again.\nii. Stairs-2: Walk straight ahead through the entire building to the top wall, then turn left.\niii. LIFT: Turn right, walk all the way to the top, then turn left." },
  { id: "csl-07", directions: "i. Stairs-1: Turn left and walk straight ahead to the very end.\nii. Stairs-2: Walk straight ahead along the right side of the building all the way to the top.\niii. LIFT: Turn right, and walk straight all the way to the top." },
  { id: "staff-room-mid-left", directions: "i. Stairs-1: Turn right, cross to the left hallway, turn right to go up. It is on your right.\nii. Stairs-2: Turn left to the left hallway, turn right and walk past the Washroom. It is on your right.\niii. LIFT: Turn left to the left hallway, turn right to go up. It is on your right." },
  { id: "staff-room-mid-right", directions: "i. Stairs-1: Turn left and walk slightly up. It is on your left.\nii. Stairs-2: Walk straight ahead along the right hallway past the middle intersection. It is on your left.\niii. LIFT: Turn right to the right hallway, turn left to go up. It is on your left." },
  { id: "stairs-top-4", directions: "Exit to your right into the hallway." },
  { id: "lift-4", directions: "Exit straight forward into the center intersection." },
  { id: "ups-room", directions: "i. Stairs-1: Turn right, cross to the left hallway, turn left to walk down. It is on your left.\nii. Stairs-2: Turn left to the left hallway, turn right to walk up. It is on your right.\niii. LIFT: Turn left to the left hallway, turn left to walk down. It is on your left." },
  { id: "server-room", directions: "i. Stairs-1: Turn right to walk down the hallway. It is on your right.\nii. Stairs-2: Walk straight ahead along the right hallway, and it is on your left.\niii. LIFT: Turn right to the right hallway, turn right to walk down. It is on your right." },
  { id: "isl-04", directions: "i. Stairs-1: Turn right, cross to the left side, turn left and walk to the very end.\nii. Stairs-2: Turn left, and it is immediately there straight ahead on your left.\niii. LIFT: Turn left to the left side, turn left and walk to the very end." },
  { id: "stairs-bottom-4", directions: "Exit straight forward into the bottom corridor." }
];

async function syncFourthDirections() {
  console.log('🚀 Syncing Fourth Floor directions to Firestore...');

  const docName = "Fourth-Floor";
  const layoutRef = db.collection('layouts').doc(docName);
  const directionsRef = db.collection('directions').doc(docName);

  try {
    const snap = await layoutRef.get();
    if (!snap.exists) {
      console.error(`❌ Document ${docName} not found in Firestore layouts!`);
      process.exit(1);
    }

    const firestoreData = snap.data();
    const firestoreRooms = firestoreData.rooms || [];

    // Create a mapping for local directions
    const directionsMap = {};
    fourthFloorData.forEach(item => {
      directionsMap[item.id] = item.directions;
    });

    // Update firestore rooms
    let updatedCount = 0;
    const updatedRooms = firestoreRooms.map(fRoom => {
      if (directionsMap[fRoom.id]) {
        updatedCount++;
        return { ...fRoom, directions: directionsMap[fRoom.id] };
      }
      return fRoom;
    });

    console.log(`📝 Prepared updates for ${updatedCount} rooms.`);

    const batch = db.batch();

    // 1. Update layouts collection
    batch.update(layoutRef, {
      rooms: updatedRooms,
      lastEdited: new Date().toISOString()
    });

    // 2. Update directions collection
    batch.set(directionsRef, {
      floorId: 'fourth',
      directions: directionsMap,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    await batch.commit();

    console.log(`✅ Successfully synced ${updatedCount} directions for Fourth Floor.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncFourthDirections();
