import { floorsData } from '../data/floorsData';
import { BuilderRoom, RoomType, Point } from '../types/builder';

export interface ExistingBuildingPreset {
  id: string;
  name: string;
  slug: string;
  floorCount: number;
  overview: string;
  theme: string;
  floors: { label: string; floorKey: string; index: number }[];
}

export const EXISTING_BUILDINGS_PRESETS: ExistingBuildingPreset[] = [
  {
    id: 'apj',
    name: 'APJ-BLOCK',
    slug: 'apj',
    floorCount: 7,
    overview: 'Primary computer laboratories, BTL research facilities, and core department rooms across 7 floors.',
    theme: 'blue',
    floors: [
      { label: 'Basement', floorKey: 'apj_basement', index: 0 },
      { label: 'Ground Floor', floorKey: 'apj_ground', index: 1 },
      { label: '1st Floor', floorKey: 'apj_first', index: 2 },
      { label: '2nd Floor', floorKey: 'apj_second', index: 3 },
      { label: '3rd Floor', floorKey: 'apj_third', index: 4 },
      { label: '4th Floor', floorKey: 'apj_fourth', index: 5 },
      { label: '5th Floor', floorKey: 'apj_fifth', index: 6 },
    ],
  },
  {
    id: 'cv-raman',
    name: 'CV-RAMAN BLOCK',
    slug: 'cv-raman',
    floorCount: 7,
    overview: 'Natural & applied sciences division with specialized physics, chemistry, and research cabins.',
    theme: 'emerald',
    floors: [
      { label: 'Basement', floorKey: 'cv_raman_basement', index: 0 },
      { label: 'Ground Floor', floorKey: 'cv_raman_ground', index: 1 },
      { label: '1st Floor', floorKey: 'cv_raman_first', index: 2 },
      { label: '2nd Floor', floorKey: 'cv_raman_second', index: 3 },
      { label: '3rd Floor', floorKey: 'cv_raman_third', index: 4 },
      { label: '4th Floor', floorKey: 'cv_raman_fourth', index: 5 },
      { label: '5th Floor', floorKey: 'cv_raman_fifth', index: 6 },
    ],
  },
  {
    id: 'ramanujan',
    name: 'RAMANUJAN BLOCK',
    slug: 'ramanujan',
    floorCount: 5,
    overview: 'Home to the main seminar hall, recruitment cells, placement offices, and math department.',
    theme: 'purple',
    floors: [
      { label: 'Ground Floor', floorKey: 'ramanujan_ground', index: 0 },
      { label: '1st Floor', floorKey: 'ramanujan_first', index: 1 },
      { label: '2nd Floor', floorKey: 'ramanujan_second', index: 2 },
      { label: '3rd Floor', floorKey: 'ramanujan_third', index: 3 },
      { label: '4th Floor', floorKey: 'ramanujan_fourth', index: 4 },
    ],
  },
  {
    id: 'smv',
    name: 'SMV BLOCK',
    slug: 'smv',
    floorCount: 7,
    overview: 'Engineering powerhouse with workshops, electronics testing, and computation centers across 7 levels.',
    theme: 'amber',
    floors: [
      { label: 'Ground Floor', floorKey: 'smv_ground', index: 0 },
      { label: '1st Floor', floorKey: 'smv_first', index: 1 },
      { label: '2nd Floor', floorKey: 'smv_second', index: 2 },
      { label: '3rd Floor', floorKey: 'smv_third', index: 3 },
      { label: '4th Floor', floorKey: 'smv_fourth', index: 4 },
      { label: '5th Floor', floorKey: 'smv_fifth', index: 5 },
      { label: '6th Floor', floorKey: 'smv_sixth', index: 6 },
    ],
  },
  {
    id: 'atal',
    name: 'ATAL BLOCK',
    slug: 'atal',
    floorCount: 4,
    overview: 'Dedicated innovation & incubation center housing Autoliv Incubation Centre and startup projects.',
    theme: 'rose',
    floors: [
      { label: 'Ground Floor', floorKey: 'atal_ground', index: 0 },
      { label: '1st Floor', floorKey: 'atal_first', index: 1 },
      { label: '2nd Floor', floorKey: 'atal_second', index: 2 },
      { label: '3rd Floor', floorKey: 'atal_third', index: 3 },
    ],
  },
  {
    id: 'rajraman',
    name: 'V . RAJRAMAN-BLOCK',
    slug: 'rajraman',
    floorCount: 4,
    overview: 'Latest block addition dedicated to cutting-edge information technology, data centers, and study zones.',
    theme: 'cyan',
    floors: [
      { label: 'Ground Floor', floorKey: 'rajraman_ground', index: 0 },
      { label: '1st Floor', floorKey: 'rajraman_first', index: 1 },
      { label: '2nd Floor', floorKey: 'rajraman_second', index: 2 },
      { label: '3rd Floor', floorKey: 'rajraman_third', index: 3 },
    ],
  },
];

function mapRoomType(rawType: string, roomName: string): RoomType {
  const nameLower = (roomName || '').toLowerCase();
  const typeLower = (rawType || '').toLowerCase();

  if (nameLower.includes('stair') || nameLower.includes('step')) return 'staircase';
  if (nameLower.includes('lift') || nameLower.includes('elevator')) return 'lift';
  if (nameLower.includes('washroom') || nameLower.includes('toilet') || nameLower.includes('restroom')) return 'washroom';
  if (nameLower.includes('lab')) return 'lab';
  if (nameLower.includes('class') || nameLower.includes('lecture') || nameLower.includes('hall') || nameLower.includes('seminar')) return 'classroom';
  if (nameLower.includes('staff')) return 'staffroom';
  if (nameLower.includes('corridor') || nameLower.includes('passage') || nameLower.includes('path')) return 'corridor';
  if (typeLower === 'hod' || nameLower.includes('cabin') || nameLower.includes('office') || nameLower.includes('principal') || nameLower.includes('registrar')) return 'office';

  if (typeLower === 'lab') return 'lab';
  if (typeLower === 'classroom') return 'classroom';
  if (typeLower === 'washroom') return 'washroom';
  if (typeLower === 'staircase') return 'staircase';
  if (typeLower === 'lift') return 'lift';
  if (typeLower === 'office' || typeLower === 'hod') return 'office';
  if (typeLower === 'corridor') return 'corridor';
  if (typeLower === 'staffroom') return 'staffroom';

  return 'other';
}

function mapToBuilderRoom(rawRoom: any, idx: number, facultyMap: Map<string, any[]>): BuilderRoom {
  const width = rawRoom.w ?? rawRoom.width ?? 100;
  const height = rawRoom.h ?? rawRoom.height ?? 80;
  const x = rawRoom.x ?? 0;
  const y = rawRoom.y ?? 0;
  const roomName = rawRoom.name || rawRoom.label || `Room ${idx + 1}`;
  const roomId = rawRoom.id || `room-${idx}-${Date.now()}`;

  let points: Point[] | undefined = undefined;
  if (Array.isArray(rawRoom.boundaryVertices) && rawRoom.boundaryVertices.length > 2) {
    points = rawRoom.boundaryVertices;
  } else if (Array.isArray(rawRoom.points) && rawRoom.points.length > 2) {
    points = rawRoom.points;
  } else {
    points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
  }

  // Get matching faculty for this room
  const assignedFaculty = facultyMap.get(roomId) || facultyMap.get(roomName) || [];
  const facultyList = assignedFaculty.map(f => ({
    id: `fac-${Date.now()}-${Math.random()}`,
    name: f.name || 'Faculty Member',
    image: f.image || '',
    description: f.description || '',
    department: f.department || ''
  }));

  return {
    id: roomId,
    name: roomName,
    type: mapRoomType(rawRoom.type, roomName),
    status: 'active',
    x,
    y,
    width,
    height,
    rotation: rawRoom.rotation || 0,
    accessibilityFlags: rawRoom.tags || [],
    images: rawRoom.image ? [rawRoom.image] : [],
    notes: rawRoom.description || '',
    directions: rawRoom.directions || '',
    customFields: [],
    doors: [],
    locked: rawRoom.clickable === false,
    points,
    facultyList: facultyList.length > 0 ? facultyList : undefined
  };
}

/**
 * Loads an existing building dataset and converts all floors into Smart Builder format.
 */
export async function loadExistingBuildingPreset(preset: ExistingBuildingPreset): Promise<Record<number, BuilderRoom[]>> {
  const resultFloorsData: Record<number, BuilderRoom[]> = {};

  for (const floorDef of preset.floors) {
    try {
      const loader = floorsData[floorDef.floorKey];
      if (loader) {
        const floorModule = await loader();
        if (floorModule) {
          const rawRooms = floorModule.rooms || [];
          const rawFaculty = floorModule.faculty || [];

          // Group faculty by roomId
          const facultyMap = new Map<string, any[]>();
          rawFaculty.forEach((f: any) => {
            const key = f.roomId || f.roomName;
            if (key) {
              if (!facultyMap.has(key)) facultyMap.set(key, []);
              facultyMap.get(key)!.push(f);
            }
          });

          const builderRooms = rawRooms.map((r: any, idx: number) => mapToBuilderRoom(r, idx, facultyMap));
          resultFloorsData[floorDef.index] = builderRooms;
        } else {
          resultFloorsData[floorDef.index] = [];
        }
      } else {
        resultFloorsData[floorDef.index] = [];
      }
    } catch (err) {
      console.warn(`[Building Importer] Could not load floor ${floorDef.floorKey}:`, err);
      resultFloorsData[floorDef.index] = [];
    }
  }

  return resultFloorsData;
}
