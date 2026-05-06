import { IMG_BASE_URL } from '../../config.js';

export const ground = {
  buildingName: "APJ-BLOCK",
  label: "Ground Floor",
  viewWidth: 1280,
  viewHeight: 1540,
  mainWidth: 960,
  bulgeWidth: 320,
  bulgeHeight: 500,
  rooms: [
    {
      id: "alumni-lounge",
      name: "NITTE ALUMNI LOUNGE",
      x: 30, y: 50, w: 220, h: 200,
      type: "hall",
      description: "Alumni Lounge Area",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/alumni-lounge.jpg`,
      directions: "Top left area.",
      tags: ["lounge", "alumni"]
    },
    {
      id: "board-room-final",
      name: "BOARD ROOM",
      x: 310, y: 50, w: 360, h: 80,
      type: "hall",
      description: "Main Board Room",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-board-room.jpg`,
      directions: "Top center area.",
      tags: ["board", "room"]
    },
    {
      id: "vinay-hegde",
      name: "VINAY HEGDE CABIN",
      x: 740, y: 50, w: 220, h: 100,
      type: "hod",
      description: "President's Cabin - N. Vinay Hegde",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/vinay-hegde.jpg`,
      directions: "Top right area.",
      tags: ["office"]
    },
    {
      id: "vice-principal",
      name: "VICE PRINCIPAL CABIN",
      x: 30, y: 280, w: 220, h: 250,
      type: "hod",
      description: "Vice Principal's Office",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/vice-principal.jpg`,
      directions: "Left side, upper middle.",
      tags: ["office", "principal"]
    },
    {
      id: "vice-president",
      name: "VICE PRESIDENT CABIN (TE)",
      x: 30, y: 560, w: 220, h: 120,
      type: "hod",
      description: "Vice President Cabin (Technical Education)",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/vice-president.jpg`,
      directions: "Left side middle.",
      tags: ["office"]
    },
    {
      id: "washroom-g",
      name: "WASHROOM",
      x: 30, y: 710, w: 220, h: 120,
      type: "utility",
      description: "Washroom Facilities",
      image: "https://placehold.co/600x400?text=Washroom",
      directions: "Left side middle.",
      tags: ["toilet"]
    },
    {
      id: "examination-center",
      name: "EXAMINATION CENTER",
      x: 30, y: 920, w: 220, h: 520,
      type: "office",
      description: "Main Examination Section",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/exam-section.jpg`,
      directions: "Large vertical block on the left.",
      tags: ["exam", "center"]
    },
    { id: "stairs-1", name: "STAIRS-1", x: 400, y: 600, w: 160, h: 60, type: "utility", description: "Upper central stairs", image: "https://placehold.co/600x400?text=Stairs+1", directions: "Center area.", tags: ["stairs"] },
    { id: "lift-g", name: "LIFT", x: 400, y: 750, w: 160, h: 70, type: "utility", description: "Elevator", image: "https://placehold.co/600x400?text=Lift", directions: "Center area.", tags: ["lift"] },
    { id: "stairs-2", name: "STAIRS-2", x: 350, y: 1420, w: 160, h: 60, type: "utility", description: "Lower central stairs", image: "https://placehold.co/600x400?text=Stairs+2", directions: "Bottom center area.", tags: ["stairs"] },
    {
      id: "principal-office",
      name: "PRINCIPAL CABIN",
      x: 740, y: 450, w: 220, h: 100,
      type: "hod",
      description: "Principal's Office",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/principal.jpg`,
      directions: "Middle right area.",
      tags: ["office", "principal"]
    },
    {
      id: "deputy-registrar-final",
      name: "DEPUTY REGISTRAR OFFICE",
      x: 790, y: 900, w: 190, h: 200,
      type: "hod",
      description: "Office of Deputy Registrar",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-deputy-registrar.jpg`,
      directions: "Lower right area.",
      tags: ["office", "registry"]
    },
    {
      id: "nandhini-hall",
      name: "NANDHINI SEMINAR HALL",
      x: 790, y: 1200, w: 220, h: 240,
      type: "hall",
      description: "Nandhini Seminar Hall",
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/nandhini-hall.jpg`,
      directions: "Bottom right area.",
      tags: ["seminar", "hall"]
    }
  ],
  faculty: [
    { 
      name: "SHRI. N. VINAYA HEGDE", 
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-floor-faculty/shri.-n.-vinaya-hegde.png`, 
      roomId: "vinay-hegde", 
      department: "Administration" 
    },
    { 
      name: "DR. NIRANJAN N. CHIPLUNKAR", 
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-floor-faculty/prof.-niranjan-n-chiplunkar.png`, 
      roomId: "principal-office", 
      department: "Principal Office" 
    },
    { 
      name: "DR. NAGESH PRABHU", 
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-floor-faculty/dr.nageshprabhu.png`, 
      roomId: "vice-principal", 
      department: "Vice Principal Office" 
    },
    { 
      name: "DR. GOPAL MUGERAYA", 
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-floor-faculty/dr.gopalmugeraya.png`, 
      roomId: "vice-president", 
      department: "Technical Education" 
    },
    { 
      name: "DR. REKHA BHANDARKAR", 
      image: `${IMG_BASE_URL}/apj-block-images/ground-floor/ground-floor-faculty/dr.rekhabhandarkar-.png`, 
      roomId: "deputy-registrar-final", 
      department: "Deputy Registrar Office" 
    }
  ]
};
