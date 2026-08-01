export type RoomType = 'classroom' | 'lab' | 'washroom' | 'staircase' | 'lift' | 'office' | 'corridor' | 'layout' | 'staffroom' | 'other';
export type RoomStatus = 'active' | 'under-construction' | 'closed' | 'renovating';

export interface RoomCustomField {
  key: string;
  value: string;
}

export interface RoomDoor {
  id: string;
  x: number;
  y: number;
  connectsToRoomId?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  image: string;
  description: string;
  department?: string;
}

export interface BuilderRoom {
  id: string;
  name: string;
  type: RoomType;
  status: RoomStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity?: number;
  accessibilityFlags: string[];
  images: string[];
  notes: string;
  directions: string;
  customFields: RoomCustomField[];
  doors: RoomDoor[];
  locked: boolean;
  groupId?: string;
  points?: Point[];
  
  facultyList?: FacultyMember[];

  // Visual specific properties
  color?: string; // Optional custom color override
  fontSize?: number;
  fontFamily?: string;
}

export type BuilderTool = 'select' | 'draw' | 'pan';

export interface Point {
  x: number;
  y: number;
}
