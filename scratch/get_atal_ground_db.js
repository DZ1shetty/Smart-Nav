import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function getLayout() {
  const docSnap = await db.collection('layouts').doc('Atal-Ground-Floor').get();
  if (docSnap.exists) {
    fs.writeFileSync('scratch/atal_ground_db.json', JSON.stringify(docSnap.data(), null, 2));
    console.log('SUCCESS');
  }
  process.exit(0);
}
getLayout();