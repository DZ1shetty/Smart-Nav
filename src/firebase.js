import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { FIREBASE_CONFIG } from './config'

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG)

// Enable modern Firebase v10 multi-tab persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export { db }
