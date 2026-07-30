import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { FIREBASE_CONFIG } from './config'

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG)

// Enable modern Firebase v10 multi-tab persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

// Initialize Firebase Storage
const storage = getStorage(app)

export { db, storage }
