# Workspace Project Guidelines & Mandatory Rules

## Mandatory Google Drive Backup Synchronization Rule
- **Rule**: Whenever any changes, updates, additions, deletions, or sync operations are performed on **rooms**, **faculty**, or **directions** (whether in Firestore, static data files in `src/data/`, admin scripts, or API endpoints), you MUST ALSO synchronize and update the **`Google_Drive_Backup`** directory (`Google_Drive_Backup`).
- **Action Steps**:
  1. Update `firestore_metadata.json` under `Google_Drive_Backup/<BuildingName>/<FloorLabel>/`.
  2. Update `directions.json` at floor level and `Directions/directions.json` & `Directions/directions.txt` inside `Google_Drive_Backup/<BuildingName>/<FloorLabel>/Directions/`.
  3. Ensure room images and faculty headshots are downloaded/copied to `Rooms/` and `Faculty/` subfolders if new media is added.
  4. Run `node src/scripts/export_directions_to_backup.js` or `node src/scripts/export_drive_structure.js` whenever bulk floor updates are performed.
