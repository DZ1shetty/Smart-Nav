import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function read() {
  const doc = await db.collection('layouts').doc('Rajraman-Ground-Floor').get();
  if (!doc.exists) {
    console.log('❌ Rajraman-Ground-Floor Document not found!');
  } else {
    const data = doc.data();
    console.log('=== Rajraman-Ground-Floor ===');
    console.log('Rooms:', data.rooms.map(r => ({ id: r.id, name: r.name, x: r.x, y: r.y })));
    console.log('Boundary Vertices:', JSON.stringify(data.boundaryVertices));
  }
  process.exit(0);
}

read();
