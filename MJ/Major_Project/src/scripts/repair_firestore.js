import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ground } from '../data/apj-block/ground.js';
import { first } from '../data/apj-block/first.js';
import { second } from '../data/apj-block/second.js';
import { third } from '../data/apj-block/third.js';
import { fourth } from '../data/apj-block/fourth.js';
import { fifth } from '../data/apj-block/fifth.js';

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const floorsDataMap = {
  'ground': ground,
  'first': first,
  'second': second,
  'third': third,
  'fourth': fourth,
  'fifth': fifth
};

async function repairFirestore() {
  console.log('🛠️ Starting Firestore Image Repair...');

  for (const [floorId, staticData] of Object.entries(floorsDataMap)) {
    const docName = floorId.charAt(0).toUpperCase() + floorId.slice(1) + "-Floor";
    const docRef = db.collection('layouts').doc(docName);

    console.log(`Processing ${docName}...`);

    try {
      const snap = await docRef.get();
      if (!snap.exists) {
        console.warn(`⚠️ Document ${docName} not found in Firestore. Creating it from static data.`);
        await docRef.set({
          floorId,
          rooms: staticData.rooms,
          faculty: staticData.faculty,
          mapImage: staticData.mapImage || null,
          locked: true,
          lastEdited: new Date().toISOString()
        });
        continue;
      }

      const firestoreData = snap.data();
      // Sync rooms list: Use all rooms from static data, but preserve directions/metadata if they exist in Firestore
      const updatedRooms = staticData.rooms.map(sRoom => {
        const fRoom = firestoreData.rooms.find(r => r.id === sRoom.id);
        if (fRoom) {
          // PREFER FIRESTORE for spatial data (coordinates/size) and metadata
          // This allows users to move rooms in the browser and have those changes stick
          return {
            ...sRoom,
            x: fRoom.x ?? sRoom.x,
            y: fRoom.y ?? sRoom.y,
            w: fRoom.w ?? sRoom.w,
            h: fRoom.h ?? sRoom.h,
            width: fRoom.width ?? sRoom.width,
            height: fRoom.height ?? sRoom.height,
            directions: fRoom.directions || sRoom.directions || '',
            description: fRoom.description || sRoom.description || '',
            image: sRoom.image || fRoom.image || ''
          };
        }
        return sRoom;
      });

      // Sync faculty list completely from static data to allow for renames
      const updatedFaculty = staticData.faculty;

      await docRef.update({
        rooms: updatedRooms,
        faculty: updatedFaculty,
        lastEdited: new Date().toISOString()
      });

      console.log(`✅ ${docName} updated.`);
    } catch (error) {
      console.error(`❌ Error updating ${docName}:`, error);
    }
  }

  console.log('✨ Firestore Image Repair Complete!');
  process.exit(0);
}

repairFirestore();
