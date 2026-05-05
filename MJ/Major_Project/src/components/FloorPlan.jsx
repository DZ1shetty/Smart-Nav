import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Plus, Minus, Maximize, Edit3, Save, Undo2, Redo2, XCircle, Users, RotateCcw } from 'lucide-react'
import { floorsData } from '../data/floorsData'
import FloorMapSVG from './FloorMapSVG'
import RoomModal from './RoomModal'
import FacultyProfileModal from './FacultyProfileModal'
import FacultyDirectoryModal from './FacultyDirectoryModal'
import SearchSystem from './SearchSystem'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

// --- GLOBAL SAFETY UTILITY ---
const SafeComponent = (Component, props) => {
  if (!Component || typeof Component !== 'function') {
    console.warn("Component reference missing or invalid:", Component);
    return null;
  }
  return <Component {...props} />;
};

// --- DYNAMIC DEFAULT SYSTEM (STABLE + ERROR-FREE) ---

/**
 * STAGE 4: DATA STRUCTURE VALIDATION (CRITICAL)
 * Ensures we never save corrupt or partial data that could crash the app.
 */
const isValidLayout = (layout) => {
  if (!layout) return false;
  const rooms = Array.isArray(layout) ? layout : (layout.rooms || []);
  return Array.isArray(rooms) && rooms.every(room => 
    room.id && 
    typeof (room.x ?? 0) === 'number' && 
    typeof (room.y ?? 0) === 'number'
  );
};

export default function FloorPlan() {
  const { floorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false)
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [selectedFacultyProfile, setSelectedFacultyProfile] = useState(null)
  const [highlightedRoomId, setHighlightedRoomId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'

  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]); // Dynamic faculty list
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [mapImage, setMapImage] = useState(null);

  /**
   * STAGE 4: AUTO LOAD (CRITICAL FOR ALL USERS)
   * Firestore is now the SINGLE SOURCE OF TRUTH.
   * RESET -> Loads LAST SAVED from Firestore.
   */
  useEffect(() => {
    // Map floorId (e.g., 'fifth') to document name (e.g., 'Fifth-Floor')
    const docName = floorId.charAt(0).toUpperCase() + floorId.slice(1) + "-Floor";
    const docRef = doc(db, "layouts", docName);

    console.log(`[Firestore] Subscribing to: ${docName}`);

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        console.log(`[Firestore] New data received for ${docName}:`, data);
        
        // STAGE 3 & 4: Load EVERYTHING from Firestore
        if (data.rooms) setRooms(data.rooms);
        if (data.faculty) setFaculty(data.faculty);
        if (data.mapImage) setMapImage(data.mapImage);
        setIsLocked(data.locked !== false);
      } else {
        console.warn(`[Firestore] Document ${docName} does not exist. Falling back to static data.`);
        // ONLY fall back if Firestore is completely empty for this floor
        const staticData = floorsData[floorId];
        if (staticData) {
          setRooms(staticData.rooms || []);
          setFaculty(staticData.faculty || []);
          setMapImage(staticData.mapImage || null);
          setIsLocked(true);
        }
      }
    }, (error) => {
      console.error("[Firestore] Snapshot error:", error);
    });

    return () => unsub();
  }, [floorId]);

  // Clean rooms with basic metadata
  const roomsWithMetadata = useMemo(() => {
    return rooms; // Already merged in useEffect
  }, [rooms]);

  /**
   * STAGE 2: SAVE = OVERWRITE DEFAULT (CRITICAL)
   * Guaranteed overwrite to Firestore.
   */
  const onSave = async (roomsOverride = null, facultyOverride = null) => {
    const targetRooms = (roomsOverride && Array.isArray(roomsOverride)) ? roomsOverride : rooms;
    const targetFaculty = (facultyOverride && Array.isArray(facultyOverride)) ? facultyOverride : faculty;

    if (!isValidLayout(targetRooms)) {
      console.error("Invalid layout structure - Save aborted");
      alert("Error: Invalid room data detected.");
      return;
    }

    setSaveStatus('saving');
    
    // STAGE 6: PIXEL-ACCURATE DATA PREPARATION
    const cleanRooms = targetRooms.map(room => ({
      id: room.id,
      name: room.name || room.label,
      label: room.name || room.label,
      type: room.type,
      x: Math.round(room.x ?? 0),
      y: Math.round(room.y ?? 0),
      w: Math.round(room.w || room.width || 0),
      h: Math.round(room.h || room.height || 0),
      width: Math.round(room.w || room.width || 0),
      height: Math.round(room.h || room.height || 0),
      directions: room.directions || '',
      description: room.description || '',
      image: room.image || '',
      tags: room.tags || [],
      clickable: room.clickable !== false
    }));

    try {
      const docName = floorId.charAt(0).toUpperCase() + floorId.slice(1) + "-Floor";
      const docRef = doc(db, "layouts", docName);

      // STAGE 2: FORBIDDEN: merge: true. Overwriting entire document.
      await setDoc(docRef, {
        floorId,
        rooms: cleanRooms,
        faculty: targetFaculty,
        mapImage,
        locked: true,
        lastEdited: new Date().toISOString()
      });

      console.log(`[Firestore] Successfully saved ${docName}`);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditMode(false);
        setIsLocked(true);
      }, 3000);
    } catch (error) {
      console.error('[Firestore] Save failed:', error);
      alert("Failed to save to Firestore. Check console for details.");
      setSaveStatus('idle');
    }
  };

  /**
   * STAGE 6: GLOBAL EXPORT (FOR DEVELOPERS)
   */

  const handleEditUnlock = async () => {
    try {
      await fetch(`/api/layout/${floorId}/unlock`, { method: 'PATCH' });
      setIsLocked(false);
      setIsEditMode(true);
    } catch (err) {
      setIsEditMode(true);
      setIsLocked(false);
    }
  }

  const handleRoomMove = (roomId, newX, newY) => {
    if (!isEditMode) return;
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, x: newX, y: newY } : r));
  };

  const handleRoomResize = (roomId, newW, newH) => {
    if (!isEditMode) return;
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, w: newW, h: newH, width: newW, height: newH } : r));
  };

  const handleBoundaryChange = (field, delta) => {
    console.log(`Boundary adjustment (${field}): ${delta}`);
  };

  /**
   * STAGE 3: RESET = LOAD LAST SAVED (STRICT)
   * Fetches fresh from Firestore to override any local UI changes.
   */
  const handleResetDefault = async () => {
    if (!window.confirm("Reset this floor to the LAST SAVED Firestore state?")) return;
    
    const docName = floorId.charAt(0).toUpperCase() + floorId.slice(1) + "-Floor";
    const docRef = doc(db, "layouts", docName);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setRooms(data.rooms || []);
        setFaculty(data.faculty || []);
        setMapImage(data.mapImage || null);
        setIsLocked(true);
        alert("Layout reset to last saved state.");
      } else {
        alert("No saved layout found in Firestore for this floor.");
      }
    } catch (error) {
      console.error("[Firestore] Reset failed:", error);
    }
  };

  const handleDeleteFaculty = (facultyId) => {
    if (!window.confirm("Are you sure?")) return;
    setFaculty(prev => prev.filter((f, idx) => `list-${idx}-${f.name}` !== facultyId));
  };

  const handleMapImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMapImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const floorData = {
    ...(floorsData[floorId] || {}),
    rooms: roomsWithMetadata,
    faculty: faculty.length > 0 ? faculty : (floorsData[floorId]?.faculty || []),
    mapImage
  };

  const [zoom, setZoom] = useState(0.95)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 })
  const constraintsRef = useRef(null)
  const floorMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (floorMenuRef.current && !floorMenuRef.current.contains(event.target)) {
        setIsFloorMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isEditMode) return;
    const svg = e.currentTarget.querySelector('svg');
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    setMouseCoords({ x: Math.round(svgPt.x), y: Math.round(svgPt.y) });
  }, [isEditMode]);

  const allFaculty = useMemo(() => {
    if (!floorData) return []
    const roomFaculty = (floorData.rooms || [])
      .filter(room => room.faculty && room.faculty !== 'N/A' && room.faculty !== '')
      .filter(room => !(floorData.faculty || []).some(f => f.roomId === room.id || f.name === room.faculty))
      .map(room => ({
        id: room.id,
        name: room.faculty,
        image: room.image,
        roomName: room.name,
        department: room.department,
        originalRoom: room,
        floorKey: floorId
      }))
    const listFaculty = (floorData.faculty || []).map((f, idx) => {
      const room = floorData.rooms.find(r => r.id === f.roomId)
      return {
        id: `list-${idx}-${f.name}`,
        name: f.name,
        image: f.image,
        roomName: room?.name || 'Staff Area',
        department: f.department || room?.department,
        originalRoom: room,
        floorKey: floorId
      }
    })
    return [...roomFaculty, ...listFaculty]
  }, [floorData, floorId, faculty])

  const findFacultyGlobally = (name) => {
    for (const [fKey, fData] of Object.entries(floorsData)) {
      const roomMatch = fData.rooms?.find(r => r.faculty === name)
      if (roomMatch) return { id: roomMatch.id, name: roomMatch.faculty, image: roomMatch.image, roomName: roomMatch.name, department: roomMatch.department, originalRoom: roomMatch, floorKey: fKey }
      const listMatch = fData.faculty?.find(f => f.name === name)
      if (listMatch) {
        const room = fData.rooms?.find(r => r.id === listMatch.roomId)
        return { id: `list-${name}`, name: listMatch.name, image: listMatch.image, roomName: room?.name || 'Staff Area', department: listMatch.department || room?.department, originalRoom: room, floorKey: fKey }
      }
    }
    return null
  }

  const [activeFilters, setActiveFilters] = useState([])
  const [activeSearchIds, setActiveSearchIds] = useState(null)

  const toggleFilter = (type) => {
    setActiveFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleCloseRoom = () => {
    if (selectedRoom) setHighlightedRoomId(selectedRoom.id)
    navigate(location.pathname, { replace: true })
  }

  const handleCloseFaculty = () => {
    setSelectedFacultyProfile(null)
    setHighlightedRoomId(null)
    setActiveSearchIds(null)
    navigate(location.pathname, { replace: true })
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const roomId = searchParams.get('room')
    const facultyName = searchParams.get('faculty')

    if (roomId && floorData && floorData.rooms) {
      const room = floorData.rooms.find(r => r.id === roomId)
      if (room) {
        if (selectedRoom?.id !== room.id) {
          setHighlightedRoomId(room.id)
          if (!facultyName) setSelectedRoom(room)
        } else if (selectedRoom !== room) {
          setSelectedRoom(room)
        }
      }
    } else if (!roomId && selectedRoom) {
      setSelectedRoom(null)
    }

    if (facultyName) {
      let faculty = allFaculty.find(f => f.name === facultyName) || findFacultyGlobally(facultyName)
      if (faculty && selectedFacultyProfile?.name !== faculty.name) {
        setSelectedFacultyProfile(faculty)
      }
    } else if (!facultyName && selectedFacultyProfile) {
      setSelectedFacultyProfile(null)
    }
  }, [location.search, floorData, allFaculty])

  const handleZoom = (delta) => setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 4))
  const resetView = () => { setZoom(0.95); setPan({ x: 0, y: 0 }); }

  const floors = [
    { id: 'basement', label: 'Basement Floor' },
    { id: 'ground', label: 'Ground Floor' },
    { id: 'first', label: 'First Floor' },
    { id: 'second', label: 'Second Floor' },
    { id: 'third', label: 'Third Floor' },
    { id: 'fourth', label: 'Fourth Floor' },
    { id: 'fifth', label: 'Fifth Floor' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center overflow-hidden select-none"
    >
      <div className="absolute inset-0 blueprint-grid opacity-[0.05] pointer-events-none" />

      <header className="w-full z-40 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-3 px-6 md:px-12 flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button onMouseDown={() => navigate('/')} className="p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all group">
            <ArrowLeft className="w-4 h-4 text-black/40 dark:text-white/30 group-hover:text-blue-500 transition-colors" />
          </button>
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[9px] font-orbitron font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/20">
              <Link to="/" className="hover:text-blue-500 transition-colors">HOME</Link>
              <span>/</span>
              <span>{floorData?.buildingName || 'APJ-BLOCK'}</span>
              <span>/</span>
              <span className="text-blue-500">{floorData?.label}</span>
            </nav>
            <div className="relative mt-1" ref={floorMenuRef}>
              <button onMouseDown={() => setIsFloorMenuOpen(!isFloorMenuOpen)} className="flex items-center gap-2 text-xl font-orbitron font-black uppercase tracking-tighter hover:text-blue-500 transition-colors">
                <span>{floorData?.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${isFloorMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isFloorMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    <div className="p-2 grid grid-cols-1 gap-1">
                      {floors.map((f) => (
                        <button key={f.id} onMouseDown={(e) => { e.preventDefault(); navigate(`/floor/${f.id}`); setIsFloorMenuOpen(false); resetView(); }} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-[10px] font-orbitron font-black uppercase tracking-widest ${f.id === floorId ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/40 dark:text-white/30 hover:text-blue-500'}`}>
                          {f.label}
                          {f.id === floorId && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
          <div className="max-w-[700px] w-full relative group">
            <SearchSystem currentFloor={floorId} />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 min-w-[300px] justify-end">
          <AnimatePresence>
            {isEditMode ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 p-1 rounded-xl">
                <div className="flex items-center border-r border-black/10 dark:border-white/10 mr-1 pr-1 gap-1">
                  <button onClick={handleResetDefault} className="px-3 py-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase">RESET</button>
                  <label className="px-3 py-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase cursor-pointer">UPLOAD <input type="file" className="hidden" onChange={handleMapImageUpload} /></label>
                </div>
                <button onClick={() => onSave()} disabled={saveStatus !== 'idle'} className={`px-4 py-2 rounded-lg font-orbitron font-black text-[9px] uppercase tracking-widest ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-blue-500'} text-white`}>
                  {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'saved' ? 'SAVED' : 'SAVE'}
                </button>
                <button onClick={() => setIsEditMode(false)} className="p-2 text-black/40 dark:text-white/30 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                <button onMouseDown={() => setIsFacultyModalOpen(true)} className="p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all">
                  <Users className="w-4 h-4 text-blue-500" />
                </button>
                <div className="flex items-center bg-black/[0.03] dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 p-1">
                  <button onClick={() => handleZoom(0.25)} className="p-2 text-black/40 dark:text-white/30 hover:text-blue-500"><Plus className="w-3.5 h-3.5" /></button>
                  <div className="px-2 text-[9px] font-orbitron font-black text-blue-500">{Math.round(zoom * 100)}%</div>
                  <button onClick={() => handleZoom(-0.25)} className="p-2 text-black/40 dark:text-white/30 hover:text-blue-500"><Minus className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={resetView} className="p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all text-black/40 dark:text-white/30 hover:text-blue-500"><Maximize className="w-3.5 h-3.5" /></button>
                <button onClick={handleEditUnlock} className="p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all text-black/40 dark:text-white/30 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="relative flex-1 w-full flex items-center justify-center p-4 md:p-8 overflow-hidden" ref={constraintsRef}>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          {(!rooms || rooms.length === 0) ? (
            <div className="text-white/40 font-orbitron text-xl flex flex-col items-center gap-4 animate-pulse">
              <span className="text-4xl">⚠</span>
              <span>NO LAYOUT AVAILABLE</span>
            </div>
          ) : (
            <motion.div
              key={floorId}
              animate={selectedRoom ? { scale: 0.9, opacity: 1 } : { scale: zoom, opacity: 1 }}
              style={{ aspectRatio: '640/663' }}
              className={`relative w-[95%] h-[95%] max-w-[95vw] max-h-[85vh] floor-${floorId} bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500`}
              onMouseMove={handleMouseMove}
            >
              <FloorMapSVG 
                floorData={floorData} isEditMode={isEditMode} selectedRoomId={selectedRoom?.id} highlightedRoomId={highlightedRoomId} activeSearchIds={activeSearchIds} activeFilters={activeFilters}
                onRoomMove={handleRoomMove} onRoomResize={handleRoomResize} onBoundaryChange={handleBoundaryChange}
                onRoomClick={(room) => {
                  if (room.clickable === false) return;
                  
                  // Administrative offices like Purchase Section should show their photo, not the faculty list
                  const isAdminOffice = room.name?.toUpperCase().includes('PURCHASE');
                  
                  if (room.type === 'staffroom' && !isAdminOffice) {
                    setIsFacultyModalOpen(true);
                  } else {
                    navigate(`?room=${room.id}`);
                  }
                }}
              />
            </motion.div>
          )}
        </div>

        {isEditMode && (
          <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-lg font-mono text-blue-400 z-50 shadow-2xl border-blue-500/30">
            <span className="opacity-40 mr-2">POS</span> X: {mouseCoords.x} <span className="opacity-20 mx-2">|</span> Y: {mouseCoords.y}
          </div>
        )}
      </main>

      <div className={`absolute top-1/2 -translate-y-1/2 left-8 flex flex-col gap-4 z-30 transition-all duration-500 ${selectedRoom ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-2 rounded-2xl shadow-xl flex flex-col gap-1">
          {['classroom', 'lab', 'staffroom', 'hod', 'hall', 'utility'].map((type) => (
            <button key={type} onClick={() => toggleFilter(type)} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${activeFilters.includes(type) ? 'bg-blue-500/10 text-blue-500' : 'text-black/30 dark:text-white/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${activeFilters.includes(type) ? 'bg-blue-500' : 'bg-current opacity-20'}`} />
              <span className="text-[9px] font-orbitron font-black uppercase tracking-widest">{type}</span>
            </button>
          ))}
          <button onClick={() => setActiveFilters([])} className="flex items-center gap-3 px-4 py-2 text-black/20"><RotateCcw className="w-3 h-3" /><span className="text-[9px] font-orbitron font-black">RESET</span></button>
        </div>
      </div>

      {SafeComponent(RoomModal, {
        room: selectedRoom, onClose: handleCloseRoom,
        onUpdateRoomData: async (data) => {
          const updated = roomsWithMetadata.map(r => r.id === selectedRoom.id ? { ...r, directions: data.directions, image: data.image } : r);
          setRooms(updated); 
          await onSave(updated);
        }
      })}

      {SafeComponent(FacultyDirectoryModal, {
        isOpen: isFacultyModalOpen, onClose: () => setIsFacultyModalOpen(false), floorData, facultyList: allFaculty, isEditMode, onDeleteFaculty: handleDeleteFaculty,
        onSelectFaculty: (f) => { setSelectedFacultyProfile(f); setIsFacultyModalOpen(false); if (f.originalRoom) setHighlightedRoomId(f.originalRoom.id); }
      })}

      {SafeComponent(FacultyProfileModal, { faculty: selectedFacultyProfile, onClose: handleCloseFaculty })}
    </motion.div>
  )
}
