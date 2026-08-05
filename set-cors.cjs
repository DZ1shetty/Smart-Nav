const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'smart-nav-44e26'
});

const bucket = admin.storage().bucket();

async function setCors() {
  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
      responseHeader: ['*'],
      maxAgeSeconds: 3600
    }
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration successfully updated!');
  } catch (error) {
    console.error('Error setting CORS configuration:', error);
  }
}

setCors();
