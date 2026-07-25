import * as floors from '../src/data/svm-block/floors.js';
import fs from 'fs';

const staticData = floors.fourth;
const firestoreData = JSON.parse(fs.readFileSync('scratch/db_fourth_layout.json', 'utf8'));
const forceStaticCoords = true;

const updatedRooms = (staticData.rooms || []).map(sRoom => {
  const fRoom = (firestoreData.rooms || []).find(r => r.id === sRoom.id || r.id === sRoom.id.replace('svm-fourth-', 'svm-fourth-'));
  if (fRoom) {
    const res = {
      ...sRoom,
      x:      forceStaticCoords ? sRoom.x : (fRoom.x ?? sRoom.x),
      y:      forceStaticCoords ? sRoom.y : (fRoom.y ?? sRoom.y),
      w:      forceStaticCoords ? sRoom.w : (fRoom.w ?? sRoom.w),
      h:      forceStaticCoords ? sRoom.h : (fRoom.h ?? sRoom.h),
      width:  forceStaticCoords ? (sRoom.width  ?? sRoom.w)  : (fRoom.width  ?? fRoom.w  ?? sRoom.width  ?? sRoom.w  ?? 0),
      height: forceStaticCoords ? (sRoom.height ?? sRoom.h)  : (fRoom.height ?? fRoom.h  ?? sRoom.height ?? sRoom.h  ?? 0),
      directions:  fRoom.directions  || sRoom.directions  || '',
      description: fRoom.description || sRoom.description || '',
      image:       sRoom.image       || fRoom.image       || '',
    };
    for (const [k, v] of Object.entries(res)) {
      if (v === undefined) {
        console.log(`❌ Room ${sRoom.id} has undefined field: ${k}`);
      }
    }
    return res;
  }
  return sRoom;
});

console.log('Test run finished.');
