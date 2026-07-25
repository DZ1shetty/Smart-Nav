import { IMG_BASE_URL } from '../../config.js'

export const fifth = {
  buildingName: 'RAMANUJAN-BLOCK',
  label: '5th Floor',
  viewWidth: 1280,
  viewHeight: 1540,
  mainWidth: 960,
  bulgeWidth: 320,
  bulgeHeight: 500,
  boundaryVertices: [
    { x: 100, y: 100 },
    { x: 1180, y: 100 },
    { x: 1180, y: 1440 },
    { x: 100, y: 1440 }
  ],
  rooms: [
    {
      id: 'ramanujan-fifth-setup',
      name: 'SETUP IN PROGRESS',
      label: 'SETUP IN PROGRESS',
      type: 'office',
      x: 340,
      y: 470,
      w: 600,
      h: 400,
      width: 600,
      height: 400,
      directions: 'Centrally located on the floor.',
      description: 'Building room outlines and layout setup is currently in progress. Switch to Edit Mode to customize.',
      image: 'https://placehold.co/600x400?text=Setup+in+Progress',
      tags: ["setup","coming-soon"],
      clickable: true
    }
  ],
  faculty: [

  ]
}
