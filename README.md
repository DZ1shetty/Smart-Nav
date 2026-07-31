# 🧭 Smart Nav — Campus Navigation System

> A intelligent, real-time indoor navigation system for university campuses, built with React + Firebase Firestore.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Critical: Missing Secret Files](#-critical-missing-secret-files)
- [Firebase Setup](#-firebase-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [How Data Works](#-how-data-works)
- [Admin Features](#-admin-features)
- [Image Assets CDN](#-image-assets-cdn)
- [Deployment Render](#-deployment-render)
- [Database Scripts](#-database-scripts)
- [Design Standards](#-design-standards)
- [AI Setup Prompt](#-ai-setup-prompt)

---

## 🏫 About the Project

**Smart Nav** is a full-stack campus navigation web app that lets students and visitors:

- View interactive floor plan maps for multiple buildings and floors
- Search for rooms, faculty, or departments instantly
- Get step-by-step directions between any two rooms
- View faculty dossiers with photos and office locations
- Ask the built-in AI chatbot for navigation help
- See live update notifications when admin makes changes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TailwindCSS 3, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | Firebase Firestore (real-time, persistent offline cache) |
| Auth/Admin | Firebase Admin SDK (serviceAccountKey.json) |
| Image CDN | GitHub raw content (raw.githubusercontent.com) |
| Deployment | Render (Web Service) |

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18+ — https://nodejs.org
- **npm** v9+ (comes with Node.js)
- **Git** — https://git-scm.com
- A **Firebase project** (see Firebase Setup section below)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DZ1shetty/Smart-Nav.git
cd Smart-Nav
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Secret Files (CRITICAL - see next section)

### 4. Start the Dev Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🔐 Critical: Missing Secret Files

> **CAUTION**: These files are intentionally excluded from the repository for security reasons. The project **will not function** without them. You must obtain these from the project lead or set up your own Firebase project.

### File 1: `.env` (Firebase Client Keys)

Create a file named `.env` in the **project root** (same folder as `package.json`) with:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from: Firebase Console → Your Project → Project Settings → General → Your apps → Web app config.

### File 2: `serviceAccountKey.json` (Firebase Admin SDK)

Place a file named `serviceAccountKey.json` in the **project root**.

This file is required for:
- Running the backend server (`server.js`) — handles layout save/load API
- Running database sync scripts (`node src/scripts/repair_firestore.js`)
- Running the Firestore export scripts

Get this file from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key → Download JSON → Rename to `serviceAccountKey.json`.

> **WARNING**: Never commit `serviceAccountKey.json` or `.env` to GitHub. Both are already listed in `.gitignore`. Do not remove them from `.gitignore` under any circumstances.

---

## 🔥 Firebase Setup

If you are setting up a fresh Firebase project (not connecting to an existing one):

1. Go to https://console.firebase.google.com → Add Project
2. Enable **Firestore Database** → Start in Production mode
3. Set Firestore Rules to allow authenticated reads:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. In Project Settings → Service Accounts → Generate New Private Key → save as `serviceAccountKey.json` in project root
5. In Project Settings → General → Your apps → Add Web App → Copy config into `.env`
6. Run the database seed script to populate Firestore with room data:

```bash
node src/scripts/repair_firestore.js
```

---

## 🏃 Running the Project

### Full Dev Mode (Frontend + Backend together)

```bash
npm run dev
```

This starts both the Vite frontend (port 5173) and the Express backend (port 3001) concurrently.

### Frontend Only

```bash
npm run dev:vite
```

### Backend Only

```bash
npm run server
```

### Production Build

```bash
npm run build
```

---

## 📂 Project Structure

```
Smart-Nav/
├── src/
│   ├── components/         # All React UI components
│   │   ├── FloorPlan.jsx   # Main floor map + edit mode
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── ChatbotWidget.jsx     # AI chatbot
│   │   ├── UpdateBanner.jsx      # Live update notifications
│   │   └── ...
│   ├── data/               # Static room/faculty data per building and floor
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context (global state)
│   ├── store/              # Zustand global store
│   ├── utils/              # Helper utilities
│   ├── scripts/            # Admin Node.js scripts (run from terminal)
│   │   ├── repair_firestore.js             # Sync static data to Firestore
│   │   ├── export_drive_structure.js       # Export full backup
│   │   └── export_directions_to_backup.js
│   ├── config.js           # Central config (CDN, Firebase, image resolver)
│   └── firebase.js         # Firebase app initialization
├── public/                 # Static local assets (images, icons)
├── Google_Drive_Backup/    # Offline backup of Firestore data
├── OLD_LOCAL_DATA/         # Legacy image assets served via GitHub CDN
├── server.js               # Express backend (layout save/load API)
├── serviceAccountKey.json  # NOT in repo - get from project lead
├── .env                    # NOT in repo - get from project lead
└── package.json
```

---

## 🗄️ How Data Works

This project uses a Hybrid Data System:

```
Static JS Files (src/data/)     <->     Firestore (Cloud)
     Room names, types                  Coordinates (x, y, w, h)
     Faculty info                       Descriptions, photos
     Floor structure                    Admin edits, live updates
```

### Data Flow

1. **On page load** — App fetches the latest layout from Firestore (cloud)
2. **Offline fallback** — If no internet, app uses localStorage cache (last known good state)
3. **Admin edits** — Saved immediately to Firestore and broadcast to all connected users via real-time listener
4. **Update notifications** — Users see a notification banner when admin pushes a change while they are on the page

### Multi-device Sync

The Firestore real-time listener (onSnapshot) means **all open browser tabs and devices** see admin changes within seconds — no manual refresh needed.

---

## 🔧 Admin Features

Admins can access edit mode to:

- Drag and resize room boxes on the floor map
- Edit room descriptions, types, and photos
- Manage faculty — add/edit/remove faculty members with headshots
- Push updates — all users are notified automatically
- Draw directions — define walkthrough paths between rooms

To enter admin/edit mode, use the designated admin password in the app settings.

---

## 🖼️ Image Assets CDN

Images are served from GitHub's raw content CDN in production:

```
https://raw.githubusercontent.com/DZ1shetty/Smart_Nav/main/OLD_LOCAL_DATA/public-backup/
```

### Local vs Cloud Images

| Environment | Image Source |
|-------------|-------------|
| localhost | Local public/ folder (automatic) |
| Production (Render, etc.) | GitHub CDN (automatic) |

This is controlled automatically in `src/config.js` — no manual switching needed.

If you add new images locally, push them to the `OLD_LOCAL_DATA/public-backup/` folder on GitHub to make them available in production.

---

## 🌐 Deployment Render

### Deploy as a Web Service on Render

1. Push your code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repository (DZ1shetty/Smart-Nav)
4. Configure:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |
| Node Version | 18 |

5. Add **Environment Variables** in Render's dashboard (copy all keys from your `.env` file):
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID

6. Add `serviceAccountKey.json` via **Render Secret Files**:
   - Render Dashboard → Your Service → Secret Files
   - Add File → Filename: `serviceAccountKey.json`
   - Paste the full JSON content of your serviceAccountKey.json file

> **IMPORTANT**: Do NOT paste serviceAccountKey.json content as a plain environment variable. Use Render's Secret Files feature so it is written as an actual file that server.js can read.

7. Click **Deploy** — Render builds and hosts your site automatically.

---

## 🔄 Database Scripts

All scripts are in `src/scripts/` and are run from the project root:

### Sync Static Data to Firestore

```bash
node src/scripts/repair_firestore.js
```

Adds new rooms from `src/data/` to Firestore without overwriting existing layout edits.

### Export Full Firestore Backup

```bash
node src/scripts/export_drive_structure.js
```

Downloads all Firestore data and images to `Google_Drive_Backup/` for offline use.

### Export Directions Only

```bash
node src/scripts/export_directions_to_backup.js
```

> **NOTE**: All scripts require `serviceAccountKey.json` in the project root.

---

## 🎨 Design Standards

| Element | Rule |
|---------|------|
| HOD Cabins | Must have `type: "hod"` in JS data — renders Orange |
| Staff Rooms | Label as simply "STAFF ROOM" (no dept prefix) |
| Font sizes | Floors 4–5 use 30px for better label legibility |
| Color system | Defined in src/index.css CSS variables |
| Animations | Framer Motion — use existing motion variants from components |

---

## 🤖 AI Setup Prompt

If you are using an AI coding assistant (Antigravity, Claude, etc.), paste this into your first message to get fully synced instantly:

```
I am working on the Smart Nav campus navigation project. I have just cloned the repository from https://github.com/DZ1shetty/Smart-Nav.git

Here is what you need to know:
1. Tech stack: React 18 + Vite 5, Firebase Firestore (real-time), Express backend, TailwindCSS + Framer Motion
2. Data: Room lists are static in src/data/. Coordinates, descriptions, and photos are stored in Firestore.
3. Secrets needed: .env (Firebase client keys) and serviceAccountKey.json (Firebase Admin) - get from project lead.
4. Images: Served from GitHub CDN in production, auto-switched to local on localhost via src/config.js
5. Dev command: npm run dev (starts both Vite on port 5173 and Express on port 3001)
6. DB sync: node src/scripts/repair_firestore.js (syncs static data to Firestore without overwriting manual edits)

Please help me:
- Verify .env and serviceAccountKey.json are in place
- Run npm install then npm run dev
- Confirm Firestore is connected (check browser console for [SmartNav Config] log)
- Run the repair_firestore.js script if rooms are missing from the map
```

---

## 👥 Contributors

| Name | Role |
|------|------|
| DZ1shetty | Project Lead, Full-Stack Developer |

---

## 📄 License

This project is for academic/educational purposes. All rights reserved 2025.
