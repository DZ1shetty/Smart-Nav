import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Service Account (from env variable in production, or file in dev)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : process.env.FIREBASE_SERVICE_ACCOUNT;
} else if (fs.existsSync('./serviceAccountKey.json')) {
  serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
} else {
  console.error('CRITICAL ERROR: No Firebase service account credentials found!');
}

// 1. Initialize Firebase Admin
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const layoutsRef = db.collection('layouts');
const bookmarksRef = db.collection('bookmarks');
const activityLogsRef = db.collection('activityLogs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

/**
 * Formats floor IDs into Firestore document names cleanly.
 * Matches client's getFirestoreDocName in src/config.js.
 */
function getFirestoreDocName(floorId) {
  if (!floorId) return '';
  if (floorId.includes('_')) {
    return (
      floorId
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-') + '-Floor'
    );
  }
  return floorId.charAt(0).toUpperCase() + floorId.slice(1) + '-Floor';
}

// 2. READ Route
app.get('/api/layout/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;
    const docName = getFirestoreDocName(floorId);
    const doc = await layoutsRef.doc(docName).get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json({ rooms: [], locked: false });
    }
  } catch (error) {
    console.error('Fetch failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to map floorId to its static JS file path
function getStaticFilePath(floorId) {
  let folder = '';
  let filename = '';
  let exportName = '';

  if (floorId.startsWith('cv_raman_')) {
    folder = 'cv-raman-block';
    filename = floorId.replace('cv_raman_', '');
  } else if (floorId.startsWith('ramanujan_')) {
    folder = 'ramanujan-block';
    filename = floorId.replace('ramanujan_', '');
  } else if (floorId.startsWith('smv_')) {
    folder = 'smv-block';
    filename = floorId.replace('smv_', '');
  } else if (floorId.startsWith('svm_')) {
    folder = 'smv-block';
    filename = floorId.replace('svm_', '');
  } else if (floorId.startsWith('atal_')) {
    folder = 'atal-block';
    filename = floorId.replace('atal_', '');
  } else if (floorId.startsWith('rajraman_')) {
    folder = 'rajraman-block';
    filename = floorId.replace('rajraman_', '');
  } else {
    folder = 'apj-block';
    filename = floorId;
  }
  
  exportName = filename;
  filename = `${filename}.js`;
  
  return {
    filePath: path.join(__dirname, 'src/data', folder, filename),
    exportName
  };
}

// Helper to escape string for JS single-quoted literals
function escapeJsString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")     // Escape single quotes
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\n/g, '\\n');  // Escape newlines
}

// Helper to write static JavaScript file
function writeStaticFile(floorId, data) {
  try {
    const { filePath, exportName } = getStaticFilePath(floorId);
    
    // Format rooms
    const roomsCode = (data.rooms || []).map(room => {
      let imgUrl = room.image || '';
      if (imgUrl.includes('raw.githubusercontent.com') && imgUrl.includes('/public-backup')) {
        const parts = imgUrl.split('/public-backup');
        imgUrl = `\${IMG_BASE_URL}${parts[1]}`;
      }
      
      const imgStr = imgUrl.startsWith('${') ? `\`${imgUrl}\`` : `'${imgUrl}'`;
      
      return `    {
      id: '${room.id}',
      name: '${escapeJsString(room.name)}',
      label: '${escapeJsString(room.label)}',
      type: '${room.type || 'office'}',
      x: ${room.x || 0},
      y: ${room.y || 0},
      w: ${room.w || room.width || 0},
      h: ${room.h || room.height || 0},
      width: ${room.width || room.w || 0},
      height: ${room.height || room.h || 0},
      directions: '${escapeJsString(room.directions)}',
      description: '${escapeJsString(room.description)}',
      image: ${imgStr},
      tags: ${JSON.stringify(room.tags || [])},
      clickable: ${room.clickable !== false}${room.linkToFloor ? `,\n      linkToFloor: '${room.linkToFloor}'` : ''}
    }`;
    }).join(',\n');

    // Format boundary vertices
    const verticesCode = (data.boundaryVertices || []).map(v => `    { x: ${v.x}, y: ${v.y} }`).join(',\n');

    // Format faculty
    const facultyCode = (data.faculty || []).map(f => {
      return `    {
      name: '${escapeJsString(f.name)}',
      department: '${escapeJsString(f.department)}',
      roomId: '${escapeJsString(f.roomId)}',
      image: '${f.image || ''}'
    }`;
    }).join(',\n');

    const finalCode = `import { IMG_BASE_URL } from '../../config.js'

export const ${exportName} = {
  buildingName: '${data.buildingName || ''}',
  label: '${data.label || ''}',
  viewWidth: ${data.viewWidth || 1280},
  viewHeight: ${data.viewHeight || 1540},
  mainWidth: ${data.mainWidth || null},
  bulgeWidth: ${data.bulgeWidth || null},
  bulgeHeight: ${data.bulgeHeight || null},
  boundaryVertices: [
${verticesCode}
  ],
  rooms: [
${roomsCode}
  ],
  faculty: [
${facultyCode}
  ]
}
`;

    fs.writeFileSync(filePath, finalCode, 'utf8');
    console.log(`[Static Sync] Successfully wrote changes to static file: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`[Static Sync] Failed to write static file for ${floorId}:`, err);
    return false;
  }
}

// Helper to sync changes to Google_Drive_Backup
function syncGoogleDriveBackup(floorId, data) {
  try {
    const buildingName = (data.buildingName || 'GENERAL').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const floorLabel = (data.label || floorId).replace(/[/\\?%*:|"<>]/g, '_').trim();
    const backupDir = path.join(__dirname, 'Google_Drive_Backup');
    const floorFolder = path.join(backupDir, buildingName, floorLabel);
    const directionsFolder = path.join(floorFolder, 'Directions');

    fs.mkdirSync(directionsFolder, { recursive: true });

    // 1. Save document metadata
    fs.writeFileSync(path.join(floorFolder, 'firestore_metadata.json'), JSON.stringify(data, null, 2));

    // 2. Format directions
    const directionsObj = {};
    const detailedDirections = [];
    (data.rooms || []).forEach(room => {
      const rId = room.id || room.name;
      const rName = room.name || room.label || rId;
      if (room.directions && room.directions.trim() !== '') {
        directionsObj[rId] = room.directions;
        detailedDirections.push({
          roomId: rId,
          roomName: rName,
          directions: room.directions
        });
      }
    });

    const directionsData = {
      buildingName,
      floorLabel,
      floorId,
      lastUpdated: new Date().toISOString(),
      directions: directionsObj,
      detailedDirections
    };

    fs.writeFileSync(path.join(floorFolder, 'directions.json'), JSON.stringify(directionsData, null, 2));
    fs.writeFileSync(path.join(directionsFolder, 'directions.json'), JSON.stringify(directionsData, null, 2));

    let txtContent = `========================================================\n`;
    txtContent += `DIRECTIONS FOR ${buildingName.toUpperCase()} - ${floorLabel.toUpperCase()}\n`;
    txtContent += `========================================================\n\n`;
    if (detailedDirections.length === 0) {
      txtContent += `No specific room directions configured for this floor.\n`;
    } else {
      detailedDirections.forEach((item, index) => {
        txtContent += `${index + 1}. ${item.roomName} (ID: ${item.roomId})\n`;
        txtContent += `   Directions: ${item.directions}\n\n`;
      });
    }
    fs.writeFileSync(path.join(directionsFolder, 'directions.txt'), txtContent);

    // 3. Update directions collection in Firestore
    const docName = getFirestoreDocName(floorId);
    db.collection('directions').doc(docName).set({
      floorId,
      buildingName,
      directions: directionsObj,
      lastUpdated: new Date().toISOString()
    }, { merge: true }).catch(err => console.error('Failed to sync directions doc in Firestore:', err));

    console.log(`[Backup Sync] Updated Google_Drive_Backup for ${buildingName} / ${floorLabel}`);
  } catch (err) {
    console.error(`[Backup Sync] Failed to update Google_Drive_Backup for ${floorId}:`, err);
  }
}

// 3. WRITE Route (Save)
app.post('/api/layout/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;
    const {
      rooms,
      boundaryVertices,
      viewWidth,
      viewHeight,
      mainWidth,
      bulgeWidth,
      bulgeHeight,
      faculty,
      buildingName,
      label,
      lastEditedBy
    } = req.body;
    
    const docName = getFirestoreDocName(floorId);
    if (!Array.isArray(rooms)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const layoutData = {
      floorId,
      buildingName: buildingName || '',
      label: label || '',
      viewWidth: viewWidth || 1280,
      viewHeight: viewHeight || 1540,
      mainWidth: mainWidth || null,
      bulgeWidth: bulgeWidth || null,
      bulgeHeight: bulgeHeight || null,
      boundaryVertices: boundaryVertices || [],
      rooms,
      faculty: faculty || [],
      lastEdited: new Date().toISOString(),
      lastEditedBy: lastEditedBy || 'admin',
      locked: true
    };
    
    // Save to Firestore
    await layoutsRef.doc(docName).set(layoutData);
    
    // Sync to local file
    writeStaticFile(floorId, layoutData);
    
    // Sync to Google Drive Backup
    syncGoogleDriveBackup(floorId, layoutData);

    res.json({ success: true });
  } catch (error) {
    console.error('Save failed:', error);
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

// 4. UNLOCK Route
app.patch('/api/layout/:floorId/unlock', async (req, res) => {
  try {
    const { floorId } = req.params;
    const docName = getFirestoreDocName(floorId);
    await layoutsRef.doc(docName).update({ locked: false });
    res.json({ success: true });
  } catch (error) {
    console.error('Unlock failed:', error);
    res.status(500).json({ error: 'Failed to unlock' });
  }
});

// 5. Bookmarks - GET User Bookmarks
app.get('/api/bookmarks/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const doc = await bookmarksRef.doc(username.toLowerCase()).get();
    if (doc.exists) {
      res.json(doc.data().roomIds || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Fetch bookmarks failed:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// 6. Bookmarks - Toggle User Bookmark (Add/Remove)
app.post('/api/bookmarks/:username/toggle', async (req, res) => {
  try {
    const { username } = req.params;
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }
    const docRef = bookmarksRef.doc(username.toLowerCase());
    
    let isBookmarked = false;
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      let roomIds = [];
      if (doc.exists) {
        roomIds = doc.data().roomIds || [];
      }
      
      const index = roomIds.indexOf(roomId);
      if (index > -1) {
        roomIds.splice(index, 1);
        isBookmarked = false;
      } else {
        roomIds.push(roomId);
        isBookmarked = true;
      }
      
      transaction.set(docRef, { roomIds, lastUpdated: new Date().toISOString() });
    });
    
    res.json({ success: true, isBookmarked });
  } catch (error) {
    console.error('Toggle bookmark failed:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// 7. Activity Logs - Save search/navigation actions
app.post('/api/activity-log', async (req, res) => {
  try {
    const { type, query, roomId, floorKey, username, metadata } = req.body;
    
    const logData = {
      type: type || 'search',
      query: query || '',
      roomId: roomId || null,
      floorKey: floorKey || null,
      username: username || 'guest',
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };
    
    await activityLogsRef.add(logData);
    res.json({ success: true });
  } catch (error) {
    console.error('Log activity failed:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Serve static production build (Vite dist) if available
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Firestore-backed server running on port ${PORT}`);
});
