import { IMG_BASE_URL } from '../../config.js'

export const third = {
  buildingName: 'CV-RAMAN BLOCK',
  label: '3rd Floor',
  viewWidth: 1280,
  viewHeight: 1540,
  mainWidth: 960,
  bulgeWidth: 320,
  bulgeHeight: 500,
  boundaryVertices: [
    { x: 700, y: 36 },
    { x: 700, y: 218 },
    { x: 700, y: 309 },
    { x: 641, y: 395 },
    { x: 776, y: 524 },
    { x: 1765, y: 532 },
    { x: 1763, y: 829 },
    { x: 826, y: 825 },
    { x: 825, y: 940 },
    { x: 823, y: 1038 },
    { x: 642, y: 1039 },
    { x: 463, y: 1041 },
    { x: 461, y: 1455 },
    { x: -113, y: 1455 },
    { x: -111, y: 1054 },
    { x: -630, y: 1049 },
    { x: -627, y: 669 },
    { x: 106, y: 673 },
    { x: 281, y: 470 },
    { x: 287, y: 36 }
  ],
  rooms: [
    {
      id: 'cv-raman-third-ladies-toilet',
      name: 'LADIES WASHROOM',
      label: 'LADIES WASHROOM',
      type: 'utility',
      x: 1535,
      y: 552,
      w: 213,
      h: 66,
      width: 213,
      height: 66,
      directions: 'Right wing end, top corridor.',
      description: 'Ladies Washroom facilities',
      image: 'https://placehold.co/600x400?text=Ladies+Washroom',
      tags: ["toilet","washroom","utility"],
      clickable: true
    },
    {
      id: 'cv-raman-third-ladies-room',
      name: 'LADIES ROOM',
      label: 'LADIES ROOM',
      type: 'classroom',
      x: 1347,
      y: 550,
      w: 150,
      h: 68,
      width: 150,
      height: 68,
      directions: 'i. Stairs-1: Walk straight past the lift and NC-35,SR-34; the Ladies Room is on your left.\n\nii. Stairs-2: Walk straight past the Lift and SR-34; the Ladies Room is on your right.\n\niii. Lift: Exit the Lift, walk straight past SR-34; the Ladies Room is on your left.',
      description: 'Ladies Common Room',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/ladies_room.png`,
      tags: ["ladies","lounge"],
      clickable: true
    },
    {
      id: 'cv-raman-third-sr34',
      name: 'SR-34',
      label: 'SR-34',
      type: 'staffroom',
      x: 1126,
      y: 547,
      w: 150,
      h: 68,
      width: 150,
      height: 68,
      directions: 'Right wing, top corridor next to Ladies Room.',
      description: 'Staff Room 34',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/sr34.png`,
      tags: ["staffroom","office"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lc35',
      name: 'LC-35',
      label: 'LC-35',
      type: 'classroom',
      x: 857,
      y: 545,
      w: 178,
      h: 70,
      width: 178,
      height: 70,
      directions: 'i. Stairs-1: Walk straight past the Lift; LC-35 is the first room on your left.\n\nii. Stairs-2: Walk straight past the Lift; LC-35 is the first room on your right.\n\niii. Lift: Exit the lift and turn left , LC-35 is the first roomon your left',
      description: 'Classroom LC-35',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/lc35.png`,
      tags: ["classroom","lc35"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lift',
      name: 'LIFT',
      label: 'LIFT',
      type: 'utility',
      x: 520,
      y: 452,
      w: 158,
      h: 177,
      width: 158,
      height: 177,
      directions: 'Center area.',
      description: 'Elevator',
      image: 'https://placehold.co/600x400?text=Lift',
      tags: ["lift","elevator","utility"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lc32',
      name: 'LC-32',
      label: 'LC-32',
      type: 'classroom',
      x: -77,
      y: 691,
      w: 120,
      h: 79,
      width: 120,
      height: 79,
      directions: 'i. Stairs-1: Walk to the Lift, turn right and walk straight, LC-32 is on your right.\n\nii. Stairs-2: Walk to the Lift, turn left and walk straight, LC-32 is on your right.\n\niii. Lift: Exit the Lift, turn right and walk straight,  LC-32 is on your right.',
      description: 'Classroom LC-32',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/lc32.png`,
      tags: ["classroom","lc32"],
      clickable: true
    },
    {
      id: 'cv-raman-third-sr33',
      name: 'SR-33',
      label: 'SR-33',
      type: 'staffroom',
      x: -227,
      y: 688,
      w: 120,
      h: 79,
      width: 120,
      height: 79,
      directions: 'Left wing, upper corridor.',
      description: 'Staff Room 33',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/sr33.png`,
      tags: ["staffroom","office"],
      clickable: true
    },
    {
      id: 'cv-raman-third-sr32',
      name: 'SR-32',
      label: 'SR-32',
      type: 'staffroom',
      x: -375,
      y: 688,
      w: 120,
      h: 79,
      width: 120,
      height: 79,
      directions: 'Left wing, upper corridor next to Gents Washroom.',
      description: 'Staff Room 32',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/sr32.png`,
      tags: ["staffroom","office"],
      clickable: true
    },
    {
      id: 'cv-raman-third-gents-toilet',
      name: 'GENTS WASHROOM',
      label: 'GENTS WASHROOM',
      type: 'utility',
      x: -611,
      y: 693,
      w: 204,
      h: 70,
      width: 204,
      height: 70,
      directions: 'Left wing end, upper corridor.',
      description: 'Gents washroom facilities',
      image: 'https://placehold.co/600x400?text=Gents+Washroom',
      tags: ["toilet","washroom","utility"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lc36',
      name: 'LC-36',
      label: 'LC-36',
      type: 'classroom',
      x: 1316,
      y: 723,
      w: 175,
      h: 74,
      width: 175,
      height: 74,
      directions: 'i. Stairs-1: Walk straight past the Lift and LC-37, LC-36 is on your left.\n\nii. Stairs-2: Walk towards the Lift; LC-36 is on your right.\n\niii. Lift: Exit the Lift and turn left and walk straight LC-36 is on your right.',
      description: 'Classroom LC-36',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/lc36.png`,
      tags: ["classroom","lc36"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lc37',
      name: 'LC-37',
      label: 'LC-37',
      type: 'classroom',
      x: 859,
      y: 725,
      w: 158,
      h: 72,
      width: 158,
      height: 72,
      directions: 'i. Stairs-1: Walk straight past the Lift and turn left, LC-37 is on your right.\n\nii. Stairs-2: Walk towards the Lift and turn right,LC-37 is on your right.\n\niii. Lift: Exit the Lift,turn left and walk straight; LC-37 is on your right.',
      description: 'Classroom LC-37',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/lc37.png`,
      tags: ["classroom","lc37"],
      clickable: true
    },
    {
      id: 'cv-raman-third-fy-coordinator',
      name: 'FIRST YEAR COORDINATOR',
      label: 'FIRST YEAR COORDINATOR',
      type: 'office',
      x: 200,
      y: 1041,
      w: 248,
      h: 397,
      width: 248,
      height: 397,
      directions: 'i. Stairs-1: Walk straight past the lift, the First Year Coordinator room is on your right.\n\nii. Stairs-2: The First Year Coordinator room is beside the stairs2.\n\niii. Lift: Walk straight from the lift.',
      description: 'First Year Coordinator Office',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/fy_coordinator.png`,
      tags: ["office","coordinator"],
      clickable: true
    },
    {
      id: 'cv-raman-third-sr31',
      name: 'SR-31',
      label: 'SR-31',
      type: 'staffroom',
      x: -93,
      y: 1113,
      w: 140,
      h: 100,
      width: 140,
      height: 100,
      directions: 'Bottom left wing.',
      description: 'Staff Room 31',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/sr31.png`,
      tags: ["staffroom","office"],
      clickable: true
    },
    {
      id: 'cv-raman-third-lc31',
      name: 'LC-31',
      label: 'LC-31',
      type: 'classroom',
      x: -97,
      y: 1313,
      w: 150,
      h: 100,
      width: 150,
      height: 100,
      directions: 'i. Stairs-1: Walk straight past the lift, turn right and walk straight then turn left,LC-31 is on your right.\n\nii. Stairs-2: Walk straight a few steps, turn left and walk staright and then turn turn left again, LC-31 is on your right.\n\niii. Lift: Walk straight and turn left, LC-31 is on your right.',
      description: 'Classroom LC-31',
      image: `${IMG_BASE_URL}/cv-raman-block-images/third-floor/lc31.png`,
      tags: ["classroom","lc31"],
      clickable: true
    },
    {
      id: 'cv-raman-third-stairs-1',
      name: 'STAIRS-1',
      label: 'STAIRS-1',
      type: 'utility',
      x: 311,
      y: 56,
      w: 369,
      h: 100,
      width: 369,
      height: 100,
      directions: 'Center-left stairs.',
      description: 'Staircase access',
      image: 'https://placehold.co/600x400?text=Stairs+1',
      tags: ["stairs","utility"],
      clickable: true
    },
    {
      id: 'cv-raman-third-stairs-2',
      name: 'STAIRS-2',
      label: 'STAIRS-2',
      type: 'utility',
      x: 463,
      y: 905,
      w: 350,
      h: 109,
      width: 350,
      height: 109,
      directions: 'Bottom-right stairs.',
      description: 'Staircase access',
      image: 'https://placehold.co/600x400?text=Stairs+2',
      tags: ["stairs","utility"],
      clickable: true
    }
  ],
  faculty: [
    {
      name: 'Dr. Nagaraja B.S.',
      department: 'Physics',
      roomId: 'cv-raman-third-sr31',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr31.png'
    },
    {
      name: 'Mr. Krishnaraj Rao N S',
      department: 'Physics',
      roomId: 'cv-raman-third-sr31',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr31.png'
    },
    {
      name: 'Dr. Bola Sunil Kamath',
      department: 'Physics',
      roomId: 'cv-raman-third-sr31',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr31.png'
    },
    {
      name: 'Dr. Shyam Prasad K.',
      department: 'Physics',
      roomId: 'cv-raman-third-sr31',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr31.png'
    },
    {
      name: 'Dr. Sunu Rose Joseph',
      department: 'Physics',
      roomId: 'cv-raman-third-sr31',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr31.png'
    },
    {
      name: 'Ms. Ashwini D Y',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Dr. Pramod Kumar PS',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Ms. Sanchita CM',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Mrs. Anitha D. Bayar',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Ms. Smitha G. V.',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Sharmila',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Ms. Anjana Pai K.',
      department: 'First Year / General',
      roomId: 'cv-raman-third-sr32',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr32.png'
    },
    {
      name: 'Mr. Sunil Kumar Aithal S.',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Mr. Srikanth Bhat K.',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Mr. Krishnaprasad Rao',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Dr. Santhosh S',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Rajashree',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Ms. Soumya',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr33',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr33.png'
    },
    {
      name: 'Ms. Alaka Anant\'i',
      department: 'Information Science & Engineering',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Dr. Preethi Salian',
      department: 'Information Science & Engineering',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Dr. Shivaprasad Shetty M.',
      department: 'Chemistry',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Ms. Tanzila Nargis',
      department: 'Information Science & Engineering',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Dr. Ranjitha',
      department: 'Chemistry',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Dr. Subrahmanya L Bhat',
      department: 'Chemistry',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    },
    {
      name: 'Ankitha A. Nayak',
      department: 'Computer Science & Engineering',
      roomId: 'cv-raman-third-sr34',
      image: 'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/third-floor/sr34.png'
    }
  ]
}
