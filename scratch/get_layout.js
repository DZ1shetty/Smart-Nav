import admin from 'firebase-admin';
import fs from 'fs';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getLayout() {
  try {
    const docRef = db.collection('layouts').doc('Svm-Third-Floor');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.log('❌ Document Svm-Third-Floor does not exist in Firestore!');
      process.exit(1);
    }
    const data = docSnap.data();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching document:', err);
    process.exit(1);
  }
}

getLayout();
