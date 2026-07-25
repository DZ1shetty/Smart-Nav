import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function read() {
  const doc = await db.collection('layouts').doc('Rajraman-First-Floor').get();
  if (!doc.exists) {
    console.log('❌ Rajraman-First-Floor Document not found!');
  } else {
    const data = doc.data();
    console.log('=== Rajraman-First-Floor ===');
    console.log('Rooms:', JSON.stringify(data.rooms, null, 2));
    console.log('Boundary Vertices:', JSON.stringify(data.boundaryVertices));
  }
  process.exit(0);
}

read();
