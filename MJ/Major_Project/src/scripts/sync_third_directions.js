import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const thirdFloorData = [
  { 
    id: "lh-310", 
    directions: "i. Stairs-1: Turn right; LH-310 is immediately on your right just outside the Stairs-1 exit.\nii. Stairs-2: Walk north and then turn right at the mid-floor corridor; LH-310 is on your right.\niii. LIFT: Turn right; LH-310 is directly to your right, adjacent to the Lift on the east side." 
  },
  { 
    id: "lh-308", 
    directions: "i. Stairs-1: Turn right and walk south a short distance; LH-308 is on your right, below LH-310.\nii. Stairs-2: Walk north and turn right; LH-308 is on your right in the mid-east section of the floor.\niii. LIFT: Turn right and walk south slightly; LH-308 is on your right just below the Lift level." 
  },
  { 
    id: "lh-306", 
    directions: "i. Stairs-1: Turn right and walk south past LH-308; LH-306 is further down on your right in the lower-east section.\nii. Stairs-2: Turn left and walk north slightly; LH-306 is on your right on the east side, near the south end.\niii. LIFT: Turn right and walk south past LH-308; LH-306 is on your right further south." 
  },
  { 
    id: "ladies-common-room", 
    directions: "i. Stairs-1: Turn left; the Ladies Room is on your left, directly below the Washroom near the Stairs-1 exit.\nii. Stairs-2: Walk north; the Ladies Room is on your left just above the mid-floor level, below the Washroom.\niii. LIFT: Turn left; the Ladies Room is on your left, directly beside the Lift on the west side." 
  },
  { 
    id: "texas-instruments", 
    directions: "i. Stairs-1: Turn left and walk south past the Lift and Ladies Room; the lab is on your left in the lower section, above Stairs-2.\nii. Stairs-2: Turn right; the lab is immediately on your left, just above Stairs-2.\niii. LIFT: Turn left and walk south; the lab is on your left near the bottom of the floor, just above Stairs-2." 
  },
  { 
    id: "lh-311", 
    directions: "i. Stairs-1: Turn left and walk to the top of the corridor; LH-311 is on your left, LH-312 is on the opposite side.\nii. Stairs-2: Walk straight north all the way to the top; LH-311 is on your left at the far end.\niii. LIFT: Turn left and walk north to the top of the corridor; LH-311 is on your left." 
  },
  { 
    id: "lh-312", 
    directions: "i. Stairs-1: Turn left and walk to the top of the corridor; LH-312 is on your right, LH-311 is on the opposite side.\nii. Stairs-2: Walk straight north all the way to the top; LH-312 is on your right at the far end.\niii. LIFT: Turn left and walk north to the top; LH-312 is on your right." 
  },
  { 
    id: "lh-309", 
    directions: "i. Stairs-1: Turn left and walk north a short distance; LH-309 is on your left, just below LH-311.\nii. Stairs-2: Walk straight north; LH-309 is on your left in the upper-middle section of the corridor.\niii. LIFT: Turn left and walk north; LH-309 is on your left, a few steps up from the Lift." 
  }
];

async function syncThirdDirections() {
  console.log('🚀 Syncing Third Floor directions to Firestore...');

  const docName = "Third-Floor";
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

    const directionsMap = {};
    thirdFloorData.forEach(item => {
      directionsMap[item.id] = item.directions;
    });

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

    batch.update(layoutRef, {
      rooms: updatedRooms,
      lastEdited: new Date().toISOString()
    });

    batch.set(directionsRef, {
      floorId: 'third',
      directions: directionsMap,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    await batch.commit();

    console.log(`✅ Successfully synced ${updatedCount} directions for Third Floor.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncThirdDirections();
