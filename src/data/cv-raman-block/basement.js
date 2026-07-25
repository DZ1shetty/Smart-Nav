import { IMG_BASE_URL } from '../../config.js'

export const basement = {
  buildingName: 'CV-RAMAN BLOCK',
  label: 'Basement Floor',
  viewWidth: 1280,
  viewHeight: 1540,
  mainWidth: 960,
  bulgeWidth: 320,
  bulgeHeight: 500,
  boundaryVertices: [
  {
    "y": 109,
    "x": -263
  },
  {
    "y": 6,
    "x": -158
  },
  {
    "x": 484,
    "y": 242
  },
  {
    "x": 902,
    "y": 23
  },
  {
    "x": 1473,
    "y": 27
  },
  {
    "y": 341,
    "x": 1086
  },
  {
    "x": 1143,
    "y": 395
  },
  {
    "x": 1593,
    "y": 393
  },
  {
    "x": 1597,
    "y": 753
  },
  {
    "x": 1078,
    "y": 755
  },
  {
    "x": 991,
    "y": 857
  },
  {
    "x": 984,
    "y": 1480
  },
  {
    "y": 1480,
    "x": 360
  },
  {
    "x": 367,
    "y": 857
  },
  {
    "y": 772,
    "x": 236
  },
  {
    "y": 450,
    "x": 240
  },
  {
    "x": -365,
    "y": 200
  }
],
  rooms: [
  {
    "id": "cv-raman-basement-housekeeping",
    "name": "HOUSE KEEPING SECTION",
    "label": "HOUSE KEEPING SECTION",
    "type": "office",
    "x": -342,
    "y": 89,
    "w": 250,
    "h": 78,
    "width": 250,
    "height": 78,
    "directions": "Top left corner along the main corridor.",
    "description": "House Keeping Section Office",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/housekeeping.png",
    "tags": [
      "office",
      "housekeeping",
      "staff"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-mel05",
    "name": "MEL05 (LAB)",
    "label": "MEL05 (LAB)",
    "type": "lab",
    "x": -55,
    "y": 90,
    "w": 230,
    "h": 81,
    "width": 230,
    "height": 81,
    "directions": "Top corridor, next to House Keeping.",
    "description": "Mechanical Engineering Lab 05",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/mel05.png",
    "tags": [
      "lab",
      "mel05",
      "mechanical",
      "engineering"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-nmedl",
    "name": "NMEDL",
    "label": "NMEDL",
    "type": "lab",
    "x": 212,
    "y": 177,
    "w": 130,
    "h": 72,
    "width": 130,
    "height": 72,
    "directions": "Top corridor, between MEL05 and Dynamics Lab.",
    "description": "Non-Destructive Material Evaluation & Testing Lab",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/nmedl.png",
    "tags": [
      "lab",
      "nmedl",
      "testing",
      "materials"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-mel04",
    "name": "MEL04",
    "label": "MEL04",
    "type": "lab",
    "x": 821,
    "y": 52,
    "w": 131,
    "h": 81,
    "width": 131,
    "height": 81,
    "directions": "Top corridor, left side of Dynamics area.",
    "description": "Mechanical Engineering Lab 04 (Computerised 4-S Diesel Engine)",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/mel04.png",
    "tags": [
      "lab",
      "mel04",
      "engine",
      "mechanical"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-dynamics-lab",
    "name": "DYNAMIC LABORATORY",
    "label": "DYNAMIC LABORATORY",
    "type": "lab",
    "x": 618,
    "y": 149,
    "w": 206,
    "h": 93,
    "width": 206,
    "height": 93,
    "directions": "Top corridor, right side of Dynamics area.",
    "description": "Dynamics Laboratory",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/mel04.png",
    "tags": [
      "lab",
      "dynamics",
      "mechanical"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-mel03",
    "name": "MEL03 (ENERGY CONVERSION)",
    "label": "MEL03 (ENERGY CONVERSION)",
    "type": "lab",
    "x": 1025,
    "y": 140,
    "w": 230,
    "h": 84,
    "width": 230,
    "height": 84,
    "directions": "Right corridor wing, slanting down.",
    "description": "Energy Conversion Lab (MEL03)",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/mel03.png",
    "tags": [
      "lab",
      "mel03",
      "energy",
      "conversion"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-toilet",
    "name": "STAFF TOILET",
    "label": "STAFF TOILET",
    "type": "utility",
    "x": -278,
    "y": 221,
    "w": 209,
    "h": 75,
    "width": 209,
    "height": 75,
    "directions": "Middle-left area, above the Lift.",
    "description": "Staff Toilet Facilities",
    "image": "https://placehold.co/600x400?text=Staff+Toilet",
    "tags": [
      "toilet",
      "washroom",
      "utility"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-lift",
    "name": "LIFT",
    "label": "LIFT",
    "type": "utility",
    "x": 262,
    "y": 517,
    "w": 129,
    "h": 240,
    "width": 129,
    "height": 240,
    "directions": "Middle-left area, below the Staff Toilet.",
    "description": "Elevator Access Shaft",
    "image": "https://placehold.co/600x400?text=Lift",
    "tags": [
      "lift",
      "elevator",
      "utility"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-bmtl",
    "name": "BMTL",
    "label": "BMTL",
    "type": "lab",
    "x": 849,
    "y": 1008,
    "w": 127,
    "h": 82,
    "width": 127,
    "height": 82,
    "directions": "Middle-right area, above Basic Material Testing Lab.",
    "description": "Basic Material Testing Lab (BMTL)",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/bmtl.png",
    "tags": [
      "lab",
      "bmtl",
      "materials",
      "testing"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-material-testing",
    "name": "BASIC MATERIAL TESTING LAB",
    "label": "BASIC MATERIAL TESTING LAB",
    "type": "lab",
    "x": 1174,
    "y": 654,
    "w": 235,
    "h": 85,
    "width": 235,
    "height": 85,
    "directions": "Middle-right area, directly below BMTL.",
    "description": "Basic Material Testing Laboratory",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/material_testing.png",
    "tags": [
      "lab",
      "testing",
      "materials"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-fluid-mech",
    "name": "FLUID MECH & HYDRAULICS LAB",
    "label": "FLUID MECH & HYDRAULICS LAB",
    "type": "lab",
    "x": 382,
    "y": 984,
    "w": 257,
    "h": 100,
    "width": 257,
    "height": 100,
    "directions": "Bottom-left area.",
    "description": "Hydraulics, Hydraulic Machines & Fluid Mechanics Lab",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/fluid_mech.png",
    "tags": [
      "lab",
      "fluid",
      "mechanics",
      "hydraulics"
    ],
    "clickable": true
  },
  {
    "id": "cv-raman-basement-stairs-2",
    "name": "STAIRS-2",
    "label": "STAIRS-2",
    "type": "utility",
    "x": 614,
    "y": 1380,
    "w": 119,
    "h": 75,
    "width": 119,
    "height": 75,
    "directions": "Bottom-center area.",
    "description": "Staircase - Go down from ground floor",
    "image": "https://placehold.co/600x400?text=Stairs",
    "tags": [
      "stairs",
      "staircase",
      "utility"
    ],
    "clickable": true
  }
],
  faculty: [
  {
    "name": "Dr. Santhosh G",
    "department": "Mechanical Engineering",
    "roomId": "cv-raman-basement-mel05",
    "image": "${IMG_BASE_URL}/cv-raman-block-images/basement-floor/faculty/dr-santhosh-g.png"
  }
],
}
