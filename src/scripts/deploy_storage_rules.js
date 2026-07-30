/**
 * deploy_storage_rules.js
 *
 * Deploys Firebase Storage security rules using the Firebase Admin SDK.
 * This opens the Storage bucket to public read and write so image uploads work.
 *
 * Usage: node src/scripts/deploy_storage_rules.js
 */

import admin from 'firebase-admin'
import { createRequire } from 'module'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const serviceAccount = require('../../serviceAccountKey.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

const STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
      allow delete: if true;
    }
  }
}`

async function deployStorageRules() {
  console.log('🔐 Deploying Firebase Storage security rules...\n')

  try {
    // Get an access token from the service account
    const token = await admin.app().options.credential.getAccessToken()
    const accessToken = token.access_token

    const projectId = serviceAccount.project_id
    console.log(`📦 Project: ${projectId}`)

    // Step 1: Create a new ruleset
    const createBody = JSON.stringify({
      source: {
        files: [
          {
            content: STORAGE_RULES,
            name: 'storage.rules',
          },
        ],
      },
    })

    const ruleset = await apiRequest(
      'POST',
      `/v1/projects/${projectId}/rulesets`,
      accessToken,
      createBody
    )

    const rulesetName = ruleset.name
    console.log(`✅ Created ruleset: ${rulesetName}`)

    // Step 2: Get current Storage release name
    const releases = await apiRequest(
      'GET',
      `/v1/projects/${projectId}/releases`,
      accessToken
    )

    // Find the firebase.storage release
    const storageRelease = (releases.releases || []).find((r) =>
      r.name && r.name.includes('firebase.storage')
    )

    if (storageRelease) {
      // Step 3: Update existing release using correct PATCH body (no 'release' wrapper)
      const result = await apiRequest(
        'PATCH',
        `/v1/${storageRelease.name}?updateMask=rulesetName`,
        accessToken,
        JSON.stringify({ rulesetName })
      )
      console.log(`✅ Updated existing Storage release:`, result.name || storageRelease.name)
    } else {
      // Step 3: Create new release (POST body must have 'release' key per API docs)
      const releaseBody = JSON.stringify({
        name: `projects/${projectId}/releases/firebase.storage`,
        rulesetName,
      })
      const result = await apiRequest(
        'POST',
        `/v1/projects/${projectId}/releases`,
        accessToken,
        releaseBody
      )
      console.log(`✅ Created new Storage release:`, result.name)
    }

    console.log('\n🎉 Firebase Storage rules deployed successfully!')
    console.log('   Uploads from the browser should now work.\n')
  } catch (err) {
    console.error('❌ Error deploying rules:', err.message || err)
    if (err.response) console.error('   Response:', err.response)
  }

  process.exit(0)
}

function apiRequest(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firebaserules.googleapis.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 400) {
            reject({ message: `HTTP ${res.statusCode}`, response: parsed })
          } else {
            resolve(parsed)
          }
        } catch {
          reject({ message: 'Failed to parse response', response: data })
        }
      })
    })

    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

deployStorageRules()
