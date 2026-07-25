import admin from 'firebase-admin';
import fs from 'fs';
import * as svm from '../src/data/svm-block/floors.js';

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

// Floor mappings
const floorKeys = ['ground', 'first', 'second', 'third', 'fourth', 'fifth'];

function getFirestoreDocName(floorId) {
  if (!floorId) return '';
  if (floorId.includes('_')) {
    return (
      floorId
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-') + '-Floor'
    );
  }
  return floorId.charAt(0).toUpperCase() + floorId.slice(1) + '-Floor';
}

async function syncAll() {
  console.log('🚀 Starting synchronization of all SVM Block floors to Firestore...');

  for (const key of floorKeys) {
    const floorData = svm[key];
    const floorId = `svm_${key}`;
    const docName = getFirestoreDocName(floorId);

    console.log(`📤 Syncing ${docName}...`);

    const layoutData = {
      floorId,
      label: floorData.label || `${key.charAt(0).toUpperCase() + key.slice(1)} Floor`,
      buildingName: floorData.buildingName || 'SVM-BLOCK',
      rooms: floorData.rooms,
      faculty: floorData.faculty,
      boundaryVertices: floorData.boundaryVertices,
      mapImage: floorData.mapImage || null,
      locked: true,
      lastEdited: new Date().toISOString()
    };

    try {
      await db.collection('layouts').doc(docName).set(layoutData);
      console.log(`✅ Success! Firestore document "${docName}" successfully synchronized!`);
    } catch (err) {
      console.error(`❌ Failed to sync ${docName}:`, err);
    }
  }

  console.log('🎉 All SVM Block floors synchronized successfully!');
  process.exit(0);
}

syncAll();
