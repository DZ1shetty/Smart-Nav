# 🚀 APJ-Block Smart Navigation - Team Setup Guide

> [!TIP]
> **AI Setup Prompt**: If you are using an AI coding assistant (like Antigravity or Claude), copy and paste the prompt at the bottom of this file into your agent to get fully synced in seconds.

Welcome to the team! This document will help you get the project running on your local machine and ensure you are synced with the global database.

---

## 🛠️ 1. Initial Setup

### Clone the Repository
```bash
git clone https://github.com/DZ1shetty/Smart_Nav.git
cd MJ/Major_Project
```

### Install Dependencies
```bash
npm install
```

---

## 🔐 2. Missing Configuration (CRITICAL)

For security reasons, certain files are **NOT** included in the GitHub repository. You must obtain these from the project lead (DZ1shetty) or the shared group:

1.  **`serviceAccountKey.json`**: Required to run the database sync scripts (`repair_firestore.js`) and the backend server (`server.js`). 
    *   *Action*: Place this file in the root directory: `MJ/Major_Project/serviceAccountKey.json`.
2.  **Firebase Config (.env)**: The sensitive API keys are now moved to a `.env` file for security. You must create a `.env` file in the root directory and add the following keys (get the actual values from the project lead):
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    ```

---

## 🏃 3. Running the Project

### Start the Frontend (Vite)
This starts the development server.
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Start the Backend (Optional)
Required if you want to test the local layout saving API.
```bash
node server.js
```

---

## 📂 4. Project Structure & Workflow

### How Data Works
We use a **Hybrid System**:
1.  **Static Files**: Room lists and basic metadata are defined in `src/data/apj-block/*.js`.
2.  **Firestore**: Coordinates (`x`, `y`), dimensions (`w`, `h`), and descriptions are stored in the Cloud.

### Adding New Rooms
If you need to add a new room:
1.  Add the room object to the appropriate file in `src/data/apj-block/`.
2.  **DO NOT** worry about coordinates initially.
3.  Run the **Repair Script** (see below) to push the new room to Firestore.
4.  Open the app in your browser, enter **Edit Mode**, move the room to the correct spot, and click **SAVE**.

---

## 🔄 5. Database Syncing

If you pull new changes from GitHub and the layout looks broken or rooms are missing, run the repair script:

```bash
node repair_firestore.js
```

**What this script does:**
*   Adds any new rooms you've defined in the code to Firestore.
*   **Protects existing layout edits**: It will NOT overwrite coordinates or descriptions that have been manually adjusted in the browser.

---

## 🎨 6. Design Standards

To maintain visual consistency across all floors:
*   **HOD Cabins**: Must have `type: "hod"` in the JS data. This automatically colors them **Orange**.
*   **Staff Rooms**: Name them simply `"STAFF ROOM"`. Avoid department prefixes like `(ISE)` in the label.
*   **Legibility**: The global font size for labels is managed in `src/index.css`. For 4th and 5th floors, we use `30px` for better readability.

---

## 📡 7. Image Assets
All floor plan images are hosted via a **Cloud CDN**. 
*   To use local images for testing, change `IS_CLOUD = false` in `src/config.js`.
*   To use production images, keep `IS_CLOUD = true`.

---

**Happy Coding!** If you have any issues, check the browser console for Firestore connection errors.

---

## 🤖 Master AI Setup Prompt
If you are using an AI agent (like Antigravity), paste this entire block into your first chat:

```text
"I am working on the Smart Navigation project. I have just cloned the repository from GitHub. To make this project work exactly like the lead developer's setup, please follow these instructions:

1. Analyze the Environment: I am providing you with the serviceAccountKey.json and src/config.js. Use these to understand our Firebase connection.
2. Single Source of Truth: This project uses a hybrid system where room lists are in src/data/ but coordinates and descriptions are pulled from Firestore. 
3. Database Sync: Use the repair_firestore.js script to ensure my local environment is synced with the Cloud. 
4. Initialize Features:
   - Ensure IS_CLOUD is set to true in src/config.js to use the GitHub CDN for images.
   - Check that FloorPlan.jsx is correctly saving coordinates and descriptions to Firestore.
   - Verify that the HOD cabins are correctly colored orange based on the hod type.
5. Run the Project: Help me run npm install and npm run dev. If I need the local layout API, help me run node server.js.

Goal: Make sure the website on my laptop is perfectly synchronized with the global layout and data structure used by the rest of the team."
```
