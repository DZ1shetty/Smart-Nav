import React, { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { X, HelpCircle, Move, Maximize2, RotateCw, Type, Hash } from 'lucide-react';
import clsx from 'clsx';

export const PropertiesPanel = () => {
  const { rooms, selectedIds, updateRoom, setSelection, measurementUnit, setMeasurementUnit, groupRooms, ungroupRooms } = useBuilderStore();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const selectedRoom = selectedIds.length === 1 
    ? rooms.find(r => r.id === selectedIds[0]) 
    : null;

  // Auto focus name input when a new room is selected
  useEffect(() => {
    if (selectedRoom && nameInputRef.current) {
      if (!selectedRoom.name || selectedRoom.name === 'New Room') {
        nameInputRef.current.focus();
        nameInputRef.current.select();
      }
    }
  }, [selectedRoom?.id]);

  if (selectedIds.length === 0) {
    return (
      <div className="w-[280px] h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1e1e1e] flex flex-col shrink-0 z-10 font-sans shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <h3 className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Design</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 dark:text-zinc-500">
          <div className="w-16 h-16 mb-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <span className="block w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>
          <p className="text-xs font-medium">Select a shape to view properties.</p>
        </div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    const selectedRooms = rooms.filter(r => selectedIds.includes(r.id));
    const allSameGroup = selectedRooms.every(r => r.groupId && r.groupId === selectedRooms[0].groupId);
    
    return (
      <div className="w-[280px] h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1e1e1e] flex flex-col shrink-0 z-10 font-sans shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <h3 className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Selection</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 dark:text-zinc-500">
          <div className="w-16 h-16 mb-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <span className="block w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>
          <p className="text-xs font-medium mb-4 text-zinc-800 dark:text-zinc-200">{selectedIds.length} shapes selected</p>
          
          {allSameGroup && selectedRooms.length > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-blue-500">Grouped ({selectedRooms.length} shapes)</span>
              <button 
                onClick={() => ungroupRooms(selectedIds)} 
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded text-xs font-medium transition-colors"
              >
                Ungroup
              </button>
            </div>
          ) : (
            <button 
              onClick={() => groupRooms(selectedIds)} 
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              Group Selection
            </button>
          )}
        </div>
      </div>
    );
  }

  // If we get here, selectedRoom is guaranteed to be non-null because selectedIds.length === 1
  if (!selectedRoom) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }
    
    updateRoom(selectedRoom.id, { [name]: parsedValue });
  };

  const roomColors: Record<string, string> = {
    layout: '#f3f4f6',
    classroom: '#dbeafe',
    lab: '#fce7f3',
    office: '#fef3c7',
    washroom: '#e0e7ff',
    staircase: '#f3f4f6',
    lift: '#f3f4f6',
    corridor: '#fef08a',
    staffroom: '#eab308',
    other: '#f3f4f6',
  };

  return (
    <div className="w-[280px] h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1e1e1e] flex flex-col shrink-0 z-10 overflow-hidden font-sans shadow-xl text-sm">
      <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800/50">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Design</h3>
        <button 
          onClick={() => setSelection([])}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Header Preview */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-sm"
            style={{ backgroundColor: roomColors[selectedRoom.type] || roomColors.other }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{selectedRoom.name}</h4>
            <p className="text-xs text-zinc-500 capitalize">{selectedRoom.type}</p>
          </div>
        </div>

        {/* Identity */}
        <div className="p-4 space-y-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-zinc-400" />
            <input 
              ref={nameInputRef}
              type="text" 
              name="name"
              value={selectedRoom.name} 
              onChange={handleChange}
              className="flex-1 min-w-0 bg-transparent text-zinc-900 dark:text-zinc-100 border-none outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1"
              placeholder="Layer Name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-zinc-400" />
            <select 
              name="type"
              value={selectedRoom.type} 
              onChange={handleChange}
              className="flex-1 min-w-0 bg-transparent text-zinc-900 dark:text-zinc-100 border-none outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1 cursor-pointer"
            >
              <option className="bg-white dark:bg-[#1e1e1e]" value="layout">Floor Layout</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="classroom">Classroom</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="lab">Lab</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="office">Office</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="washroom">Washroom</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="staircase">Staircase</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="lift">Lift</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="corridor">Corridor</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="staffroom">Staff Room</option>
              <option className="bg-white dark:bg-[#1e1e1e]" value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Layout */}
        <div className="p-4 space-y-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Layout</h4>
            <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-md p-0.5">
              {['px', 'm', 'ft'].map(unit => (
                <button
                  key={unit}
                  onClick={() => setMeasurementUnit(unit as any)}
                  className={clsx(
                    "px-2 py-0.5 text-[10px] uppercase font-medium rounded-sm transition-colors",
                    measurementUnit === unit 
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Position */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-400 w-3">X</span>
              <input 
                type="number" 
                name="x"
                value={Math.round(selectedRoom.x)} 
                onChange={handleChange}
                className="flex-1 w-full min-w-0 text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-400 w-3">Y</span>
              <input 
                type="number" 
                name="y"
                value={Math.round(selectedRoom.y)} 
                onChange={handleChange}
                className="flex-1 w-full min-w-0 text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Size */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-400 w-3">W</span>
              <input 
                type="number" 
                name="width"
                min={10}
                value={Math.round(selectedRoom.width)} 
                onChange={handleChange}
                disabled={!!selectedRoom.points}
                className={clsx(
                  "flex-1 w-full min-w-0 text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors",
                  selectedRoom.points && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-400 w-3">H</span>
              <input 
                type="number" 
                name="height"
                min={10}
                value={Math.round(selectedRoom.height)} 
                onChange={handleChange}
                disabled={!!selectedRoom.points}
                className={clsx(
                  "flex-1 w-full min-w-0 text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors",
                  selectedRoom.points && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-2">
              <RotateCw className="w-3 h-3 text-zinc-400" />
              <input 
                type="number" 
                name="rotation"
                value={Math.round(selectedRoom.rotation)} 
                onChange={handleChange}
                className="flex-1 w-full min-w-0 text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Typography */}
            {selectedRoom.type !== 'layout' && (
              <div className="col-span-2 pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Typography</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400 w-8">Font</span>
                    <select
                      name="fontFamily"
                      value={selectedRoom.fontFamily || 'Orbitron'}
                      onChange={(e) => updateRoom(selectedRoom.id, { fontFamily: e.target.value })}
                      className="flex-1 w-full text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Orbitron, sans-serif">Orbitron</option>
                      <option value="Outfit, sans-serif">Outfit</option>
                      <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                      <option value="Impact, fantasy">Impact</option>
                      <option value="system-ui, sans-serif">System Default</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400 w-8">Size</span>
                    <input
                      type="number"
                      name="fontSize"
                      value={selectedRoom.fontSize || ''}
                      placeholder="Auto"
                      onChange={(e) => updateRoom(selectedRoom.id, { fontSize: e.target.value ? Number(e.target.value) : undefined })}
                      min={8}
                      max={200}
                      className="flex-1 w-full text-xs px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vector Points Help */}
        {selectedRoom.points && (
          <div className="p-4">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              How to edit custom shape?
            </button>
            {showHelp && (
              <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong>Edit Points:</strong> Drag the blue dots on the canvas to change shape. Click the lighter dots on the edges to add more points. Double-click a blue dot to remove it.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
