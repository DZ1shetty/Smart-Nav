import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { RoomType } from '../../types/builder';
import { 
  MousePointer2, 
  Undo, 
  Redo, 
  Trash2,
  GraduationCap,
  Beaker,
  DoorClosed,
  Footprints,
  ArrowUpToLine,
  Briefcase,
  GalleryHorizontal,
  Square,
  BoxSelect,
  PenTool,
  Search,
  Copy,
  ChevronRight,
  Folder,
  ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const ROOM_TYPES: Record<RoomType, { icon: React.FC<any>; label: string; color: string }> = {
  classroom: { icon: GraduationCap, label: 'Classroom', color: 'bg-blue-500' },
  lab: { icon: Beaker, label: 'Lab', color: 'bg-purple-500' },
  office: { icon: Briefcase, label: 'Office', color: 'bg-amber-500' },
  washroom: { icon: DoorClosed, label: 'Washroom', color: 'bg-cyan-500' },
  staircase: { icon: Footprints, label: 'Staircase', color: 'bg-stone-500' },
  lift: { icon: ArrowUpToLine, label: 'Lift', color: 'bg-stone-600' },
  corridor: { icon: GalleryHorizontal, label: 'Corridor', color: 'bg-slate-400' },
  layout: { icon: BoxSelect, label: 'Layout Base', color: 'bg-zinc-800' },
  other: { icon: Square, label: 'Custom', color: 'bg-gray-500' },
};

export const Toolbar = () => {
  const { 
    tool, 
    setTool, 
    addRoom,
    deleteRooms,
    rooms,
    selectedIds,
    setSelection,
    undo,
    redo,
    historyIndex,
    history,
    mode,
    setMode,
    currentFloorIndex,
    buildingMeta,
    switchFloor,
    floorsData
  } = useBuilderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFloors, setExpandedFloors] = useState<number[]>([currentFloorIndex]);
  const [isShapesExpanded, setIsShapesExpanded] = useState(false);

  useEffect(() => {
    if (!expandedFloors.includes(currentFloorIndex)) {
      setExpandedFloors(prev => [...prev, currentFloorIndex]);
    }
  }, [currentFloorIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const ToolbarButton = ({ 
    active, 
    onClick, 
    icon: Icon, 
    label, 
    disabled = false
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={twMerge(
        clsx(
          "relative flex items-center justify-center w-8 h-8 rounded-md transition-colors",
          "hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed",
          active ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300"
        )
      )}
    >
      <Icon size={16} />
    </button>
  );

  const duplicateRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      addRoom({
        ...room,
        x: room.x + 20,
        y: room.y + 20,
      });
    }
  };

  const deleteSingleRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRooms([roomId]);
  };

  const insertRoom = (type: RoomType) => {
    // Determine center of viewport
    const viewport = useBuilderStore.getState().viewport;
    const defaultWidth = type === 'layout' ? 400 : 100;
    const defaultHeight = type === 'layout' ? 300 : 80;
    
    // Calculate center in canvas coordinates
    const centerX = (-viewport.x + window.innerWidth / 2) / viewport.scale;
    const centerY = (-viewport.y + window.innerHeight / 2) / viewport.scale;

    addRoom({
      name: type === 'layout' ? 'Floor Layout' : ROOM_TYPES[type].label,
      type: type,
      status: 'active',
      x: centerX - defaultWidth / 2,
      y: centerY - defaultHeight / 2,
      width: defaultWidth,
      height: defaultHeight,
      rotation: 0,
      accessibilityFlags: [],
      images: [],
      notes: '',
      directions: '',
      customFields: [],
      doors: [],
      locked: false,
      points: [
        { x: 0, y: 0 },
        { x: defaultWidth, y: 0 },
        { x: defaultWidth, y: defaultHeight },
        { x: 0, y: defaultHeight }
      ]
    });
    setTool('select');
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const steps = [
    { id: 'layout', label: 'Design' },
    { id: 'room_details', label: 'Room Details' },
    { id: 'faculty_details', label: 'Faculty' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === mode);

  return (
    <div className="w-64 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1e1e1e] flex flex-col shrink-0 z-10 font-sans shadow-xl">
      
      {/* Step Selector Dropdown */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Current Phase</div>
        <select 
          value={mode}
          onChange={(e) => { setMode(e.target.value as any); setTool('select'); }}
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded px-2 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
        >
          {steps.map((step, idx) => (
            <option key={step.id} value={step.id}>
              Step {idx + 1}: {step.label}
            </option>
          ))}
        </select>
      </div>

      {/* Top Actions & Tool Picker */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#1e1e1e]">
        <div className="flex gap-0.5">
          <ToolbarButton icon={Undo} label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
          <ToolbarButton icon={Redo} label="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo} />
        </div>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
        <div className="flex gap-0.5 items-center">
          <ToolbarButton icon={MousePointer2} label="Select (V)" active={tool === 'select'} onClick={() => setTool('select')} />
          <ToolbarButton icon={PenTool} label="Draw (P)" active={tool === 'draw'} onClick={() => setTool('draw')} />
        </div>
      </div>

      {/* Shapes / Inventory */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/50">
        <div 
          className="flex items-center justify-between cursor-pointer group mb-2"
          onClick={() => setIsShapesExpanded(!isShapesExpanded)}
        >
          <h3 className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Shapes</h3>
          {isShapesExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
          )}
        </div>
        
        {isShapesExpanded && (
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(ROOM_TYPES).map(([type, data]) => {
              const TypeIcon = data.icon;
              return (
                <button
                  key={`shape-${type}`}
                  onClick={() => insertRoom(type as RoomType)}
                  title={`Add ${data.label}`}
                  className="flex items-center justify-center aspect-square rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <TypeIcon size={14} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Layers Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Layers</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Find layer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {Array.from({ length: buildingMeta?.floorCount || 1 }).map((_, floorIndex) => {
            const floorRooms = floorIndex === currentFloorIndex ? rooms : (floorsData[floorIndex] || []);
            const filteredFloorRooms = floorRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const isExpanded = expandedFloors.includes(floorIndex) || searchQuery !== '';

            return (
              <div key={`floor-group-${floorIndex}`} className="mb-3">
                <div 
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 mb-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer",
                    floorIndex === currentFloorIndex ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                  onClick={() => { 
                    setExpandedFloors(prev => prev.includes(floorIndex) ? prev.filter(f => f !== floorIndex) : [...prev, floorIndex]);
                  }}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <Folder className={clsx("w-3.5 h-3.5 shrink-0", floorIndex === currentFloorIndex ? "text-blue-500" : "text-zinc-400")} />
                  <span 
                    className="flex-1 truncate" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (floorIndex !== currentFloorIndex) {
                        switchFloor(floorIndex);
                        setMode(steps[0].id as any);
                        setTool('select');
                      }
                    }}
                  >
                    {floorIndex === 0 ? 'Ground Floor' : `Floor ${floorIndex}`}
                  </span>
                </div>
                
                {isExpanded && (
                  <div className="pl-3 border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-0.5 mt-1">
                  {filteredFloorRooms.length === 0 ? (
                    <div className="px-2 py-1 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold italic">Empty Directory</div>
                  ) : (
                    filteredFloorRooms.slice().reverse().map(room => {
                      const TypeIcon = ROOM_TYPES[room.type]?.icon || Square;
                      const isSelected = selectedIds.includes(room.id) && floorIndex === currentFloorIndex;
                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            if (floorIndex !== currentFloorIndex) {
                              switchFloor(floorIndex);
                              setMode(steps[0].id as any);
                              setTool('select');
                            }
                            setSelection([room.id]);
                          }}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            if (floorIndex !== currentFloorIndex) switchFloor(floorIndex);
                            setSelection([room.id]);
                            setMode('room_details');
                          }}
                          className={clsx(
                            "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs relative",
                            isSelected 
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TypeIcon className={clsx("w-3.5 h-3.5 shrink-0", isSelected ? "text-blue-500" : "text-zinc-400")} />
                            <span className="truncate font-medium">{room.name}</span>
                          </div>
                          
                          {/* Actions (Hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {floorIndex === currentFloorIndex && (
                              <>
                                <button onClick={(e) => duplicateRoom(room.id, e)} className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Duplicate">
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => deleteSingleRoom(room.id, e)} className="p-1 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Navigation Footer */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#1e1e1e] flex justify-between gap-2 shrink-0">
          <button
            onClick={() => { if (currentStepIndex > 0) { setMode(steps[currentStepIndex - 1].id as any); setTool('select'); } }}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 text-xs font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => { 
              if (currentStepIndex < steps.length - 1) { 
                setMode(steps[currentStepIndex + 1].id as any); 
                setTool('select'); 
              } else if (buildingMeta && currentFloorIndex < buildingMeta.floorCount - 1) {
                switchFloor(currentFloorIndex + 1);
                setMode(steps[0].id as any);
                setTool('select');
              }
            }}
            disabled={currentStepIndex === steps.length - 1 && (!buildingMeta || currentFloorIndex >= buildingMeta.floorCount - 1)}
            className="flex-1 px-3 py-1.5 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center shadow-sm"
          >
            {currentStepIndex === steps.length - 1 ? (buildingMeta && currentFloorIndex < buildingMeta.floorCount - 1 ? 'Next Floor' : 'Finish') : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};
