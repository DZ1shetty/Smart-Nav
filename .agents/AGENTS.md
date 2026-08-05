# Workspace Project Guidelines & Mandatory Rules

## Mandatory Google Drive Backup Synchronization Rule
- **Rule**: Whenever any changes, updates, additions, deletions, or sync operations are performed on **rooms**, **faculty**, or **directions** (whether in Firestore, static data files in `src/data/`, admin scripts, or API endpoints), you MUST ALSO synchronize and update the **`Google_Drive_Backup`** directory (`Google_Drive_Backup`).
- **Action Steps**:
  1. Update `firestore_metadata.json` under `Google_Drive_Backup/<BuildingName>/<FloorLabel>/`.
  2. Update `directions.json` at floor level and `Directions/directions.json` & `Directions/directions.txt` inside `Google_Drive_Backup/<BuildingName>/<FloorLabel>/Directions/`.
  3. Ensure room images and faculty headshots are downloaded/copied to `Rooms/` and `Faculty/` subfolders if new media is added.
  4. Run `node src/scripts/export_directions_to_backup.js` or `node src/scripts/export_drive_structure.js` whenever bulk floor updates are performed.

## Mandatory Pre-Execution Credentials Check Rule
- **Trigger**: Whenever the user asks to "run", "execute", "start", "launch", or "serve" the website/app (e.g., `npm run dev`, `vite`, or any dev-server command).
- **Rule**: You MUST pause and ask the user the following **before** running any server or execution command:
  1. **Firestore credentials** — Confirm that the Firebase project credentials (API key, project ID, auth domain, etc. in the Firebase config) are correctly set up and belong to the correct Firebase project.
  2. **`serviceAccountKey.json`** — Confirm that the `serviceAccountKey.json` file (used for admin SDK / backend scripts) is present in the project root and has been obtained from the correct Firebase project's Admin Console (Firebase Console → Project Settings → Service Accounts → Generate new private key).
- **Action**: Only proceed with the execution command **after** the user confirms both of the above are in place. If either is missing or uncertain, guide the user to obtain them from the Firebase Admin Console before continuing.

## Mandatory Image Upload Workflow Rule
- **Rule**: All future image uploads in the app must use the **Cloudinary direct upload workflow via `XMLHttpRequest`** (using an Unsigned Upload Preset), rather than uploading through Firebase Storage.
- **Reason**: To permanently offload heavy bandwidth and storage costs from Firebase to Cloudinary.
- **Action**: Whenever implementing or modifying image uploads, ensure the code uploads the file directly to the Cloudinary API endpoint and stores only the resulting `secure_url` in Firestore.
