import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer, Text, Group, Line, Circle, Label, Tag, Shape } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useBuilderStore } from '../../store/useBuilderStore';
import { RoomType } from '../../types/builder';
import { useTheme } from '../../context/ThemeContext';
import { ZoomIn, ZoomOut, Maximize, Map as MapIcon, MousePointer2 } from 'lucide-react';
import clsx from 'clsx';

const TYPE_COLORS: Record<string, string> = {
  classroom: '#3b82f6',
  lab: '#22c55e',
  office: '#00e6c3',
  washroom: '#a3a3a3',
  staircase: '#a3a3a3',
  lift: '#a3a3a3',
  corridor: '#a3a3a3',
  layout: '#27272a',
  staffroom: '#eab308',
  other: '#a3a3a3',
};

const MIN_SIZE = 20;

export const CanvasSurface = () => {
  const { 
    rooms, selectedIds, setSelection, tool, setTool, activeRoomType,
    mode, addRoom, updateRoom, deleteRooms,
    viewport, setViewport, showMinimap, setShowMinimap, snapToGrid, currentFloorIndex,
    groupRooms, ungroupRooms
  } = useBuilderStore();
  
  const { theme } = useTheme();
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  // Drawing Room State
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState<{x: number, y: number} | null>(null);
  const [drawCurrentPos, setDrawCurrentPos] = useState<{x: number, y: number} | null>(null);

  // Marquee Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selStart, setSelStart] = useState<{x: number, y: number} | null>(null);
  const [selEnd, setSelEnd] = useState<{x: number, y: number} | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // For multi-drag synchronization
  const dragStartNodesRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Local ref for dragging points without flooding global history or interrupting Konva drag
  const draggedPointsRef = useRef<{roomId: string, points: {x: number, y: number}[]} | null>(null);
  const [activeGuides, setActiveGuides] = useState<{type: 'vertical' | 'horizontal', position: number}[]>([]);

  // Keybindings
  useEffect(() => {
    if (rooms.length === 0) return;
    const minX = Math.min(...rooms.map(r => r.points && r.points.length > 0 ? r.x + Math.min(...r.points.map(p => p.x)) : r.x));
    const minY = Math.min(...rooms.map(r => r.points && r.points.length > 0 ? r.y + Math.min(...r.points.map(p => p.y)) : r.y));
    const maxX = Math.max(...rooms.map(r => r.points && r.points.length > 0 ? r.x + Math.max(...r.points.map(p => p.x)) : r.x + r.width));
    const maxY = Math.max(...rooms.map(r => r.points && r.points.length > 0 ? r.y + Math.max(...r.points.map(p => p.y)) : r.y + r.height));
    const padding = 100;
    
    const cWidth = containerRef.current?.clientWidth || (window.innerWidth - 576);
    const cHeight = containerRef.current?.clientHeight || window.innerHeight;
    
    const scaleX = cWidth / (maxX - minX + padding * 2);
    const scaleY = cHeight / (maxY - minY + padding * 2);
    const scale = Math.min(scaleX, scaleY, 2);
    
    setViewport({
      scale,
      x: cWidth / 2 - (minX + (maxX - minX) / 2) * scale,
      y: cHeight / 2 - (minY + (maxY - minY) / 2) * scale
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFloorIndex]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceDown && document.activeElement?.tagName !== 'INPUT') {
        setIsSpaceDown(true);
      }
      
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement?.tagName !== 'INPUT') {
        if (selectedIds.length > 0) {
          deleteRooms(selectedIds);
        }
      }

      // Grouping
      if ((e.key === 'g' || e.key === 'G') && (e.ctrlKey || e.metaKey) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupRooms(selectedIds);
        } else {
          if (selectedIds.length > 1) {
            groupRooms(selectedIds);
          }
        }
      }

      // Nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        selectedIds.forEach(id => {
          const r = rooms.find(room => room.id === id);
          if (r) {
            updateRoom(id, {
              x: r.x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0),
              y: r.y + (e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0),
            });
          }
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpaceDown, selectedIds, rooms, deleteRooms, updateRoom, groupRooms, ungroupRooms]);

  // Auto-attach transformer
  useEffect(() => {
    if (selectedIds.length === 1 && transformerRef.current) {
      const stage = stageRef.current;
      const room = rooms.find(r => r.id === selectedIds[0]);
      
      // Do not attach transformer to shapes with custom points
      // since they have their own point-editing anchors
      if (room && room.points) {
        transformerRef.current.nodes([]);
        return;
      }
      
      const selectedNode = stage.findOne(`#room-${selectedIds[0]}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, rooms]);

  const snap = (val: number) => {
    if (isNaN(val) || val === undefined) return 0;
    return snapToGrid ? Math.round(val / 10) * 10 : val;
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom
      const scaleBy = 1.1;
      const oldScale = viewport.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      };

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(newScale, 5));

      setViewport({
        scale: clampedScale,
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    } else {
      // Pan
      setViewport({
        ...viewport,
        x: viewport.x - e.evt.deltaX,
        y: viewport.y - e.evt.deltaY
      });
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const isMiddleClick = e.evt instanceof MouseEvent && e.evt.button === 1;
    if (isSpaceDown || isMiddleClick) {
      setIsPanning(true);
      return;
    }

    const clickedOnEmpty = e.target === stageRef.current;

    if (tool === 'select') {
      if (clickedOnEmpty) {
        // Start Marquee
        const stage = stageRef.current;
        const pos = stage.getPointerPosition();
        if (pos) {
          const x = (pos.x - viewport.x) / viewport.scale;
          const y = (pos.y - viewport.y) / viewport.scale;
          setIsSelecting(true);
          setSelStart({ x, y });
          setSelEnd({ x, y });
          if (!e.evt.shiftKey) setSelection([]);
        }
      }
      return;
    }

    if (tool === 'draw') {
      const stage = stageRef.current;
      const pos = stage.getPointerPosition();
      if (pos) {
        setIsDrawingRoom(true);
        const x = snap((pos.x - viewport.x) / viewport.scale);
        const y = snap((pos.y - viewport.y) / viewport.scale);
        setDrawStartPos({ x, y });
        setDrawCurrentPos({ x, y });
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (pos) {
      setMousePos({ 
        x: Math.round((pos.x - viewport.x) / viewport.scale), 
        y: Math.round((pos.y - viewport.y) / viewport.scale) 
      });
    }

    if (isPanning && e.evt instanceof MouseEvent) {
      setViewport({
        ...viewport,
        x: viewport.x + e.evt.movementX,
        y: viewport.y + e.evt.movementY
      });
      return;
    }

    if (isSelecting && selStart && pos) {
      const x = (pos.x - viewport.x) / viewport.scale;
      const y = (pos.y - viewport.y) / viewport.scale;
      setSelEnd({ x, y });
    }

    if (isDrawingRoom && tool === 'draw' && drawStartPos && pos) {
      const x = snap((pos.x - viewport.x) / viewport.scale);
      const y = snap((pos.y - viewport.y) / viewport.scale);
      setDrawCurrentPos({ x, y });
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    setIsPanning(false);

    if (isSelecting && selStart && selEnd) {
      // Calculate intersection
      const box = {
        x: Math.min(selStart.x, selEnd.x),
        y: Math.min(selStart.y, selEnd.y),
        width: Math.abs(selEnd.x - selStart.x),
        height: Math.abs(selEnd.y - selStart.y)
      };
      let newSelected = rooms.filter(r => 
        r.x < box.x + box.width && r.x + r.width > box.x &&
        r.y < box.y + box.height && r.y + r.height > box.y
      ).map(r => r.id);

      // Expand to include groups
      const groupsToSelect = new Set<string>();
      newSelected.forEach(id => {
        const room = rooms.find(r => r.id === id);
        if (room?.groupId) groupsToSelect.add(room.groupId);
      });
      if (groupsToSelect.size > 0) {
        const expanded = new Set<string>(newSelected);
        rooms.forEach(room => {
          if (room.groupId && groupsToSelect.has(room.groupId)) {
            expanded.add(room.id);
          }
        });
        newSelected = Array.from(expanded);
      }

      if (e.evt.shiftKey) {
        setSelection([...new Set([...selectedIds, ...newSelected])]);
      } else {
        setSelection(newSelected);
      }
      setIsSelecting(false);
      setSelStart(null);
      setSelEnd(null);
    }

    if (isDrawingRoom && tool === 'draw' && drawStartPos && drawCurrentPos) {
      setIsDrawingRoom(false);
      const width = Math.abs(drawCurrentPos.x - drawStartPos.x);
      const height = Math.abs(drawCurrentPos.y - drawStartPos.y);
      const x = Math.min(drawStartPos.x, drawCurrentPos.x);
      const y = Math.min(drawStartPos.y, drawCurrentPos.y);

      if (width > 10 && height > 10) {
        addRoom({
          name: activeRoomType === 'layout' ? 'Floor Layout' : 'New Room',
          type: activeRoomType,
          status: 'active',
          x, y, width, height, rotation: 0,
          accessibilityFlags: [], images: [], notes: '', directions: '', customFields: [], doors: [], locked: false,
          points: [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }]
        });
      }
      setDrawStartPos(null);
      setDrawCurrentPos(null);
      if (activeRoomType === 'layout') setTool('select');
    }
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>, id: string) => {
    // Record original positions of all selected rooms
    const dragMap = new Map<string, { x: number; y: number }>();
    selectedIds.forEach(selId => {
      const room = rooms.find(r => r.id === selId);
      if (room && !room.locked) {
        dragMap.set(selId, { x: room.x, y: room.y });
      }
    });
    dragStartNodesRef.current = dragMap;
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>, id: string) => {
    if (selectedIds.length <= 1) return;
    
    const node = e.target;
    const dragStartPos = dragStartNodesRef.current.get(id);
    if (!dragStartPos) return;

    const dx = node.x() - dragStartPos.x;
    const dy = node.y() - dragStartPos.y;

    const stage = stageRef.current;
    if (!stage) return;

    selectedIds.forEach(selId => {
      if (selId === id) return; // Self is handled by Konva natively
      const originalPos = dragStartNodesRef.current.get(selId);
      if (originalPos) {
        const otherNode = stage.findOne(`#room-${selId}`);
        if (otherNode) {
          otherNode.position({
            x: originalPos.x + dx,
            y: originalPos.y + dy
          });
        }
      }
    });
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const node = e.target;
    const dragStartPos = dragStartNodesRef.current.get(id);
    
    if (selectedIds.length > 1 && dragStartPos) {
      const dx = node.x() - dragStartPos.x;
      const dy = node.y() - dragStartPos.y;
      
      const updatesList = selectedIds.map(selId => {
        const originalPos = dragStartNodesRef.current.get(selId);
        if (originalPos) {
          return {
            id: selId,
            updates: { x: snap(originalPos.x + dx), y: snap(originalPos.y + dy) }
          };
        }
        return null;
      }).filter(Boolean) as { id: string, updates: Partial<BuilderRoom> }[];
      
      updateRooms(updatesList);
    } else {
      updateRoom(id, { x: snap(node.x()), y: snap(node.y()) });
    }
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const room = rooms.find(r => r.id === id);
    const scaledPoints = room?.points?.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));
    const newWidth = Math.max(MIN_SIZE, snap(node.width() * scaleX) || MIN_SIZE);
    const newHeight = Math.max(MIN_SIZE, snap(node.height() * scaleY) || MIN_SIZE);
    
    updateRoom(id, {
      x: snap(node.x()) || 0,
      y: snap(node.y()) || 0,
      width: newWidth,
      height: newHeight,
      rotation: snap(node.rotation()) || 0,
      ...(scaledPoints ? { points: scaledPoints } : {})
    });
  };

  const handleRoomClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, id: string) => {
    if (tool !== 'select' || isSpaceDown) return;
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const altPressed = e.evt.altKey;

    const room = rooms.find(r => r.id === id);
    let idsToSelect = [id];

    if (!altPressed && room?.groupId) {
      idsToSelect = rooms.filter(r => r.groupId === room.groupId).map(r => r.id);
    }

    if (metaPressed) {
      // Toggle logic for multi-select
      const allIncluded = idsToSelect.every(i => selectedIds.includes(i));
      if (allIncluded) {
        setSelection(selectedIds.filter(s => !idsToSelect.includes(s)));
      } else {
        setSelection([...new Set([...selectedIds, ...idsToSelect])]);
      }
    } else {
      setSelection(idsToSelect);
    }
  };

  const zoomToFit = () => {
    if (rooms.length === 0) return;
    const minX = Math.min(...rooms.map(r => r.points && r.points.length > 0 ? r.x + Math.min(...r.points.map(p => p.x)) : r.x));
    const minY = Math.min(...rooms.map(r => r.points && r.points.length > 0 ? r.y + Math.min(...r.points.map(p => p.y)) : r.y));
    const maxX = Math.max(...rooms.map(r => r.points && r.points.length > 0 ? r.x + Math.max(...r.points.map(p => p.x)) : r.x + r.width));
    const maxY = Math.max(...rooms.map(r => r.points && r.points.length > 0 ? r.y + Math.max(...r.points.map(p => p.y)) : r.y + r.height));
    const padding = 100;
    
    const cWidth = containerRef.current?.clientWidth || (window.innerWidth - 576);
    const cHeight = containerRef.current?.clientHeight || window.innerHeight;
    
    const scaleX = cWidth / (maxX - minX + padding * 2);
    const scaleY = cHeight / (maxY - minY + padding * 2);
    const scale = Math.min(scaleX, scaleY, 2);
    
    setViewport({
      scale,
      x: cWidth / 2 - (minX + (maxX - minX) / 2) * scale,
      y: cHeight / 2 - (minY + (maxY - minY) / 2) * scale
    });
  };

  // Minimap calculation
  const minimapSize = 150;
  const mmMinX = Math.min(0, ...rooms.map(r => r.x));
  const mmMinY = Math.min(0, ...rooms.map(r => r.y));
  const mmMaxX = Math.max(1000, ...rooms.map(r => r.x + r.width));
  const mmMaxY = Math.max(1000, ...rooms.map(r => r.y + r.height));
  const mmScale = Math.min(minimapSize / (mmMaxX - mmMinX || 1), minimapSize / (mmMaxY - mmMinY || 1)) * 0.9;
  const mmOffsetX = (minimapSize - (mmMaxX - mmMinX) * mmScale) / 2 - mmMinX * mmScale;
  const mmOffsetY = (minimapSize - (mmMaxY - mmMinY) * mmScale) / 2 - mmMinY * mmScale;

  const gridBackground = `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`;
  const gridBackgroundDark = `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`;
  const gridSpacing = 40 * viewport.scale;

  const sortedRooms = [...rooms].sort((a, b) => (a.type === 'layout' ? -1 : b.type === 'layout' ? 1 : 0));
  
  // Compute visual bounding box for selected groups
  let groupBoundingBox = null;
  if (selectedIds.length > 1) {
    const selectedRooms = rooms.filter(r => selectedIds.includes(r.id));
    const allSameGroup = selectedRooms.every(r => r.groupId && r.groupId === selectedRooms[0].groupId);
    if (allSameGroup && selectedRooms.length > 0) {
      const minX = Math.min(...selectedRooms.map(r => r.x));
      const minY = Math.min(...selectedRooms.map(r => r.y));
      const maxX = Math.max(...selectedRooms.map(r => r.x + r.width));
      const maxY = Math.max(...selectedRooms.map(r => r.y + r.height));
      groupBoundingBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
  }

  return (
    <div 
      ref={containerRef}
      className={clsx(
        "relative w-full h-full overflow-hidden bg-white dark:bg-[#0a0a0c]",
        isSpaceDown ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : (tool === 'draw' ? 'cursor-crosshair' : 'cursor-default')
      )}
      style={{
        backgroundImage: theme === 'dark' ? gridBackgroundDark : gridBackground, 
        backgroundSize: `${gridSpacing}px ${gridSpacing}px`,
        backgroundPosition: `${viewport.x % gridSpacing}px ${viewport.y % gridSpacing}px`
      }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {groupBoundingBox && (
            <Rect
              x={groupBoundingBox.x - 5 / viewport.scale}
              y={groupBoundingBox.y - 5 / viewport.scale}
              width={groupBoundingBox.width + 10 / viewport.scale}
              height={groupBoundingBox.height + 10 / viewport.scale}
              stroke="#06b6d4"
              strokeWidth={1.5 / viewport.scale}
              dash={[5 / viewport.scale, 5 / viewport.scale]}
              listening={false}
            />
          )}

          {sortedRooms.map(room => {
            const isSel = selectedIds.includes(room.id);
            const color = room.color || TYPE_COLORS[room.type] || '#ccc';
            return (
              <Group
                key={room.id}
                id={`room-${room.id}`}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                rotation={room.rotation}
                draggable={tool === 'select' && isSel && !room.locked && !isSpaceDown}
                listening={true}
                onClick={(e) => handleRoomClick(e, room.id)}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  setSelection([room.id]);
                  if (mode === 'layout') setMode('room_details');
                }}
                onTransform={(e) => {
                  const node = e.target;
                  if (room.points) return;
                  
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  
                  node.scaleX(1);
                  node.scaleY(1);
                  
                  const newWidth = Math.max(10, node.width() * scaleX);
                  const newHeight = Math.max(10, node.height() * scaleY);
                  
                  node.width(newWidth);
                  node.height(newHeight);
                  
                  const rect = node.findOne('.room-rect');
                  if (rect) {
                    rect.width(newWidth);
                    rect.height(newHeight);
                  }
                  
                  const text = node.findOne('.room-text');
                  if (text) {
                    text.width(newWidth);
                    text.height(newHeight);
                  }
                }}
                onDragStart={(e) => handleDragStart(e, room.id)}
                onDragMove={(e) => handleDragMove(e, room.id)}
                onDragEnd={(e) => handleDragEnd(e, room.id)}
                onTransformEnd={(e) => handleTransformEnd(e, room.id)}
              >
                {room.points ? (
                  <Shape
                    sceneFunc={(context, shape) => {
                      const pts = draggedPointsRef.current?.roomId === room.id ? draggedPointsRef.current.points : room.points!;
                      if (pts.length < 3) return;
                      context.beginPath();
                      context.moveTo((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
                      for (let i = 1; i <= pts.length; i++) {
                        const currentCorner = pts[i % pts.length];
                        const nextPoint = pts[(i + 1) % pts.length];
                        const prevPoint = pts[(i - 1) % pts.length];
                        
                        const dist1 = Math.hypot(currentCorner.x - prevPoint.x, currentCorner.y - prevPoint.y);
                        const dist2 = Math.hypot(nextPoint.x - currentCorner.x, nextPoint.y - currentCorner.y);
                        const radius = room.type === 'layout' ? 0 : Math.min(8, dist1 / 2, dist2 / 2);
                        
                        context.arcTo(currentCorner.x, currentCorner.y, nextPoint.x, nextPoint.y, radius);
                      }
                      context.closePath();
                      context.fillStrokeShape(shape);
                    }}
                    fill={room.type === 'layout' ? 'transparent' : '#0a0a0a'}
                    opacity={room.type === 'layout' ? 1 : 0.9}
                    stroke={room.type === 'layout' && !isSel ? '#06b6d4' : (isSel ? '#ffffff' : color)}
                    strokeWidth={isSel ? 3 / viewport.scale : 2 / viewport.scale}
                    dash={room.type === 'layout' && mode === 'layout' ? [10 / viewport.scale, 10 / viewport.scale] : undefined}
                  />
                ) : (
                  <Rect
                    name="room-rect"
                    width={room.width}
                    height={room.height}
                    fill={room.type === 'layout' ? 'transparent' : '#0a0a0a'}
                    opacity={room.type === 'layout' ? 1 : 0.9}
                    stroke={isSel ? '#ffffff' : color}
                    strokeWidth={isSel ? 3 / viewport.scale : 2 / viewport.scale}
                    cornerRadius={room.type === 'layout' ? 0 : 8}
                  />
                )}
                
                {/* Info Text */}
                {(() => {
                  let textX = 0;
                  let textY = 0;
                  let textWidth = room.width;
                  let textHeight = room.height;
                  const pts = draggedPointsRef.current?.roomId === room.id ? draggedPointsRef.current.points : room.points;
                  
                  if (pts && pts.length > 0) {
                    const minX = Math.min(...pts.map(p => p.x));
                    const maxX = Math.max(...pts.map(p => p.x));
                    const minY = Math.min(...pts.map(p => p.y));
                    const maxY = Math.max(...pts.map(p => p.y));
                    textX = minX;
                    textY = minY;
                    textWidth = Math.max(10, maxX - minX);
                    textHeight = Math.max(10, maxY - minY);
                  }

                  return (
                    <Text
                      name="room-text"
                      scaleX={1}
                      scaleY={1}
                      x={textX}
                      y={textY}
                      text={room.type === 'layout' ? '' : room.name.toUpperCase()}
                      width={textWidth}
                      height={textHeight}
                      align="center"
                      verticalAlign="middle"
                      fill={isSel ? '#ffffff' : color}
                      fontFamily={room.fontFamily || "Orbitron, sans-serif"}
                      fontSize={room.fontSize ? room.fontSize : Math.max(12, 14 / viewport.scale)}
                      fontStyle="900"
                    />
                  );
                })()}
              </Group>
            );
          })}

          {/* Custom Shape Editing Anchors - Rendered OVER everything else */}
          {(() => {
            if (tool !== 'select' || selectedIds.length !== 1 || isSpaceDown) return null;
            const activeRoom = rooms.find(r => r.id === selectedIds[0]);
            if (!activeRoom || !activeRoom.points || activeRoom.locked) return null;
            
            return (
              <Group x={activeRoom.x} y={activeRoom.y} rotation={activeRoom.rotation} listening={true} draggable={false}>
                {activeRoom.points.map((pt, i, arr) => (
                  <React.Fragment key={`point-${i}`}>
                    {/* Vertex */}
                    <Circle
                      x={pt.x}
                      y={pt.y}
                      radius={6 / viewport.scale}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth={2 / viewport.scale}
                      draggable
                      hitStrokeWidth={12}
                      onDragStart={(e) => { e.cancelBubble = true; }}
                      onDragMove={(e) => {
                        e.cancelBubble = true;
                        const SNAP_DIST = 10 / viewport.scale;
                        let newX = e.target.x();
                        let newY = e.target.y();
                        const guides: {type: 'vertical' | 'horizontal', position: number}[] = [];
                        
                        arr.forEach((otherPt, idx) => {
                          if (idx === i) return;
                          if (Math.abs(newX - otherPt.x) < SNAP_DIST) {
                            newX = otherPt.x;
                            if (!guides.find(g => g.type === 'vertical' && g.position === newX)) guides.push({ type: 'vertical', position: newX });
                          }
                          if (Math.abs(newY - otherPt.y) < SNAP_DIST) {
                            newY = otherPt.y;
                            if (!guides.find(g => g.type === 'horizontal' && g.position === newY)) guides.push({ type: 'horizontal', position: newY });
                          }
                        });
                        
                        e.target.x(newX);
                        e.target.y(newY);
                        setActiveGuides(guides);
                        
                        const newPoints = [...arr];
                        newPoints[i] = { x: newX, y: newY };
                        draggedPointsRef.current = { roomId: activeRoom.id, points: newPoints };
                        e.target.getLayer()?.batchDraw();
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true;
                        setActiveGuides([]);
                        const newPoints = [...arr];
                        newPoints[i] = { x: snap(e.target.x()), y: snap(e.target.y()) };
                        draggedPointsRef.current = null;
                        updateRoom(activeRoom.id, { points: newPoints });
                      }}
                      onDblClick={(e) => {
                        e.cancelBubble = true;
                        if (arr.length > 3) updateRoom(activeRoom.id, { points: arr.filter((_, index) => index !== i) });
                      }}
                    />
                    {/* Midpoint - Only for Floor Layout */}
                    {activeRoom.type === 'layout' && (
                      <Circle
                        x={(pt.x + arr[(i + 1) % arr.length].x) / 2}
                        y={(pt.y + arr[(i + 1) % arr.length].y) / 2}
                        radius={4 / viewport.scale}
                        fill="#93c5fd"
                        opacity={0.8}
                        hitStrokeWidth={10}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          const newPoints = [...arr];
                          newPoints.splice(i + 1, 0, { x: snap(e.target.x()), y: snap(e.target.y()) });
                          updateRoom(activeRoom.id, { points: newPoints });
                        }}
                        onMouseEnter={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) container.style.cursor = 'pointer';
                          e.target.scale({ x: 1.5, y: 1.5 });
                        }}
                        onMouseLeave={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) container.style.cursor = 'default';
                          e.target.scale({ x: 1, y: 1 });
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}

                {/* Active Guides */}
                {activeGuides.map((guide, i) => (
                  <Line
                    key={`guide-${i}`}
                    points={guide.type === 'vertical' ? [guide.position, -9999, guide.position, 9999] : [-9999, guide.position, 9999, guide.position]}
                    stroke="#ef4444"
                    strokeWidth={1 / viewport.scale}
                    dash={[5 / viewport.scale, 5 / viewport.scale]}
                    listening={false}
                  />
                ))}
              </Group>
            );
          })()}

          {/* Marquee Selection Box */}
          {isSelecting && selStart && selEnd && (
            <Rect
              x={Math.min(selStart.x, selEnd.x)}
              y={Math.min(selStart.y, selEnd.y)}
              width={Math.abs(selEnd.x - selStart.x)}
              height={Math.abs(selEnd.y - selStart.y)}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth={1 / viewport.scale}
              listening={false}
            />
          )}

          {/* Ghost Rect for Drawing */}
          {isDrawingRoom && drawStartPos && drawCurrentPos && (
            <Rect
              x={Math.min(drawStartPos.x, drawCurrentPos.x)}
              y={Math.min(drawStartPos.y, drawCurrentPos.y)}
              width={Math.abs(drawCurrentPos.x - drawStartPos.x)}
              height={Math.abs(drawCurrentPos.y - drawStartPos.y)}
              fill={TYPE_COLORS[activeRoomType] || '#ccc'}
              opacity={0.4}
              stroke="#2563eb"
              strokeWidth={2 / viewport.scale}
              dash={[5 / viewport.scale, 5 / viewport.scale]}
              listening={false}
            />
          )}

          <Transformer 
            ref={transformerRef} 
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]} 
            resizeEnabled={!(selectedIds.length === 1 && (rooms.find(r => r.id === selectedIds[0])?.points?.length || 0) > 0)}
          />
        </Layer>
      </Stage>

      {/* Floating Status Bar & Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-1 z-20">
        <div className="px-3 text-[10px] font-mono text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <span>X: {mousePos.x} Y: {mousePos.y}</span>
        </div>
        <button onClick={() => setViewport({...viewport, scale: Math.max(0.1, viewport.scale - 0.2)})} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-medium w-10 text-center text-zinc-700 dark:text-zinc-300">
          {Math.round(viewport.scale * 100)}%
        </span>
        <button onClick={() => setViewport({...viewport, scale: Math.min(5, viewport.scale + 0.2)})} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
        <button onClick={zoomToFit} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300" title="Zoom to Fit">
          <Maximize size={14} />
        </button>
      </div>

      {/* Minimap Toggle */}
      <button 
        onClick={() => setShowMinimap(!showMinimap)}
        className="absolute bottom-4 left-4 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 z-20 transition-colors"
        title="Toggle Minimap"
      >
        <MapIcon size={18} />
      </button>

      {/* SVG Minimap */}
      {showMinimap && (
        <div className="absolute bottom-16 left-4 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-2 z-20 backdrop-blur-md">
          <svg width={minimapSize} height={minimapSize} className="border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-black/50">
            {rooms.map(r => (
              <rect 
                key={`mm-${r.id}`}
                x={r.x * mmScale + mmOffsetX}
                y={r.y * mmScale + mmOffsetY}
                width={r.width * mmScale}
                height={r.height * mmScale}
                fill={TYPE_COLORS[r.type] || '#ccc'}
                opacity={0.8}
              />
            ))}
            {/* Viewport indicator */}
            <rect 
              x={(-viewport.x / viewport.scale) * mmScale + mmOffsetX}
              y={(-viewport.y / viewport.scale) * mmScale + mmOffsetY}
              width={(window.innerWidth / viewport.scale) * mmScale}
              height={(window.innerHeight / viewport.scale) * mmScale}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}

      {/* Empty State */}
      {rooms.length === 0 && tool !== 'draw' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <MousePointer2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-white mb-1">Canvas is empty</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Press <strong>P</strong> to select the Draw tool and sketch a room.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
