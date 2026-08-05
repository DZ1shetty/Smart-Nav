import { create } from 'zustand';
import { BuilderRoom, BuilderTool, RoomType } from '../types/builder';
import { v4 as uuidv4 } from 'uuid';

const MAX_HISTORY = 50;

export interface BuildingMeta {
  name: string;
  slug: string;
  overview: string;
  floorCount: number;
  theme: string;
}

interface BuilderState {
  // Setup & Building State
  isSetupComplete: boolean;
  buildingMeta: BuildingMeta | null;
  floorsData: Record<number, BuilderRoom[]>;
  currentFloorIndex: number;
  draftId: string | null;
  unsavedChanges: boolean;
  
  // Current Floor Canvas State
  rooms: BuilderRoom[];
  selectedIds: string[];
  
  // Tool & Mode State
  tool: BuilderTool;
  activeRoomType: RoomType;
  mode: 'layout' | 'room_details' | 'faculty_details';
  
  // Viewport & Settings State
  viewport: { x: number, y: number, scale: number };
  showMinimap: boolean;
  snapToGrid: boolean;
  measurementUnit: 'px' | 'm' | 'ft';
  
  // History State (per floor session)
  history: BuilderRoom[][];
  historyIndex: number;
  
  // Actions
  completeSetup: (meta: BuildingMeta, initialFloorsData?: Record<number, BuilderRoom[]>, draftId?: string) => void;
  switchFloor: (index: number) => void;
  setDraftId: (id: string | null) => void;
  setUnsavedChanges: (val: boolean) => void;
  
  setTool: (tool: BuilderTool) => void;
  setActiveRoomType: (type: RoomType) => void;
  setMode: (mode: 'layout' | 'room_details' | 'faculty_details') => void;
  setSelection: (ids: string[]) => void;
  
  setViewport: (viewport: { x: number, y: number, scale: number }) => void;
  setShowMinimap: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setMeasurementUnit: (unit: 'px' | 'm' | 'ft') => void;
  
  // Room Actions
  addRoom: (room: Omit<BuilderRoom, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<BuilderRoom>) => void;
  updateRooms: (updates: { id: string, updates: Partial<BuilderRoom> }[]) => void;
  deleteRooms: (ids: string[]) => void;
  
  updateBuildingMeta: (updates: Partial<BuildingMeta>) => void;
  
  // Grouping Actions
  groupRooms: (ids: string[]) => void;
  ungroupRooms: (ids: string[]) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial State
  isSetupComplete: false,
  buildingMeta: null,
  floorsData: {},
  currentFloorIndex: 0,
  draftId: null,
  unsavedChanges: false,
  
  rooms: [],
  selectedIds: [],
  tool: 'select',
  activeRoomType: 'classroom',
  mode: 'layout',
  
  viewport: { x: 0, y: 0, scale: 1 },
  showMinimap: false, // Default off as per user request
  snapToGrid: true,
  measurementUnit: 'px',
  
  history: [[]],
  historyIndex: 0,

  // Setup & Floor Actions
  completeSetup: (meta, initialFloorsData = {}, draftId = null) => {
    set({ 
      isSetupComplete: true, 
      buildingMeta: meta,
      floorsData: initialFloorsData,
      currentFloorIndex: 0,
      rooms: initialFloorsData[0] || [],
      history: [initialFloorsData[0] || []],
      historyIndex: 0,
      selectedIds: [],
      draftId,
      unsavedChanges: false
    });
  },

  switchFloor: (index) => {
    const { currentFloorIndex, rooms, floorsData } = get();
    // Save current rooms to floorsData
    const updatedFloorsData = { ...floorsData, [currentFloorIndex]: rooms };
    // Get next floor rooms
    const nextRooms = updatedFloorsData[index] || [];
    
    set({
      floorsData: updatedFloorsData,
      currentFloorIndex: index,
      rooms: nextRooms,
      history: [nextRooms],
      historyIndex: 0,
      selectedIds: [],
      mode: 'layout',
      tool: 'select'
    });
  },

  updateBuildingMeta: (updates) => {
    const { buildingMeta } = get();
    if (buildingMeta) {
      set({ buildingMeta: { ...buildingMeta, ...updates }, unsavedChanges: true });
    }
  },

  setDraftId: (id) => set({ draftId: id }),
  setUnsavedChanges: (val) => set({ unsavedChanges: val }),

  // Tool & Mode Actions
  setTool: (tool) => set({ tool }),
  setActiveRoomType: (type) => set({ activeRoomType: type, tool: 'draw' }),
  setMode: (mode) => {
    set({ mode, selectedIds: [], tool: 'select' });
  },
  setSelection: (ids) => {
    set({ selectedIds: ids });
  },
  
  setViewport: (viewport) => set({ viewport }),
  setShowMinimap: (showMinimap) => set({ showMinimap }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setMeasurementUnit: (measurementUnit) => set({ measurementUnit }),

  // Room Actions
  addRoom: (roomData) => {
    const newRoom: BuilderRoom = { ...roomData, id: uuidv4() };
    const newRooms = [...get().rooms, newRoom];
    set({ rooms: newRooms, selectedIds: [newRoom.id] });
    get().commitHistory();
  },

  updateRoom: (id, updates) => {
    const newRooms = get().rooms.map(room => 
      room.id === id ? { ...room, ...updates } : room
    );
    set({ rooms: newRooms });
    get().commitHistory();
  },

  updateRooms: (updatesList) => {
    const updatesMap = new Map(updatesList.map(u => [u.id, u.updates]));
    const newRooms = get().rooms.map(room => {
      const updates = updatesMap.get(room.id);
      return updates ? { ...room, ...updates } : room;
    });
    set({ rooms: newRooms });
    get().commitHistory();
  },

  deleteRooms: (ids) => {
    const newRooms = get().rooms.filter(room => !ids.includes(room.id));
    const newSelection = get().selectedIds.filter(id => !ids.includes(id));
    set({ rooms: newRooms, selectedIds: newSelection });
    get().commitHistory();
  },

  groupRooms: (ids) => {
    const { rooms, commitHistory } = get();
    if (ids.length < 2) return;
    
    const newGroupId = uuidv4();
    const newRooms = rooms.map(room => 
      ids.includes(room.id) ? { ...room, groupId: newGroupId } : room
    );
    
    set({ rooms: newRooms });
    commitHistory();
  },

  ungroupRooms: (ids) => {
    const { rooms, commitHistory } = get();
    if (ids.length === 0) return;
    
    const newRooms = rooms.map(room => {
      if (ids.includes(room.id) && room.groupId) {
        const { groupId, ...rest } = room;
        return rest as BuilderRoom;
      }
      return room;
    });

    set({ rooms: newRooms });
    commitHistory();
  },

  // History Actions
  commitHistory: () => {
    const { rooms, history, historyIndex, currentFloorIndex, floorsData } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...rooms]);
    
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    // Also auto-save to floorsData to keep it fresh
    set({ 
      history: newHistory, 
      historyIndex: newHistory.length - 1,
      floorsData: { ...floorsData, [currentFloorIndex]: rooms },
      unsavedChanges: true
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ 
        historyIndex: newIndex, 
        rooms: [...history[newIndex]],
        selectedIds: [] 
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ 
        historyIndex: newIndex, 
        rooms: [...history[newIndex]],
        selectedIds: []
      });
    }
  }
}));
