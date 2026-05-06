import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function peekFifthFloor() {
  const doc = await db.collection('layouts').doc('Fifth-Floor').get();
  if (doc.exists) {
    const rooms = doc.data().rooms || [];
    console.log('Room IDs in Firestore (Fifth Floor):');
    rooms.forEach(r => console.log(` - ${r.id}`));
  } else {
    console.log('Document not found');
  }
}

peekFifthFloor();
