import admin from 'firebase-admin';
import fs from 'fs';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function readSecondFloor() {
  const doc = await db.collection('layouts').doc('Svm-Second-Floor').get();
  if (!doc.exists) {
    console.log('❌ Document not found!');
    process.exit(1);
  }
  const data = doc.data();
  console.log('=== BOUNDARY VERTICES ===');
  console.log(JSON.stringify(data.boundaryVertices, null, 2));
  console.log('\n=== ROOMS (id, x, y, w, h) ===');
  for (const r of data.rooms) {
    console.log(`${r.id.padEnd(45)} x:${String(r.x).padStart(6)}  y:${String(r.y).padStart(6)}  w:${String(r.w||r.width).padStart(5)}  h:${String(r.h||r.height).padStart(5)}`);
  }
  process.exit(0);
}

readSecondFloor();
