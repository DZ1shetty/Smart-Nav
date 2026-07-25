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
    const ruleset = await rules.getFirestoreRuleset()
    console.log('--- Current Firestore Rules ---')
    console.log(ruleset.source[0].content)
    console.log('-------------------------------')
  } catch (error) {
    console.error('Error fetching security rules:', error)
  }
  process.exit(0)
}

run()
