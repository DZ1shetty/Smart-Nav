import { fourth } from '../src/data/apj-block/fourth.js';
import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function test() {
  const docRef = db.collection('layouts').doc('Fourth-Floor');
  const snap = await docRef.get();
  const firestoreData = snap.data();
  const staticData = fourth;
  const forceStaticCoords = false;

  const updatedRooms = (staticData.rooms || []).map((sRoom, idx) => {
    const fRoom = (firestoreData.rooms || []).find(r => r.id === sRoom.id);
    if (fRoom) {
      const res = {
        ...sRoom,
        x:      forceStaticCoords ? sRoom.x : (fRoom.x ?? sRoom.x),
        y:      forceStaticCoords ? sRoom.y : (fRoom.y ?? sRoom.y),
        w:      forceStaticCoords ? sRoom.w : (fRoom.w ?? sRoom.w),
        h:      forceStaticCoords ? sRoom.h : (fRoom.h ?? sRoom.h),
        width:  forceStaticCoords ? (sRoom.width  ?? sRoom.w)  : (fRoom.width  ?? fRoom.w  ?? sRoom.width  ?? sRoom.w  ?? 0),
        height: forceStaticCoords ? (sRoom.height ?? sRoom.h)  : (fRoom.height ?? fRoom.h  ?? sRoom.height ?? sRoom.h  ?? 0),
        directions:  fRoom.directions  || sRoom.directions  || '',
        description: fRoom.description || sRoom.description || '',
        image:       sRoom.image       || fRoom.image       || '',
      };
      for (const [k, v] of Object.entries(res)) {
        if (v === undefined) {
          console.log(`❌ Room ${idx} (${sRoom.id}) has undefined field: ${k}`);
        }
      }
      return res;
    }
    return sRoom;
  });
  console.log('Done test.');
  process.exit(0);
}

test();
