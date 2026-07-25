import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

async function run() {
  try {
    const rules = admin.securityRules()
    
    const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`

    console.log('Deploying new Firestore rules...')
    const ruleset = await rules.releaseFirestoreRulesetFromSource(newRules)
    console.log(`Successfully deployed ruleset: ${ruleset.name}`)
  } catch (error) {
    console.error('Error deploying rules:', error)
  }
  process.exit(0)
}

run()
