import fs from 'fs';

const dbData = JSON.parse(fs.readFileSync('scratch/db_fourth_layout.json', 'utf8'));

// Format rooms in floors.js format
const formattedRooms = dbData.rooms.map(room => {
  // Convert id back to using dynamic floorId variable
  const idStr = `svm-\${floorId}-${room.id.replace('svm-fourth-', '')}`;
  
  return `  {
    id: \`${idStr}\`,
    name: '${room.name}',
    label: '${room.label}',
    type: '${room.type}',
    x: ${room.x},
    y: ${room.y},
    w: ${room.w},
    h: ${room.h},
    width: ${room.width || room.w},
    height: ${room.height || room.h},
    directions: '${room.directions.replace(/'/g, "\\'")}',
    description: '${room.description.replace(/'/g, "\\'")}',
    image: '${room.image}',
    tags: ${JSON.stringify(room.tags)},
    clickable: ${room.clickable !== false}
  }`;
}).join(',\n');

const code = `const getFourthFloorRooms = (floorId) => [\n${formattedRooms}\n];`;
fs.writeFileSync('scratch/updated_fourth_rooms.js', code);
console.log('Generated updated rooms code in scratch/updated_fourth_rooms.js');
