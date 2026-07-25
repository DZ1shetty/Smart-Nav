import admin from 'firebase-admin';
import fs from 'fs';
import { ground } from '../src/data/svm-block/floors.js';

// Verify serviceAccountKey exists
if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing! Place it in the root folder.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const docName = 'Svm-Ground-Floor';

async function sync() {
  console.log(`🚀 Syncing ${docName} layout to Firestore...`);

  const layoutData = {
    floorId: 'svm_ground',
    label: ground.label || 'Ground Floor',
    buildingName: ground.buildingName || 'SVM-BLOCK',
    rooms: ground.rooms,
    faculty: ground.faculty,
    boundaryVertices: ground.boundaryVertices,
    mapImage: ground.mapImage || null,
    locked: true,
    lastEdited: new Date().toISOString()
  };

  try {
    await db.collection('layouts').doc(docName).set(layoutData);
    console.log(`✅ Success! Firestore document "${docName}" successfully synchronized!`);
  } catch (err) {
    console.error(`❌ Sync failed:`, err);
  }

  process.exit(0);
}

sync();
