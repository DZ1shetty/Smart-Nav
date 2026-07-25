import admin from 'firebase-admin';
import fs from 'fs';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function read() {
  const doc = await db.collection('layouts').doc('Ground-Floor').get();
  if (!doc.exists) {
    console.log('❌ Ground-Floor Document not found!');
  } else {
    const data = doc.data();
    console.log('=== Ground-Floor ===');
    const ramanujanPathRoom = data.rooms?.find(r => r.id === 'apj-ground-ramanujan-path');
    console.log('Ramanujan Path Room:', JSON.stringify(ramanujanPathRoom, null, 2));
  }
  process.exit(0);
}

read();
