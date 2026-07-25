import { ground as customGround } from './ground.js'
import { first as customFirst } from './first.js'
import { second as customSecond } from './second.js'
import { third as customThird } from './third.js'

const createFloorConfig = (label, floorId) => ({
  buildingName: 'ATAL-BLOCK',
  label,
  viewWidth: 4400,
  viewHeight: 1540,
  mainWidth: 1600,
  bulgeWidth: 695,
  bulgeHeight: 500,
  boundaryVertices: [
    { x: 100, y: 100 },
    { x: 1180, y: 100 },
    { x: 1180, y: 1440 },
    { x: 100, y: 1440 }
  ],
  rooms: [
    {
      id: `atal-${floorId}-setup`,
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
      tags: ['setup', 'coming-soon'],
      clickable: true
    }
  ],
  faculty: []
})

export const ground = customGround
export const first = customFirst
export const second = customSecond
export const third = customThird
