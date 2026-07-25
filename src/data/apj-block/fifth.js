import { IMG_BASE_URL } from '../../config.js'

export const fifth = {
  buildingName: 'APJ-BLOCK',
  label: 'Fifth Floor',
  viewWidth: 1280,
  viewHeight: 1540,
  mainWidth: 960,
  bulgeWidth: 320,
  bulgeHeight: 500,
  boundaryVertices: [
    { x: 5, y: 10 },
    { x: 960, y: 10 },
    { x: 960, y: 520 },
    { x: 1280, y: 520 },
    { x: 1280, y: 1020 },
    { x: 960, y: 1020 },
    { x: 960, y: 1540 },
    { x: 5, y: 1540 }
  ],
  rooms: [
  {
    "id": "staff-room-top",
    "name": "STAFF ROOM",
    "label": "STAFF ROOM",
    "type": "staffroom",
    "x": 321,
    "y": 38,
    "w": 304,
    "h": 69,
    "width": 304,
    "height": 69,
    "directions": "Top center area.",
    "description": "Top level staff workspace",
    "image": "https://placehold.co/600x400?text=Staff+Room+Top",
    "tags": [
      "office",
      "ise"
    ],
    "clickable": true
  },
  {
    "id": "lh-505",
    "name": "LH-505",
    "label": "LH-505",
    "type": "classroom",
    "x": 34,
    "y": 46,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. Stairs-1: Turn left and pass LH-504 and LH-506. Turn left through the gap between the two staff rooms, walk straight, and then turn right to reach the classroom.\nII. Stairs-2: turn left and follow along the path,pass along two staff rooms and the ISE HOD ,and LH-503 ,continue staright ahead to find LH-505\nIII. LIFT: turn left.you will see the ISE HOD;turn right again to pass LH-503 continue staright ahead to find LH-505",
    "description": "Lecture Hall 505",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh-505.jpeg",
    "tags": [
      "class",
      "ise",
      "lh505"
    ],
    "clickable": true
  },
  {
    "id": "lh-503",
    "name": "LH-503",
    "label": "LH-503",
    "type": "classroom",
    "x": 36,
    "y": 339,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. Stairs-1: Turn right and then turn right again. You will see the ISE HOD straight ahead; walk towards it and then turn left to reach LH-503.\nII. Stairs-2: Turn left and then turn right. Walk along the two staff rooms and the ISE HOD; LH-503 is located immediately after the ISE HOD.\nIII. LIFT: Turn left and then turn right again to reach the LH-503 classroom.",
    "description": "Lecture Hall 503",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh503.png",
    "tags": [
      "class",
      "ise",
      "lh503"
    ],
    "clickable": true
  },
  {
    "id": "washroom-5",
    "name": "WASHROOM",
    "label": "WASHROOM",
    "type": "utility",
    "x": 36,
    "y": 552,
    "w": 220,
    "h": 90,
    "width": 220,
    "height": 90,
    "directions": "Left side middle.",
    "description": "Restroom facilities",
    "image": "https://placehold.co/600x400?text=Washroom",
    "tags": [
      "toilet"
    ],
    "clickable": true
  },
  {
    "id": "hod-cabin",
    "name": "ISE HOD",
    "label": "ISE HOD",
    "type": "hod",
    "x": 36,
    "y": 682,
    "w": 220,
    "h": 180,
    "width": 220,
    "height": 180,
    "directions": "I. Stairs-1: Turn right and then turn right again. Look straight ahead to find the ISE HOD.\nII. Stairs-2: Turn left and then turn right. Pass along the two staff rooms; the ISE HOD will be directly ahead.\nIII. LIFT: Turn left to find the ISE HOD exactly in front of you.",
    "description": "Head of Department - ISE",
    "image": "https://raw.githubusercontent.com/DZ1shetty/Smart_Nav/refs/heads/main/MJ/Major_Project/OLD_LOCAL_DATA/public-backup/apj-block-images/5th-floor/hod_cabinise.jpeg",
    "tags": [
      "hod",
      "office",
      "ise"
    ],
    "clickable": true
  },
  {
    "id": "staff-room-left",
    "name": "STAFF ROOM",
    "label": "STAFF ROOM",
    "type": "staffroom",
    "x": 36,
    "y": 1034,
    "w": 180,
    "h": 120,
    "width": 180,
    "height": 120,
    "directions": "Left side, lower middle.",
    "description": "CSE Staff workspace",
    "image": "https://placehold.co/600x400?text=Staff+Room+Left",
    "tags": [
      "office",
      "cse"
    ],
    "clickable": true
  },
  {
    "id": "lab-csl08",
    "name": "CSL 08",
    "label": "CSL 08",
    "type": "lab",
    "x": 36,
    "y": 1334,
    "w": 180,
    "h": 90,
    "width": 180,
    "height": 90,
    "directions": "I. Stairs-1: Turn right and pass along LH-502 and LH-500. Continue past Stairs-2; CSL08 is located immediately next to the Library.\nII. Stairs-2: Turn left and pass the Library; CSL08 is located immediately next to the Library.\nIII. LIFT: Turn right and then turn right again. Pass along LH-502 and LH-500, continue past Stairs-2 and the Library; CSL08 is located immediately ahead.",
    "description": "Computer Science Lab 08",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/csl08.png",
    "tags": [
      "lab",
      "cse",
      "csl08"
    ],
    "clickable": true
  },
  {
    "id": "lh-506",
    "name": "LH-506",
    "label": "LH-506",
    "type": "classroom",
    "x": 736,
    "y": 44,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. Stairs-1: Turn left and pass along LH-504; LH-506 is the next classroom straight ahead.\nII. Stairs-2: Turn right and pass along LH-500, LH-502, and LH-504; LH-506 is the next classroom straight ahead.\nIII. LIFT: Turn right and then turn left. Pass along LH-504; LH-506 is the next classroom straight ahead.",
    "description": "Lecture Hall 506",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh-506.jpeg",
    "tags": [
      "class",
      "ise",
      "lh506"
    ],
    "clickable": true
  },
  {
    "id": "lh-504",
    "name": "LH-504",
    "label": "LH-504",
    "type": "classroom",
    "x": 736,
    "y": 345,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. Stairs-1: Turn right and then turn left to reach the classroom immediately.\nII. Stairs-2: Turn right and then turn left. Pass LH-500 and LH-502; LH-504 is the next classroom straight ahead.\nIII. LIFT: Turn right and then turn left to reach the classroom.",
    "description": "Lecture Hall 504",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh504.png",
    "tags": [
      "class",
      "ise",
      "lh504"
    ],
    "clickable": true
  },
  {
    "id": "lh-502",
    "name": "LH-502",
    "label": "LH-502",
    "type": "classroom",
    "x": 743,
    "y": 1076,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. Stairs-1: Turn right and walk forward to find LH-502; LH-501 is on the opposite side.\nII. Stairs-2: Turn right and then turn left to reach LH-502; LH-501 is on the opposite side.\nIII. LIFT: Turn right and then turn right again to find LH-502; LH-501 is on the opposite side.",
    "description": "Lecture Hall 502",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh502.jpg",
    "tags": [
      "class",
      "ise",
      "lh502"
    ],
    "clickable": true
  },
  {
    "id": "lh-500",
    "name": "LH-500",
    "label": "LH-500",
    "type": "classroom",
    "x": 738,
    "y": 1288,
    "w": 200,
    "h": 90,
    "width": 200,
    "height": 90,
    "directions": "I. From Stairs-1 or LIFT: Turn right, walk straight, and pass LH-502.\nII.From Stairs-2: Turn right to reach the classroom immediately.",
    "description": "Lecture Hall 500",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh500.png",
    "tags": [
      "class",
      "ise",
      "lh500"
    ],
    "clickable": true
  },
  {
    "id": "staff-room-big",
    "name": "STAFF ROOM",
    "label": "STAFF ROOM",
    "type": "staffroom",
    "x": 380,
    "y": 195,
    "w": 200,
    "h": 180,
    "width": 200,
    "height": 180,
    "directions": "Upper center area.",
    "description": "Main ISE Staff Room",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/sf(i).jpeg",
    "tags": [
      "staff",
      "office",
      "ise"
    ],
    "clickable": true
  },
  {
    "id": "stairs-top-5",
    "name": "STAIRS-1",
    "label": "STAIRS-1",
    "type": "utility",
    "x": 380,
    "y": 580,
    "w": 200,
    "h": 80,
    "width": 200,
    "height": 80,
    "directions": "1. Turn right.\n2. Walk straight.\n3. Pass from LIFT and LH-502.\n4. Reach LH-500.",
    "description": "Upper central stairs",
    "image": "https://placehold.co/600x400?text=Stairs+1",
    "tags": [
      "stairs"
    ],
    "clickable": true
  },
  {
    "id": "lift-5",
    "name": "LIFT",
    "label": "LIFT",
    "type": "utility",
    "x": 380,
    "y": 788,
    "w": 200,
    "h": 80,
    "width": 200,
    "height": 80,
    "directions": "1. Exit and turn right.\n2. Walk straight and pass LH-502.\n3. LH-500 will be ahead.",
    "description": "Elevator",
    "image": "https://placehold.co/600x400?text=Lift",
    "tags": [
      "lift"
    ],
    "clickable": true
  },
  {
    "id": "lh-501",
    "name": "LH-501 (PG)",
    "label": "LH-501 (PG)",
    "type": "classroom",
    "x": 413,
    "y": 1076,
    "w": 180,
    "h": 90,
    "width": 180,
    "height": 90,
    "directions": "I. Stairs-1: Turn right and walk forward to find LH-502; LH-501 is on the opposite side.\nII. Stairs-2: Turn right and then turn left to reach LH-502; LH-501 is on the opposite side.\nIII. LIFT: Turn right and then turn right again to find LH-502; LH-501 is on the opposite side.",
    "description": "Post Graduate Lecture Hall 501",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/lh501_pg.png",
    "tags": [
      "class",
      "pg"
    ],
    "clickable": true
  },
  {
    "id": "library",
    "name": "LIBRARY (CSE)",
    "label": "LIBRARY (CSE)",
    "type": "utility",
    "x": 197,
    "y": 1440,
    "w": 200,
    "h": 80,
    "width": 200,
    "height": 80,
    "directions": "I. Stairs-1: Turn right and pass along LH-502 and LH-500; the Library is located beside Stairs-2.\nII. Stairs-2: Turn sharp left to reach the Library.\nIII. LIFT: Turn right and then turn right again. Pass along LH-502 and LH-500; the Library is located beside Stairs-2.",
    "description": "CSE Department Library",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/library.jpg",
    "tags": [
      "books",
      "cse"
    ],
    "clickable": true
  },
  {
    "id": "stairs-bottom-5",
    "name": "STAIRS-2",
    "label": "STAIRS-2",
    "type": "utility",
    "x": 418,
    "y": 1440,
    "w": 200,
    "h": 80,
    "width": 200,
    "height": 80,
    "directions": "1. Turn right.\n2. Reach LH-500 immediately.",
    "description": "Lower central stairs",
    "image": "https://placehold.co/600x400?text=Stairs+2",
    "tags": [
      "stairs"
    ],
    "clickable": true
  },
  {
    "id": "cfr03-lab",
    "name": "CFR 03 LAB",
    "label": "CFR 03 LAB",
    "type": "lab",
    "x": 690,
    "y": 1443,
    "w": 180,
    "h": 80,
    "width": 180,
    "height": 80,
    "directions": "I. Stairs-1: Turn right and pass along LH-502 and LH-500. The CFR03 Lab is located right beside the LH-500 classroom.\nII. Stairs-2: Turn right to find the Lab immediately beside LH-500.\nIII. LIFT: Turn right and then turn right again. Pass along LH-502 and LH-500; the CFR03 Lab is located right beside LH-500.",
    "description": "Computer Research Lab",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/cfr03_lab.png",
    "tags": [
      "lab",
      "cse",
      "cfr03"
    ],
    "clickable": true
  }
],
  faculty: [
  {
    "name": "DR. RAVI B.",
    "roomId": "staff-room-big",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.15-pm-1.jpeg",
    "department": "ISE"
  },
  {
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.15-pm-2.jpeg",
    "department": "ISE",
    "name": "DR. JASON ELROY MARTIS",
    "roomId": "staff-room-big"
  },
  {
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.15-pm.jpeg",
    "department": "ISE",
    "roomId": "hod-cabin",
    "name": "DR. ASHWINI B."
  },
  {
    "department": "ISE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.16-pm.jpeg",
    "name": "DR. ANUSHA N.",
    "roomId": "staff-room-big"
  },
  {
    "department": "ISE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.18-pm.jpeg",
    "name": "DR. CHINMAI SHETTY",
    "roomId": "staff-room-big"
  },
  {
    "roomId": "staff-room-big",
    "name": "DR. DEEPA",
    "department": "ISE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.19-pm-1.jpeg"
  },
  {
    "name": "DR. RAGHUNANDAN K R",
    "roomId": "staff-room-left",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.19-pm-2.jpeg",
    "department": "CSE"
  },
  {
    "roomId": "staff-room-big",
    "name": "DR. RASHMI NAVEEN",
    "department": "ISE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.19-pm.jpeg"
  },
  {
    "name": "MR. PAWAN HEGDE",
    "roomId": "staff-room-left",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.20-pm-1.jpeg",
    "department": "CSE"
  },
  {
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.20-pm-2.jpeg",
    "department": "CSE",
    "name": "MS. SAVITHA SHETTY",
    "roomId": "staff-room-left"
  },
  {
    "roomId": "staff-room-left",
    "name": "DR. SARIKA HEGDE",
    "department": "CSE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.20-pm.jpeg"
  },
  {
    "department": "CSE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.21-pm-1.jpeg",
    "roomId": "staff-room-left",
    "name": "MS. ANUPAMA HC"
  },
  {
    "roomId": "staff-room-big",
    "name": "MS. PRATHEEKSHA HEGDE N",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.21-pm-2.jpeg",
    "department": "ISE"
  },
  {
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.21-pm.jpeg",
    "department": "CSE",
    "roomId": "staff-room-left",
    "name": "DR. ASMITA POOJARY"
  },
  {
    "roomId": "staff-room-left",
    "name": "MS. VAISHALI BANGERA",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.22-pm-1.jpeg",
    "department": "CSE"
  },
  {
    "roomId": "staff-room-left",
    "name": "DR. SANDEEP KUMAR HEGDE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.22-pm-2.jpeg",
    "department": "CSE"
  },
  {
    "roomId": "staff-room-big",
    "name": "MS. PRATHYAKSHINI",
    "department": "ISE",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.22-pm.jpeg"
  },
  {
    "roomId": "staff-room-left",
    "name": "MS. SIMRAN BANU",
    "image": "${IMG_BASE_URL}/apj-block-images/5th-floor/5th-floor-staff-room/whatsapp-image-2026-04-23-at-10.27.23-pm.jpeg",
    "department": "CSE"
  }
],
}
