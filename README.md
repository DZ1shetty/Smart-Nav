# 🧭 SmartNav — Campus Navigation System

> An intelligent, real-time indoor navigation system for university campuses built with React, Vite, TailwindCSS, Framer Motion, and Firebase Firestore.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![PWA Ready](https://img.shields.io/badge/PWA-v4_Cache-0052CC?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Playwright](https://img.shields.io/badge/Testing-Playwright_E2E-2EAD33?logo=playwright)](https://playwright.dev)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features & Recent Updates](#-key-features--recent-updates)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Critical: Missing Secret Files](#-critical-missing-secret-files)
- [Firebase Setup](#-firebase-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [How Data Works](#-how-data-works)
- [Admin Features](#-admin-features)
- [Automated Testing](#-automated-testing)
- [Deployment on Render](#-deployment-on-render)
- [Database & Backup Scripts](#-database--backup-scripts)
- [Design & Performance Standards](#-design--performance-standards)
- [AI Setup Prompt](#-ai-setup-prompt)

---

## 🏫 About the Project

**SmartNav** is a state-of-the-art campus navigation web application designed for students, faculty, and campus visitors. It offers an intuitive visual interface to locate academic rooms, research labs, faculty offices, and administrative departments across multiple campus blocks.

---

## ✨ Key Features & Recent Updates

- **📸 Universal Image Management (Cloudinary)**: Consistent, robust image uploading workflows across Faculty, Rooms, and Building modals leveraging Cloudinary.
- **↩️ Non-Destructive Undo Clear**: Context-aware undo buttons for all image upload zones, allowing accidental image deletions to be safely reverted instantly.
- **🤳 Mobile-Native Camera Capture**: Contextual "Capture with Camera" buttons exclusively for mobile devices utilizing HTML5 `capture="environment"`, launching the native camera directly for rapid in-field room and building image uploads.
- **🪞 Glassmorphic "Under Construction" State**: Redesigned Setup in Progress modals utilizing minimalist, blurred frosted-glass aesthetics ensuring visual consistency.
- **🎨 Magic UI Bento Grid Building Selector**: Asymmetric, responsive 3-column desktop and 1-column mobile building selection grid with animated, real-time lab marquee loops (*BTL Labs*, *Autoliv Incubation Centre*, *Physics & Chemistry Labs*, *Placement Offices*, *IT Cells*).
- **📱 Responsive Mobile Navigation & Glassmorphic Sheet**: Sleek, zero-overflow top navigation header with a slide-down `MobileOptionsSheet` housing map zoom, recenter, faculty directory, and theme toggle controls.
- **⚡ 80% Faster Bundle via Rollup Vendor Splitting**: Configured code-splitting chunks (`vendor-firebase`, `vendor-framer`, `vendor-sentry`, `vendor-lucide`, `vendor-framework`) reducing initial JavaScript payload from 1,718 kB down to 340 kB.
- **💀 Blueprint Skeleton Loaders**: `FloorMapSkeleton` and `ModalSkeleton` components replace white screens for instant perceived map loads.
- **🌙 Single Source Theme View Transitions**: Smooth circular `startViewTransition` clip-path theme animations with non-Chromium fallback and zero flicker.
- **📶 Service Worker v4 Offline PWA Caching**: `smart-nav-offline-cache-v4` provides 0ms instant reloads and full offline map navigation support.
- **🔍 Intelligent Search & Faculty Directory**: Instant search across rooms, faculty dossiers, and administrative offices with automated route drawing.
- **🧪 Automated Playwright E2E Test Suite**: Full end-to-end integration test coverage for room searching, building selection, and navigation routing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, Framer Motion |
| **Components** | Magic UI Bento Grid, Lucide Icons, Sonner Toasts |
| **Backend API** | Node.js, Express 5 |
| **Database** | Firebase Firestore (Real-time sync + Offline persistence) |
| **Auth / Admin** | Firebase Admin SDK (`serviceAccountKey.json`) |
| **Testing** | Playwright E2E Suite (`e2e/smart-nav.spec.js`) |
| **Service Worker** | PWA Stale-While-Revalidate Caching (v4) |
| **Image CDN** | GitHub raw content (`raw.githubusercontent.com`) |
| **Deployment** | Render (Web Service) |

---

## 📦 Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ — [https://nodejs.org](https://nodejs.org)
- **npm** v9+ (bundled with Node.js)
- **Git** — [https://git-scm.com](https://git-scm.com)
- A **Firebase project** (see [Firebase Setup](#-firebase-setup))

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

### 3. Add Secret Credentials (`.env` & `serviceAccountKey.json`)

See the [Missing Secret Files](#-critical-missing-secret-files) section below.

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Critical: Missing Secret Files

> **CAUTION**: These credentials are intentionally excluded from the repository via `.gitignore` for security. The application requires them to connect to Firestore and backend administrative APIs.

### File 1: `.env` (Firebase Client Configuration)

Create a `.env` file in the **project root** directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Obtain these values from: **Firebase Console → Project Settings → General → Your apps → Web app config**.

### File 2: `serviceAccountKey.json` (Firebase Admin SDK)

Place `serviceAccountKey.json` in the **project root** directory.

Required for:
- Express backend server layout APIs (`server.js`)
- Admin database sync scripts (`node src/scripts/repair_firestore.js`)

Obtain from: **Firebase Console → Project Settings → Service Accounts → Generate New Private Key → Download JSON**.

---

## 🔥 Firebase Setup

If connecting to a fresh Firebase project:

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) → Create Project.
2. Enable **Firestore Database** in Production mode.
3. Configure Firestore Security Rules:

```javascript
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

4. Download `serviceAccountKey.json` and save it to the project root.
5. Seed Firestore with campus room data:

```bash
node src/scripts/repair_firestore.js
```

---

## 🏃 Running the Application

### Full Development Mode (Frontend + Backend)

```bash
npm run dev
```

Starts Vite frontend on port `5173` and Express backend on port `3001` concurrently.

### Frontend Only

```bash
npm run dev:vite
```

### Backend Only

```bash
npm run server
```

### Production Build & Bundle Verification

```bash
npm run build
```

---

## 🧪 Automated Testing

SmartNav includes an automated Playwright End-to-End (E2E) testing suite:

### Run E2E Tests Locally

```bash
npm run test:e2e
```

### Run Live Staging E2E Tests

```bash
npm run test:live
```

---

## 📂 Project Structure

```
Smart-Nav/
├── src/
│   ├── components/
│   │   ├── BuildingBentoGrid.jsx  # Magic UI Bento Grid Building Selector
│   │   ├── MobileOptionsSheet.jsx # Glassmorphic Mobile Controls Sheet
│   │   ├── FloorPlan.jsx          # Interactive Map & Canvas Renderer
│   │   ├── HomePage.jsx           # SmartNav Landing View
│   │   ├── FloorMapSkeleton.jsx   # Blueprint Map Loading Skeleton
│   │   ├── ModalSkeleton.jsx      # Modal Loading Skeleton
│   │   ├── ThemeToggle.jsx        # Circular View Transition Theme Toggle
│   │   ├── ChatbotWidget.jsx      # Navigation AI Assistant
│   │   └── SearchSystem.jsx       # Room & Faculty Search Engine
│   ├── data/                      # Static campus floor data
│   ├── context/
│   │   └── ThemeContext.jsx       # Single-source Theme Provider & Clip-Path Animation
│   ├── utils/                     # Preloader, SW Registration, & Slug Helpers
│   └── scripts/                   # Firestore sync & backup scripts
├── e2e/                           # Playwright E2E spec tests
├── public/                        # PWA manifest, service worker (sw.js), logo assets
├── server.js                      # Express backend service
└── vite.config.js                 # Rollup vendor code-splitting configuration
```

---

## 🌐 Deployment on Render

### Deploy as a Web Service

1. Push your latest code to GitHub repository (`DZ1shetty/Smart-Nav`).
2. Navigate to [Render Dashboard](https://render.com) → **New Web Service**.
3. Connect repository `DZ1shetty/Smart-Nav`.
4. Configure Build & Start parameters:

| Parameter | Value |
|-----------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node server.js` |
| **Node Version** | `18` |

5. Add environment variables in Render Dashboard (`VITE_FIREBASE_API_KEY`, etc.).
6. Add `serviceAccountKey.json` via **Render Secret Files** tab.

---

## 🔄 Database & Backup Scripts

All administrative utility scripts are located in `src/scripts/`:

### Sync Data to Firestore

```bash
node src/scripts/repair_firestore.js
```

### Export Offline Drive Structure Backup

```bash
node src/scripts/export_drive_structure.js
```

### Export Directions Backup

```bash
node src/scripts/export_directions_to_backup.js
```

---

## 🎨 Design & Performance Standards

- **Brand Aesthetic**: Minimalist, Apple/Vercel inspired dark-mode ready UI.
- **Accessibility**: High contrast ratios, ARIA attributes (`aria-label`, `aria-expanded`), and full keyboard navigation.
- **SEO & PWA**: Primary meta tags, OpenGraph preview cards, Twitter cards, `robots.txt`, `sitemap.xml`, and PWA `manifest.json`.

---

## 🤖 AI Setup Prompt

When working with an AI coding assistant (Antigravity, Claude, etc.), paste the prompt below for instant context sync:

```text
I am working on the SmartNav campus navigation system (https://github.com/DZ1shetty/Smart-Nav.git).
Key Context:
1. Tech Stack: React 18 + Vite 5, TailwindCSS 3, Framer Motion, Firebase Firestore, Express Backend.
2. Architecture: Magic UI Bento Grid, MobileOptionsSheet, single-source ThemeContext startViewTransition.
3. Performance: Rollup vendor splitting (vendor-firebase, vendor-framer, vendor-sentry), SW v4 caching, Blueprint Skeletons.
4. Secrets required: .env and serviceAccountKey.json in project root.
5. Dev command: npm run dev (Vite port 5173, Express port 3001).
6. Testing: npm run test:e2e (Playwright suite in e2e/smart-nav.spec.js).

Please ensure all changes preserve data safety, Firestore rules, and zero-clipping mobile layouts.
```

---

## 👥 Contributors

- **DZ1shetty** — Project Lead & Full-Stack Developer

---

## 📄 License

This project is created for academic and educational purposes. All rights reserved 2026.
