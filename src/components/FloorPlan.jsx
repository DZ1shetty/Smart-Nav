import { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Minus,
  Maximize,
  Edit3,
  XCircle,
  Users,
  RotateCcw,
  BookOpen,
  FlaskConical,
  Briefcase,
  Award,
  Wrench,
  Sparkles,
  Navigation,
  Compass,
  Locate,
  Bookmark,
  Map,
  Search,
} from 'lucide-react'
import { puter } from '@heyputer/puter.js'
import { floorsData, getFloorDataLoader } from '../data/floorsData'
import { searchIndex } from '../data/searchIndex'
import FloorMapSVG from './FloorMapSVG'
import FloorMapCanvas from './FloorMapCanvas'
import FloorMapSkeleton from './FloorMapSkeleton'
import ModalSkeleton from './ModalSkeleton'
import RoomModal from './RoomModal'
import ThemeToggle from './ThemeToggle'
import SearchSystem from './SearchSystem'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { useTheme } from '../context/ThemeContext'
import { Toaster, toast } from 'sonner'
import { getFirestoreDocName } from '../config'
import { getFloorFullNameInWords } from '../utils/floorFormatter'
import { trackFloorVisit, trackRoomView } from '../utils/analytics'
import { floorIdToUrl, urlToFloorId } from '../utils/slugHelpers'

const FacultyProfileModal = lazy(() => import('./FacultyProfileModal'))
const FacultyDirectoryModal = lazy(() => import('./FacultyDirectoryModal'))
const FacultyManagerModal = lazy(() => import('./FacultyManagerModal'))
const DirectionsManagerModal = lazy(() => import('./DirectionsManagerModal'))

/**
 * Case-insensitive name matching helper that handles prefix variations (Dr., Mr., Prof., etc.)
 * and ignores punctuation/extra spaces.
 */
export const isMatchingName = (nameA, nameB) => {
  if (!nameA || !nameB) return false
  const clean = (s) =>
    s
      .toLowerCase()
      .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
  const cleanA = clean(nameA)
  const cleanB = clean(nameB)
  if (cleanA === cleanB) return true

  const wordsA = cleanA.split(/\s+/)
  const wordsB = cleanB.split(/\s+/)

  if (wordsA.length === 1 || wordsB.length === 1) {
    return wordsA.includes(cleanB) || wordsB.includes(cleanA)
  }

  const [shorter, longer] =
    wordsA.length < wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA]
  return shorter.every((word) => longer.includes(word))
}

// --- DYNAMIC DEFAULT SYSTEM (STABLE + ERROR-FREE) ---

/**
 * STAGE 4: DATA STRUCTURE VALIDATION (CRITICAL)
 * Ensures we never save corrupt or partial data that could crash the app.
 */
const isValidLayout = (layout) => {
  if (!layout) return false
  const rooms = Array.isArray(layout) ? layout : layout.rooms || []
  return (
    Array.isArray(rooms) &&
    rooms.every(
      (room) =>
        room.id &&
        typeof (room.x ?? 0) === 'number' &&
        typeof (room.y ?? 0) === 'number'
    )
  )
}

const getFloorWord = (label) => {
  const l = label.toLowerCase()
  if (l.includes('basement')) return 'BASEMENT'
  if (l.includes('ground')) return 'GROUND'
  if (l.includes('1st') || l.includes('first')) return 'FIRST'
  if (l.includes('2nd') || l.includes('second')) return 'SECOND'
  if (l.includes('3rd') || l.includes('third')) return 'THIRD'
  if (l.includes('4th') || l.includes('fourth')) return 'FOURTH'
  if (l.includes('5th') || l.includes('fifth')) return 'FIFTH'
  if (l.includes('6th') || l.includes('sixth')) return 'SIXTH'
  return label.toUpperCase()
}

let isBlueprintModeGlobal = false

const calculateMapBounds = (vertices, roomsList, defaultWidth, defaultHeight) => {
  const w = defaultWidth || 640
  const h = defaultHeight || 663

  let minX = 0
  let maxX = w
  let minY = 0
  let maxY = h

  if (vertices.length > 0 || roomsList.length > 0) {
    const xs = [
      ...vertices.map(v => v.x),
      ...roomsList.map(r => r.x),
      ...roomsList.map(r => r.x + (r.w || r.width || 0))
    ].filter(x => x !== undefined && x !== null && !isNaN(x))

    const ys = [
      ...vertices.map(v => v.y),
      ...roomsList.map(r => r.y),
      ...roomsList.map(r => r.y + (r.h || r.height || 0))
    ].filter(y => y !== undefined && y !== null && !isNaN(y))

    if (xs.length > 0) {
      minX = Math.min(...xs) - 40
      maxX = Math.max(...xs) + 40
    }
    if (ys.length > 0) {
      minY = Math.min(...ys) - 40
      maxY = Math.max(...ys) + 40
    }
  }

  const svgW = maxX - minX
  const svgH = maxY - minY
  return { minX, minY, maxX, maxY, svgW, svgH }
}

export default function FloorPlan() {
  const { floorId: routeFloorId, buildingSlug, floorSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  const floorId = useMemo(() => {
    if (buildingSlug && floorSlug) {
      const resolved = urlToFloorId(buildingSlug, floorSlug)
      if (resolved) return resolved
    }
    return routeFloorId || 'ground'
  }, [buildingSlug, floorSlug, routeFloorId])

  useEffect(() => {
    if (routeFloorId && (!buildingSlug || !floorSlug)) {
      const targetUrl = floorIdToUrl(routeFloorId)
      navigate(`${targetUrl}${location.search}`, { replace: true })
    }
  }, [routeFloorId, buildingSlug, floorSlug, location.search, navigate])

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false)
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [facultyModalSearchTerm, setFacultyModalSearchTerm] = useState('')
  const [isFacultyManagerOpen, setIsFacultyManagerOpen] = useState(false)
  const [selectedFacultyProfile, setSelectedFacultyProfile] = useState(null)
  const [highlightedRoomId, setHighlightedRoomId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle', 'saving', 'saved'
  const [staticFloorData, setStaticFloorData] = useState(null)
  const [isLoadingStatic, setIsLoadingStatic] = useState(true)
  const [staticLoadError, setStaticLoadError] = useState(null)

  const [zoom, setZoom] = useState(1.0)
  const [resetKey, setResetKey] = useState(0)
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 })
  const [activeFilters, setActiveFilters] = useState([])
  const [activeSearchIds, setActiveSearchIds] = useState(null)
  const [isMobileFloorOpen, setIsMobileFloorOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const constraintsRef = useRef(null)
  const floorMenuRef = useRef(null)

  // Pinch-to-zoom refs
  const lastPinchDistRef = useRef(null)
  const isPinchingRef = useRef(false)
  const autoFittedFloor = useRef(null)

  const [isBlueprintMode, setIsBlueprintMode] = useState(isBlueprintModeGlobal)

  const toggleBlueprintMode = useCallback(() => {
    setIsBlueprintMode((prev) => {
      const nextMode = !prev
      isBlueprintModeGlobal = nextMode
      if (nextMode) {
        document.body.classList.add('blueprint-mode-active')
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
          }
        } catch (e) {
          console.warn('[Fullscreen API] requestFullscreen failed:', e)
        }
      } else {
        document.body.classList.remove('blueprint-mode-active')
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }
        } catch (e) {
          console.warn('[Fullscreen API] exitFullscreen failed:', e)
        }
      }
      return nextMode
    })
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsBlueprintMode(isCurrentlyFullscreen)
      isBlueprintModeGlobal = isCurrentlyFullscreen
      if (isCurrentlyFullscreen) {
        document.body.classList.add('blueprint-mode-active')
      } else {
        document.body.classList.remove('blueprint-mode-active')
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    if (isBlueprintModeGlobal) {
      document.body.classList.add('blueprint-mode-active')
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    return () => {
      setTimeout(() => {
        if (!window.location.pathname.startsWith('/floor/') && !window.location.pathname.includes('-Floor') && !window.location.pathname.includes('-Block')) {
          document.body.classList.remove('blueprint-mode-active')
          isBlueprintModeGlobal = false
        }
      }, 50)
    }
  }, [])



  const skipTransition = (() => {
    try {
      return localStorage.getItem('skip_mount_transition') === 'true'
    } catch {
      return false
    }
  })()

  const [rooms, setRooms] = useState([])
  const [faculty, setFaculty] = useState([]) // Dynamic faculty list
  const [bookmarkedRoomIds, setBookmarkedRoomIds] = useState([])
  const [rendererMode, setRendererMode] = useState('svg') // 'svg' | 'canvas'

  const handleToggleBookmark = async (roomId) => {
    let activeUsername = 'anonymous';
    try {
      const signedIn = await puter.auth.isSignedIn();
      if (signedIn) {
        const user = await puter.auth.getUser();
        activeUsername = user.username;
      }
    } catch (e) {
      console.warn('[Puter] Failed to get user status:', e);
    }
    
    let updated;
    const isCurrentlyBookmarked = bookmarkedRoomIds.includes(roomId);
    if (isCurrentlyBookmarked) {
      updated = bookmarkedRoomIds.filter(id => id !== roomId);
      toast.info('Bookmark removed.');
    } else {
      updated = [...bookmarkedRoomIds, roomId];
      toast.success('Room bookmarked!');
    }
    setBookmarkedRoomIds(updated);
    localStorage.setItem(`smart_nav_bookmarks_${activeUsername}`, JSON.stringify(updated));
    
    // 1. Save to Firestore permanently
    try {
      const bookmarkDocRef = doc(db, 'user_bookmarks', activeUsername);
      await setDoc(bookmarkDocRef, {
        username: activeUsername,
        bookmarks: updated,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore Bookmarks] Failed to sync to Firestore:', fsErr);
    }

    // 2. Local API server backup
    try {
      await fetch(`/api/bookmarks/${activeUsername}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });
    } catch (err) {
      console.warn('[Bookmarks API] Failed to toggle bookmark on server, kept in local cache:', err);
    }
  };

  useEffect(() => {
    // Check if a success toast was scheduled before a page reload (Vite HMR)
    try {
      const shouldShowSuccess = localStorage.getItem('show_save_success_toast')
      if (shouldShowSuccess === 'true') {
        toast.success('Successfully saved the blueprint!')
        localStorage.removeItem('show_save_success_toast')
      }
    } catch (e) {
      console.warn('[Toast Sync] Failed to read/clear success toast flag:', e)
    }

    try {
      localStorage.removeItem('skip_mount_transition')
    } catch (e) {}

    const loadBookmarks = async () => {
      let username = 'anonymous';
      try {
        const signedIn = await puter.auth.isSignedIn();
        if (signedIn) {
          const user = await puter.auth.getUser();
          username = user.username;
        }
      } catch (e) {
        console.warn('[Puter] Failed to get user status:', e);
      }
      
      // Try Firestore first for cloud persistence
      try {
        const bookmarkDocRef = doc(db, 'user_bookmarks', username);
        const bookmarkSnap = await getDoc(bookmarkDocRef);
        if (bookmarkSnap.exists() && Array.isArray(bookmarkSnap.data()?.bookmarks)) {
          const fsBookmarks = bookmarkSnap.data().bookmarks;
          setBookmarkedRoomIds(fsBookmarks);
          localStorage.setItem(`smart_nav_bookmarks_${username}`, JSON.stringify(fsBookmarks));
          return;
        }
      } catch (fsLoadErr) {
        console.warn('[Firestore Bookmarks] Failed to load from Firestore:', fsLoadErr);
      }

      try {
        const res = await fetch(`/api/bookmarks/${username}`);
        if (res.ok) {
          const data = await res.json();
          setBookmarkedRoomIds(data);
          localStorage.setItem(`smart_nav_bookmarks_${username}`, JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn('[Bookmarks] Failed to fetch from API, falling back to local storage:', err);
      }
      
      const local = localStorage.getItem(`smart_nav_bookmarks_${username}`);
      if (local) {
        try {
          setBookmarkedRoomIds(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    loadBookmarks();
  }, []);
  const [boundaryVertices, setBoundaryVertices] = useState([])
  const [alignmentGuides, setAlignmentGuides] = useState([])
  const [isEditMode, setIsEditMode] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [isLocked, setIsLocked] = useState(true)
  const [mapImage, setMapImage] = useState(null)
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false)
  const [mainWidth, setMainWidth] = useState(0)
  const [bulgeWidth, setBulgeWidth] = useState(0)
  const [bulgeHeight, setBulgeHeight] = useState(0)
  const [viewHeight, setViewHeight] = useState(0)
  const [viewWidth, setViewWidth] = useState(0)

  /**
   * STAGE 4: AUTO LOAD (CRITICAL FOR ALL USERS)
   * Firestore is now the SINGLE SOURCE OF TRUTH.
   * RESET -> Loads LAST SAVED from Firestore.
   */
  useEffect(() => {
    // Reset zoom to 100% (1.0) on floor change
    setZoom(1.0)
    
    // Reset loading state and errors
    setIsLoadingStatic(true)
    setStaticFloorData(null)
    setStaticLoadError(null)

    let isMounted = true
    let unsub = null

    const loadData = async () => {
      let resolvedStaticData = null
      try {
        const loader = getFloorDataLoader(floorId)
        if (loader) {
          resolvedStaticData = await loader()
          if (isMounted) {
            setStaticFloorData(resolvedStaticData)
          }
        } else {
          throw new Error(`Floor configuration not found for: ${floorId}`)
        }
      } catch (err) {
        console.error(`[Static Loader] Error loading static floor ${floorId}:`, err)
        if (isMounted) {
          setStaticLoadError(err)
        }
      } finally {
        if (isMounted) {
          setIsLoadingStatic(false)
        }
      }

      // Map floorId (e.g., 'fifth') to document name (e.g., 'Fifth-Floor')
      const docName = getFirestoreDocName(floorId)
      const docRef = doc(db, 'layouts', docName)

      console.log(`[Firestore] Subscribing to: ${docName}`)

      // OFFLINE CACHE FIRST: Try loading instantly from localStorage
      const cachedData = localStorage.getItem(`smart_nav_layout_${floorId}`)
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData)
          console.log(`[Offline Cache] Loaded layout from localStorage for ${floorId}`)
          if (isMounted) {
            if (data.rooms) setRooms(data.rooms)
            if (data.faculty) setFaculty(data.faculty)
            if (data.mapImage) setMapImage(data.mapImage)
            if (data.boundaryVertices) setBoundaryVertices(data.boundaryVertices)
            setMainWidth(data.mainWidth !== undefined ? data.mainWidth : resolvedStaticData?.mainWidth || 455)
            setBulgeWidth(data.bulgeWidth !== undefined ? data.bulgeWidth : resolvedStaticData?.bulgeWidth || 165)
            setBulgeHeight(data.bulgeHeight !== undefined ? data.bulgeHeight : resolvedStaticData?.bulgeHeight || 200)
            setViewHeight(data.viewHeight !== undefined ? data.viewHeight : resolvedStaticData?.viewHeight || 663)
            setViewWidth(data.viewWidth !== undefined ? data.viewWidth : resolvedStaticData?.viewWidth || 640)
            setIsLocked(data.locked !== false)
          }
        } catch (err) {
          console.error('[Offline Cache] Failed to parse localStorage cache:', err)
        }
      }

      unsub = onSnapshot(
        docRef,
        (snap) => {
          if (!isMounted) return
          if (snap.exists()) {
            const data = snap.data()
            console.log(`[Firestore] New data received for ${docName}:`, data)

            // Save to localStorage cache for offline/instant load support
            localStorage.setItem(`smart_nav_layout_${floorId}`, JSON.stringify(data))

            if (data.rooms) setRooms(data.rooms)
            if (data.faculty) setFaculty(data.faculty)
            if (data.mapImage) setMapImage(data.mapImage)
            if (data.boundaryVertices) {
              setBoundaryVertices(data.boundaryVertices)
            } else {
              setBoundaryVertices(resolvedStaticData?.boundaryVertices || [])
            }
            setMainWidth(data.mainWidth !== undefined ? data.mainWidth : resolvedStaticData?.mainWidth || 455)
            setBulgeWidth(data.bulgeWidth !== undefined ? data.bulgeWidth : resolvedStaticData?.bulgeWidth || 165)
            setBulgeHeight(data.bulgeHeight !== undefined ? data.bulgeHeight : resolvedStaticData?.bulgeHeight || 200)
            setViewHeight(data.viewHeight !== undefined ? data.viewHeight : resolvedStaticData?.viewHeight || 663)
            setViewWidth(data.viewWidth !== undefined ? data.viewWidth : resolvedStaticData?.viewWidth || 640)
            setIsLocked(data.locked !== false)
          } else {
            console.warn(
              `[Firestore] Document ${docName} does not exist. Falling back to static data.`
            )
            if (resolvedStaticData) {
              setRooms(resolvedStaticData.rooms || [])
              setFaculty(resolvedStaticData.faculty || [])
              setMapImage(resolvedStaticData.mapImage || null)
              setBoundaryVertices(resolvedStaticData.boundaryVertices || [])
              setMainWidth(resolvedStaticData.mainWidth || 455)
              setBulgeWidth(resolvedStaticData.bulgeWidth || 165)
              setBulgeHeight(resolvedStaticData.bulgeHeight || 200)
              setViewHeight(resolvedStaticData.viewHeight || 663)
              setViewWidth(resolvedStaticData.viewWidth || 640)
              setIsLocked(true)
            }
          }
        },
        (error) => {
          console.error('[Firestore] Snapshot error:', error)
          if (!isMounted) return
          if (!localStorage.getItem(`smart_nav_layout_${floorId}`)) {
            if (resolvedStaticData) {
              setRooms(resolvedStaticData.rooms || [])
              setFaculty(resolvedStaticData.faculty || [])
              setMapImage(resolvedStaticData.mapImage || null)
              setBoundaryVertices(resolvedStaticData.boundaryVertices || [])
              setMainWidth(resolvedStaticData.mainWidth || 455)
              setBulgeWidth(resolvedStaticData.bulgeWidth || 165)
              setBulgeHeight(resolvedStaticData.bulgeHeight || 200)
              setViewHeight(resolvedStaticData.viewHeight || 663)
              setViewWidth(resolvedStaticData.viewWidth || 640)
              setIsLocked(true)
            }
          }
        }
      )
    }

    loadData()

    return () => {
      isMounted = false
      if (unsub) unsub()
    }
  }, [floorId])

  useEffect(() => {
    const buildingName = searchIndex[floorId]?.buildingName || 'Unknown'
    trackFloorVisit(floorId, buildingName)
  }, [floorId])

  useEffect(() => {
    if (selectedRoom) {
      trackRoomView(selectedRoom.id, selectedRoom.name, floorId, searchIndex[floorId]?.buildingName)
    }
  }, [selectedRoom, floorId])


  // Clean rooms with basic metadata
  const roomsWithMetadata = useMemo(() => {
    return rooms // Already merged in useEffect
  }, [rooms])

  const currentMapBounds = useMemo(() => {
    return calculateMapBounds(boundaryVertices, roomsWithMetadata, viewWidth, viewHeight)
  }, [boundaryVertices, roomsWithMetadata, viewWidth, viewHeight])

  const [stableMapBounds, setStableMapBounds] = useState(null)

  useEffect(() => {
    if (!isEditMode) {
      setStableMapBounds(currentMapBounds)
    }
  }, [isEditMode, currentMapBounds])

  const mapBounds = useMemo(() => {
    if (isEditMode && stableMapBounds) {
      return stableMapBounds
    }
    return currentMapBounds
  }, [isEditMode, stableMapBounds, currentMapBounds])

  /**
   * STAGE 2: SAVE = OVERWRITE DEFAULT (CRITICAL)
   * Guaranteed overwrite to Firestore.
   */
  const onSave = async (roomsOverride = null, facultyOverride = null) => {
    const targetRooms =
      roomsOverride && Array.isArray(roomsOverride) ? roomsOverride : rooms
    const targetFaculty =
      facultyOverride && Array.isArray(facultyOverride)
        ? facultyOverride
        : faculty

    if (!isValidLayout(targetRooms)) {
      console.error('Invalid layout structure - Save aborted')
      toast.error('Error: Invalid room data detected.')
      return
    }

    setSaveStatus('saving')

    // STAGE 6: PIXEL-ACCURATE DATA PREPARATION
    const cleanRooms = targetRooms.map((room) => ({
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
      clickable: room.clickable !== false,
      linkToFloor: room.linkToFloor || null
    }))

    const savePromise = (async () => {
      const docName = getFirestoreDocName(floorId)
      const docRef = doc(db, 'layouts', docName)

      // OFFLINE CACHE: Instantly write to localStorage so offline loads are immediately updated
      const localLayoutData = {
        floorId,
        label:
          floorData.label ||
          (floorId.startsWith('cv_raman_')
            ? floorId.split('_').slice(2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ' Floor'
            : floorId.charAt(0).toUpperCase() + floorId.slice(1) + ' Floor'),
        buildingName: floorData.buildingName || 'APJ-BLOCK',
        rooms: cleanRooms,
        faculty: targetFaculty,
        mapImage,
        locked: true,
        lastEdited: new Date().toISOString(),
        boundaryVertices: boundaryVertices || [],
        mainWidth: mainWidth || null,
        bulgeWidth: bulgeWidth || null,
        bulgeHeight: bulgeHeight || null,
        viewHeight: viewHeight || null,
        viewWidth: viewWidth || null,
      }
      localStorage.setItem(`smart_nav_layout_${floorId}`, JSON.stringify(localLayoutData))

      // Set success toast flag in case of HMR page reload
      try {
        localStorage.setItem('show_save_success_toast', 'true')
        localStorage.setItem('skip_mount_transition', 'true')
      } catch (e) {
        console.warn(e)
      }

      // STAGE 2: FORBIDDEN: merge: true. Overwriting entire document.
      await setDoc(docRef, localLayoutData)

      // Sync to local server to update static files in codebase
      try {
        await fetch(`/api/layout/${floorId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localLayoutData),
        });
        console.log('[Local Sync] Successfully updated static files in codebase.');
      } catch (localErr) {
        console.warn('[Local Sync] Failed to update static files (server might be offline):', localErr);
      }


      // STAGE 7: SEPARATE DIRECTIONS COLLECTION (As requested)
      // "Saved under the firestore just like the layouts"
      const directionsRef = doc(db, 'directions', docName)
      const directionsData = {}
      cleanRooms.forEach((room) => {
        directionsData[room.id] = room.directions || ''
      })

      await setDoc(directionsRef, {
        floorId,
        directions: directionsData,
        lastUpdated: new Date().toISOString(),
      })
    })()

    toast.promise(savePromise, {
      loading: 'Saving blueprint changes to Firestore...',
      success: () => {
        setSaveStatus('idle')
        setIsEditMode(false)
        setIsLocked(true)
        try {
          localStorage.removeItem('show_save_success_toast')
          localStorage.removeItem('skip_mount_transition')
        } catch (e) {}
        return 'Successfully saved the blueprint!'
      },
      error: (err) => {
        setSaveStatus('idle')
        try {
          localStorage.removeItem('show_save_success_toast')
          localStorage.removeItem('skip_mount_transition')
        } catch (e) {}
        console.error('[Firestore] Save failed:', err)
        return `Failed to save blueprint: ${err.message || 'Firestore write error'}`
      },
    })
  }

  /**
   * STAGE 6: GLOBAL EXPORT (FOR DEVELOPERS)
   */

  const handleEditUnlock = async () => {
    try {
      await fetch(`/api/layout/${floorId}/unlock`, { method: 'PATCH' })
      setIsLocked(false)
      setIsEditMode(true)
      toast.info('Edit mode unlocked!')
    } catch (err) {
      setIsEditMode(true)
      setIsLocked(false)
      toast.info('Edit mode unlocked (local fallback)!')
    }
  }

  const handleRoomMove = (roomId, newX, newY) => {
    if (!isEditMode) return
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, x: newX, y: newY } : r))
    )
  }

  const handleRoomResize = (roomId, newW, newH) => {
    if (!isEditMode) return
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, w: newW, h: newH, width: newW, height: newH }
          : r
      )
    )
  }

  const handleBoundaryChange = (field, delta) => {
    if (!isEditMode) return
    const staticData = staticFloorData
    if (field === 'mainWidth') {
      setMainWidth((prev) => Math.max(100, (prev || staticData?.mainWidth || 455) + delta))
    } else if (field === 'bulgeWidth') {
      setBulgeWidth((prev) => Math.max(10, (prev || staticData?.bulgeWidth || 165) + delta))
    } else if (field === 'bulgeHeight') {
      setBulgeHeight((prev) => Math.max(10, (prev || staticData?.bulgeHeight || 200) + delta))
    } else if (field === 'viewHeight') {
      setViewHeight((prev) => Math.max(100, (prev || staticData?.viewHeight || 663) + delta))
    } else if (field === 'viewWidth') {
      setViewWidth((prev) => Math.max(100, (prev || staticData?.viewWidth || 640) + delta))
    }
  }

  const handleVertexMove = (index, newX, newY) => {
    if (!isEditMode) return

    const SNAP_THRESHOLD = 12 // pixels
    let snappedX = newX
    let snappedY = newY
    const newGuides = []

    // Compare with all other vertices
    boundaryVertices.forEach((v, idx) => {
      if (idx === index) return

      // Snap X (makes a vertical line)
      if (Math.abs(newX - v.x) <= SNAP_THRESHOLD) {
        snappedX = v.x
        newGuides.push({
          type: 'vertical',
          x: v.x,
          y1: Math.min(newY, v.y),
          y2: Math.max(newY, v.y),
          targetIndex: idx,
        })
      }

      // Snap Y (makes a horizontal line)
      if (Math.abs(newY - v.y) <= SNAP_THRESHOLD) {
        snappedY = v.y
        newGuides.push({
          type: 'horizontal',
          y: v.y,
          x1: Math.min(newX, v.x),
          x2: Math.max(newX, v.x),
          targetIndex: idx,
        })
      }
    })

    setAlignmentGuides(newGuides)

    setBoundaryVertices((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { x: snappedX, y: snappedY }
      }
      return updated
    })
  }

  const handleVertexAdd = (insertIndex, x, y) => {
    if (!isEditMode) return
    setBoundaryVertices((prev) => {
      const updated = [...prev]
      updated.splice(insertIndex, 0, { x, y })
      return updated
    })
    toast.success('New editing point added! Drag it to shape your outline.')
  }

  const handleVertexDelete = (index) => {
    if (!isEditMode) return
    if (boundaryVertices.length <= 3) {
      toast.error('A floor outline must have at least 3 points!')
      return
    }
    setBoundaryVertices((prev) => prev.filter((_, idx) => idx !== index))
    toast.success('Point removed.')
  }

  /**
   * STAGE 3: RESET = LOAD LAST SAVED (STRICT)
   * Fetches fresh from Firestore to override any local UI changes.
   */
  const handleResetDefault = async () => {
    if (!window.confirm('Reset this floor to the LAST SAVED Firestore state?'))
      return

    const docName = getFirestoreDocName(floorId)
    const docRef = doc(db, 'layouts', docName)

    try {
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        const data = snap.data()
        const staticData = staticFloorData
        setRooms(data.rooms || [])
        setFaculty(data.faculty || [])
        setMapImage(data.mapImage || null)
        setBoundaryVertices(data.boundaryVertices || [])
        setMainWidth(data.mainWidth !== undefined ? data.mainWidth : staticData?.mainWidth || 455)
        setBulgeWidth(data.bulgeWidth !== undefined ? data.bulgeWidth : staticData?.bulgeWidth || 165)
        setBulgeHeight(data.bulgeHeight !== undefined ? data.bulgeHeight : staticData?.bulgeHeight || 200)
        setViewHeight(data.viewHeight !== undefined ? data.viewHeight : staticData?.viewHeight || 663)
        setViewWidth(data.viewWidth !== undefined ? data.viewWidth : staticData?.viewWidth || 640)
        setIsLocked(true)
        toast.success('Layout reset to last saved state.')
      } else {
        toast.error('No saved layout found in Firestore for this floor.')
      }
    } catch (error) {
      console.error('[Firestore] Reset failed:', error)
      toast.error('Failed to reset layout from Firestore.')
    }
  }

  const handleDeleteFaculty = (facultyId) => {
    if (!window.confirm('Are you sure?')) return

    // Parse the original index from the ID structure: list-index-name
    const parts = facultyId.split('-')
    if (parts[0] === 'list') {
      const targetIndex = parseInt(parts[1], 10)
      if (!isNaN(targetIndex)) {
        setFaculty((prev) => prev.filter((_, idx) => idx !== targetIndex))
        return
      }
    }

    // Fallback: delete by matching name
    const targetName = parts.slice(2).join('-')
    setFaculty((prev) => prev.filter((f) => f.name !== targetName))
  }

  const handleMapImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setMapImage(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const floorData = {
    ...(staticFloorData || {}),
    floorId,
    rooms: roomsWithMetadata,
    faculty: faculty.length > 0 ? faculty : staticFloorData?.faculty || [],
    boundaryVertices,
    mapImage,
    mainWidth: mainWidth || staticFloorData?.mainWidth || 455,
    bulgeWidth: bulgeWidth || staticFloorData?.bulgeWidth || 165,
    bulgeHeight: bulgeHeight || staticFloorData?.bulgeHeight || 200,
    viewHeight: viewHeight || staticFloorData?.viewHeight || 663,
    viewWidth: viewWidth || staticFloorData?.viewWidth || 640,
    mapBounds,
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        floorMenuRef.current &&
        !floorMenuRef.current.contains(event.target)
      ) {
        setIsFloorMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isEditMode) return
      const svg = e.currentTarget.querySelector('svg')
      if (!svg) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse())
      setMouseCoords({ x: Math.round(svgPt.x), y: Math.round(svgPt.y) })
    },
    [isEditMode]
  )

  const allFaculty = useMemo(() => {
    try {
      if (!floorData) return []
      const rooms = floorData.rooms || []
      const facultyList = floorData.faculty || []

      const roomFaculty = rooms
        .filter(
          (room) => room.faculty && room.faculty !== 'N/A' && room.faculty !== ''
        )
        .filter(
          (room) =>
            !facultyList.some(
              (f) => f.roomId === room.id || f.name === room.faculty
            )
        )
        .map((room) => ({
          id: room.id,
          name: room.faculty,
          image: room.image,
          roomName: room.name,
          department: room.department,
          originalRoom: room,
          floorKey: floorId,
          description: room.description || '',
        }))

      const listFaculty = facultyList.map((f, idx) => {
        const room = rooms.find((r) => r.id === f.roomId)
        return {
          id: f.id || `list-${idx}-${f.name}`,
          name: f.name,
          image: f.image,
          roomName: room?.name || 'Staff Area',
          department: f.department || room?.department,
          originalRoom: room,
          floorKey: floorId,
          description: f.description || '',
        }
      })

      return [...roomFaculty, ...listFaculty]
    } catch (e) {
      console.error("Error generating allFaculty list in FloorPlan:", e)
      return []
    }
  }, [floorData, floorId, faculty])

  const findFacultyGlobally = (name) => {
    for (const [fKey, fData] of Object.entries(searchIndex)) {
      const roomMatch = fData.rooms?.find((r) => isMatchingName(r.faculty, name))
      if (roomMatch)
        return {
          id: roomMatch.id,
          name: roomMatch.faculty,
          image: roomMatch.image,
          roomName: roomMatch.name,
          department: roomMatch.department,
          originalRoom: roomMatch,
          floorKey: fKey,
          description: roomMatch.description || '',
        }
      const listMatch = fData.faculty?.find((f) => isMatchingName(f.name, name))
      if (listMatch) {
        const room = fData.rooms?.find((r) => r.id === listMatch.roomId)
        return {
          id: `list-${listMatch.name}`,
          name: listMatch.name,
          image: listMatch.image,
          roomName: room?.name || 'Staff Area',
          department: listMatch.department || room?.department,
          originalRoom: room,
          floorKey: fKey,
          description: listMatch.description || '',
        }
      }
    }
    return null
  }

  const toggleFilter = (type) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
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
      const room = floorData.rooms.find((r) => r.id === roomId)
      if (room) {
        if (highlightedRoomId !== room.id) {
          setHighlightedRoomId(room.id)
        }

        if (!facultyName) {
          if (selectedRoom?.id !== room.id) {
            setSelectedRoom(room)
          }
        }

        // If facultyName is present, "preview the faculty only" by filtering the map to just this room
        if (facultyName) {
          const isAlreadyActive =
            activeSearchIds &&
            activeSearchIds.length === 1 &&
            activeSearchIds[0] === room.id
          if (!isAlreadyActive) {
            setActiveSearchIds([room.id])
          }
        }
      }
    } else {
      if (selectedRoom) {
        setSelectedRoom(null)
      }
    }

    if (facultyName) {
      let faculty =
        allFaculty.find((f) => isMatchingName(f.name, facultyName)) ||
        findFacultyGlobally(facultyName)
      if (faculty && selectedFacultyProfile?.name !== faculty.name) {
        setSelectedFacultyProfile(faculty)
      }
    } else {
      if (selectedFacultyProfile) {
        setSelectedFacultyProfile(null)
      }
      if (activeSearchIds) {
        setActiveSearchIds(null) // Clear faculty-only filter when closing profile
      }
    }
  }, [location.search, floorData, allFaculty, selectedFacultyProfile, activeSearchIds, highlightedRoomId, selectedRoom])

  const handleZoom = (delta) =>
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 4))
  const resetView = () => {
    setZoom(1.0)
    setResetKey((prev) => prev + 1)
  }

  // ── Pinch-to-zoom: attach touch handlers to the map container ──────────────
  useEffect(() => {
    const el = constraintsRef.current
    if (!el) return
    const getPinchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true
        lastPinchDistRef.current = getPinchDist(e.touches)
      }
    }
    const onTouchMove = (e) => {
      if (!isPinchingRef.current || e.touches.length !== 2) return
      e.preventDefault()
      const newDist = getPinchDist(e.touches)
      if (!lastPinchDistRef.current) return
      const ratio = newDist / lastPinchDistRef.current
      lastPinchDistRef.current = newDist
      setZoom((prev) => Math.min(Math.max(prev * ratio, 0.5), 4))
    }
    const onTouchEnd = () => {
      isPinchingRef.current = false
      lastPinchDistRef.current = null
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, []) // constraintsRef is stable after mount

  // ── Ensure zoom is constantly 100% (1.0) on floor load ──────────────────────
  useEffect(() => {
    setZoom(1.0)
  }, [floorId])

  const isCvRaman  = floorId.startsWith('cv_raman_')
  const isRamanujan = floorId.startsWith('ramanujan_')
  const isSmv      = floorId.startsWith('smv_') || floorId.startsWith('svm_')
  const isAtal     = floorId.startsWith('atal_')
  const isRajraman = floorId.startsWith('rajraman_')

  const floors = isCvRaman
    ? [
        { id: 'cv_raman_basement', label: 'Basement Floor' },
        { id: 'cv_raman_ground', label: 'Ground Floor' },
        { id: 'cv_raman_first', label: '1st Floor' },
        { id: 'cv_raman_second', label: '2nd Floor' },
        { id: 'cv_raman_third', label: '3rd Floor' },
        { id: 'cv_raman_fourth', label: '4th Floor' },
        { id: 'cv_raman_fifth', label: '5th Floor' },
      ]
    : isRamanujan
    ? [
        { id: 'ramanujan_ground', label: 'Ground Floor' },
        { id: 'ramanujan_first', label: '1st Floor' },
        { id: 'ramanujan_second', label: '2nd Floor' },
        { id: 'ramanujan_third', label: '3rd Floor' },
        { id: 'ramanujan_fourth', label: '4th Floor' },
      ]
    : isSmv
    ? [
        { id: 'smv_ground', label: 'Ground Floor' },
        { id: 'smv_first', label: '1st Floor' },
        { id: 'smv_second', label: '2nd Floor' },
        { id: 'smv_third', label: '3rd Floor' },
        { id: 'smv_fourth', label: '4th Floor' },
        { id: 'smv_fifth', label: '5th Floor' },
        { id: 'smv_sixth', label: '6th Floor' },
      ]
    : isAtal
    ? [
        { id: 'atal_ground', label: 'Ground Floor' },
        { id: 'atal_first', label: '1st Floor' },
        { id: 'atal_second', label: '2nd Floor' },
        { id: 'atal_third', label: '3rd Floor' },
      ]
    : isRajraman
    ? [
        { id: 'rajraman_ground', label: 'Ground Floor' },
        { id: 'rajraman_first', label: '1st Floor' },
        { id: 'rajraman_second', label: '2nd Floor' },
        { id: 'rajraman_third', label: '3rd Floor' },
      ]
    : [
        { id: 'basement', label: 'Basement Floor' },
        { id: 'ground', label: 'Ground Floor' },
        { id: 'first', label: 'First Floor' },
        { id: 'second', label: 'Second Floor' },
        { id: 'third', label: 'Third Floor' },
        { id: 'fourth', label: 'Fourth Floor' },
        { id: 'fifth', label: 'Fifth Floor' },
      ]




  if (staticLoadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-mono p-6">
        <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <Edit3 className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-orbitron font-black tracking-wider text-lg uppercase text-yellow-500">
              Setup in Progress
            </h1>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              We are currently mapping this floor's coordinate layout. The interactive blueprints and search indicators will be available soon!
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-orbitron font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={skipTransition ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: skipTransition ? 0 : 0.25, ease: 'easeOut' }}
      className={`relative h-screen text-[var(--text-main)] flex flex-col items-center overflow-hidden select-none transition-colors duration-500 transform-gpu ${
        isBlueprintMode ? 'bg-black' : 'bg-[var(--bg-main)]'
      }`}
    >
      <Toaster theme={theme} richColors closeButton position="bottom-left" />
      <div className="absolute inset-0 blueprint-grid opacity-[0.05] pointer-events-none" />

      {!isBlueprintMode && (
        <>
        <header className="w-full z-40 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-2 px-3 md:py-2.5 md:px-8 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              const bSlug = 
                floorId?.startsWith('cv_raman_') ? 'CV-Raman-Block' :
                floorId?.startsWith('ramanujan_') ? 'Ramanujan-Block' :
                floorId?.startsWith('smv_') || floorId?.startsWith('svm_') ? 'SMV-Block' :
                floorId?.startsWith('atal_') ? 'Atal-Block' :
                floorId?.startsWith('rajraman_') ? 'Rajraman-Block' :
                'APJ-Block'
              navigate(`/${bSlug}`)
            }}
            className="p-2 md:p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all group active:scale-95 shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-black/50 dark:text-white/40 group-hover:text-blue-500 transition-colors" />
          </button>
          <div className="flex flex-col min-w-0">
            <nav className="hidden md:flex items-center gap-1.5 text-[9px] md:text-[10px] font-orbitron font-black uppercase tracking-[0.15em] text-black/40 dark:text-white/30">
              <Link to="/" className="hover:text-blue-500 transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link 
                to={`/${
                  floorId?.startsWith('cv_raman_') ? 'CV-Raman-Block' :
                  floorId?.startsWith('ramanujan_') ? 'Ramanujan-Block' :
                  floorId?.startsWith('smv_') || floorId?.startsWith('svm_') ? 'SMV-Block' :
                  floorId?.startsWith('atal_') ? 'Atal-Block' :
                  floorId?.startsWith('rajraman_') ? 'Rajraman-Block' :
                  'APJ-Block'
                }`}
                className="hover:text-blue-500 transition-colors"
              >
                {floorData?.buildingName || 'APJ-BLOCK'}
              </Link>
              <span>/</span>
              <span className="text-blue-500">{getFloorFullNameInWords(floorData?.label)}</span>
            </nav>
            <div className="relative mt-0.5">
              <span className="text-sm md:text-xl font-orbitron font-black uppercase tracking-tighter text-[var(--text-main)] truncate">
                {getFloorFullNameInWords(floorData?.label)}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 mx-4">
          <div className="max-w-[550px] w-full relative group">
            <SearchSystem currentFloor={floorId} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 md:min-w-[260px] justify-end">
          {/* Zoom & Recenter controls (Always visible in navbar) */}
          <div className="flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 md:p-1 rounded-xl shadow-sm">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-black/50 dark:text-white/40 hover:text-blue-500 transition-all active:scale-90"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10.5px] font-orbitron font-black text-blue-500 w-8 md:w-10 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-black/50 dark:text-white/40 hover:text-blue-500 transition-all active:scale-90"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
            <button
              onClick={resetView}
              className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all active:scale-90"
              title="Recenter Map"
            >
              <Locate className="w-3.5 h-3.5" />
            </button>
          </div>

          <AnimatePresence>
            {isEditMode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 p-1 rounded-xl"
              >
                <div className="flex items-center border-r border-black/10 dark:border-white/10 mr-1 pr-1 gap-1">
                  <button
                    onClick={() => setIsDirectionsModalOpen(true)}
                    className="px-2.5 py-1.5 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase"
                  >
                    DIRECTIONS
                  </button>
                  <button
                    onClick={() => setIsFacultyManagerOpen(true)}
                    className="px-2.5 py-1.5 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase"
                  >
                    FACULTY
                  </button>
                  <button
                    onClick={handleResetDefault}
                    className="px-2.5 py-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase"
                  >
                    RESET
                  </button>
                  <label className="px-2.5 py-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all font-orbitron font-black text-[8px] uppercase cursor-pointer">
                    UPLOAD{' '}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleMapImageUpload}
                    />
                  </label>
                </div>
                <button
                  onClick={() => onSave()}
                  disabled={saveStatus !== 'idle'}
                  className={`px-3 py-1.5 rounded-lg font-orbitron font-black text-[8.5px] uppercase tracking-widest ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-blue-500'} text-white`}
                >
                  {saveStatus === 'saving'
                    ? 'SAVING...'
                    : saveStatus === 'saved'
                      ? 'SAVED'
                      : 'SAVE'}
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(false)
                    setAlignmentGuides([])
                  }}
                  className="p-1.5 text-black/40 dark:text-white/30 hover:text-red-500"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
                <ThemeToggle />
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setFacultyModalSearchTerm('')
                    setIsFacultyModalOpen(true)
                  }}
                  className="relative group overflow-hidden p-2 md:p-2.5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 active:scale-95 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm"
                  title="Faculty Directory"
                >
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                </button>
                <button
                  onClick={handleEditUnlock}
                  className="hidden md:block p-2 md:p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all text-black/50 dark:text-white/40 hover:text-blue-500 active:scale-95 shadow-sm"
                  title="Edit Layout"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleBlueprintMode}
                  className="hidden md:block p-2 md:p-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 rounded-xl transition-all text-black/50 dark:text-white/40 hover:text-blue-500 active:scale-95 shadow-sm"
                  title="Blueprint Mode"
                >
                  <Map className="w-4 h-4" />
                </button>
                <ThemeToggle />
              </div>
            )}
          </AnimatePresence>
        </div>
        {/* Mobile search button — visible only on mobile, sits right of the zoom strip */}
        <button
          onClick={() => setIsMobileSearchOpen((p) => !p)}
          className={`md:hidden p-2 border rounded-xl transition-all active:scale-95 flex-shrink-0 ${
            isMobileSearchOpen
              ? 'bg-blue-500 border-blue-500 text-white shadow-md'
              : 'bg-black/[0.03] dark:bg-white/5 border-black/10 dark:border-white/10 text-black/50 dark:text-white/40 hover:text-blue-500'
          }`}
          title="Search rooms"
        >
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile search overlay — slides in below header */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden w-full z-30 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-3 py-2 shadow-lg origin-top"
          >
            <SearchSystem
              currentFloor={floorId}
              onResultsChange={(ids) => {
                setActiveSearchIds(ids)
                if (ids) setIsMobileSearchOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}

      <main
        className={`relative flex-1 w-full flex items-stretch justify-center overflow-hidden transition-all duration-500 ${isBlueprintMode ? 'p-0' : 'p-2 md:p-6'}`}
        ref={constraintsRef}
      >

        {/* Horizontal scrollable category filter chips (Google Maps style) */}
        {!selectedRoom && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-[96vw] overflow-x-auto no-scrollbar py-1 z-20 px-1">
            <div className="flex items-center gap-1 md:gap-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 p-1 md:p-1.5 rounded-lg md:rounded-xl shadow-xl mx-auto max-w-full overflow-x-auto no-scrollbar">
              
              {/* Mobile Floor Selector Chip (Triggers unclipped floating modal overlay) */}
              <div className="md:hidden flex-shrink-0">
                <button
                  onClick={() => setIsMobileFloorOpen(!isMobileFloorOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-orbitron font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap shadow-sm"
                >
                  <Map className="w-3 h-3 text-blue-500" />
                  <span>{getFloorWord(floorData?.label || 'FLOOR')}</span>
                  <ChevronDown className={`w-3 h-3 text-blue-500 transition-transform ${isMobileFloorOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Divider on mobile */}
              <div className="md:hidden h-3.5 w-px bg-black/10 dark:bg-white/10 flex-shrink-0 mx-0.5" />

              {[
                { type: 'classroom', label: 'Classrooms', icon: BookOpen },
                { type: 'lab', label: 'Labs', icon: FlaskConical },
                { type: 'hod', label: 'HOD Cabins', icon: Award },
                { type: 'staffroom', label: 'Staff Rooms', icon: Users },
                { type: 'office', label: 'Offices', icon: Briefcase },
                { type: 'hall', label: 'Seminar Halls', icon: Sparkles },
                { type: 'utility', label: 'Utilities', icon: Wrench },
                { type: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
              ].map((chip) => {
                const isActive = activeFilters.includes(chip.type)
                const Icon = chip.icon
                return (
                  <button
                    key={chip.type}
                    onClick={() => toggleFilter(chip.type)}
                    className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border text-[8.5px] md:text-[10.5px] font-orbitron font-black uppercase tracking-wider transition-all duration-300 active:scale-95 whitespace-nowrap
                      ${isActive 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/25 scale-102 font-black' 
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 text-black/70 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-blue-400 font-bold'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{chip.label}</span>
                  </button>
                )
              })}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9.5px] md:text-[10.5px] font-orbitron font-black uppercase tracking-wider transition-all duration-300 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Floor Selector Floating Overlay (Unclipped, Fixed position) */}
        <AnimatePresence>
          {isMobileFloorOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
                onClick={() => setIsMobileFloorOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-14 left-4 z-50 md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-1.5 w-36 max-h-[50vh] overflow-y-auto"
              >
                <div className="px-2 py-1 text-[8.5px] font-orbitron font-black text-black/40 dark:text-white/40 uppercase tracking-widest border-b border-black/5 dark:border-white/5 text-center">
                  Select Floor
                </div>
                {floors.slice().reverse().map((f) => {
                  const isActive = f.id === floorId
                  const floorWord = getFloorWord(f.label)
                  return (
                    <button
                      key={f.id}
                      onClick={(e) => {
                        e.preventDefault()
                        setIsMobileFloorOpen(false)
                        navigate(floorIdToUrl(f.id))
                        resetView()
                      }}
                      className={`w-full px-2.5 py-2 text-[9.5px] font-orbitron font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center text-center
                        ${isActive 
                          ? 'bg-blue-500 text-white font-black shadow-md shadow-blue-500/25' 
                          : 'bg-black/[0.03] dark:bg-white/5 text-black/70 dark:text-white/70 hover:text-blue-500 font-bold'
                        }`}
                    >
                      {floorWord}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative w-full h-full flex flex-col items-center justify-center p-1 md:p-2">
          {isLoadingStatic && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl">
              <FloorMapSkeleton />
            </div>
          )}
          {!rooms || rooms.length === 0 ? (
            <div className="text-white/40 font-orbitron text-lg flex flex-col items-center gap-3 animate-pulse">
              <span className="text-3xl">⚠</span>
              <span>NO LAYOUT AVAILABLE</span>
            </div>
          ) : (
            <motion.div
              key={`${floorId}-${resetKey}`}
              drag={!isEditMode}
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              dragMomentum={true}
              animate={
                selectedRoom
                  ? { scale: 0.9, opacity: 1 }
                  : { scale: zoom, opacity: 1 }
              }
              style={{
                aspectRatio: `${mapBounds.svgW}/${mapBounds.svgH}`,
                width: isBlueprintMode
                  ? `min(92vw, calc(82vh * (${mapBounds.svgW} / ${mapBounds.svgH})))`
                  : undefined,
                height: isBlueprintMode
                  ? `min(82vh, calc(92vw * (${mapBounds.svgH} / ${mapBounds.svgW})))`
                  : undefined,
              }}
              className={`relative floor-${floorId} bg-white dark:bg-[#121215] overflow-hidden transition-all duration-500 ${
                isBlueprintMode
                  ? 'border-2 border-blue-500/30 dark:border-blue-500/25 rounded-[20px] shadow-[0_0_60px_rgba(0,0,0,0.8)]'
                  : 'w-full h-full border border-black/10 dark:border-white/10 rounded-[16px] md:rounded-[24px] shadow-xl'
              }`}
              onMouseMove={handleMouseMove}
            >
              {rendererMode === 'canvas' ? (
                <FloorMapCanvas
                  floorData={floorData}
                  isEditMode={isEditMode}
                  selectedRoomId={selectedRoom?.id}
                  highlightedRoomId={highlightedRoomId}
                  activeSearchIds={activeSearchIds}
                  activeFilters={activeFilters}
                  bookmarkedRoomIds={bookmarkedRoomIds}
                  alignmentGuides={alignmentGuides}
                  onVertexDragEnd={() => setAlignmentGuides([])}
                  onRoomMove={handleRoomMove}
                  onRoomResize={handleRoomResize}
                  onBoundaryChange={handleBoundaryChange}
                  onVertexMove={handleVertexMove}
                  onVertexAdd={handleVertexAdd}
                  onVertexDelete={handleVertexDelete}
                  onRoomClick={(room) => {
                    if (room.clickable === false) return

                    const isAdminOffice = room.name
                      ?.toUpperCase()
                      .includes('PURCHASE')

                    if (room.type === 'staffroom' && !isAdminOffice) {
                      setFacultyModalSearchTerm(room.name || '')
                      setIsFacultyModalOpen(true)
                    } else {
                      navigate(`?room=${room.id}`)
                    }
                  }}
                />
              ) : (
                <FloorMapSVG
                  floorData={floorData}
                  isEditMode={isEditMode}
                  selectedRoomId={selectedRoom?.id}
                  highlightedRoomId={highlightedRoomId}
                  activeSearchIds={activeSearchIds}
                  activeFilters={activeFilters}
                  bookmarkedRoomIds={bookmarkedRoomIds}
                  alignmentGuides={alignmentGuides}
                  onVertexDragEnd={() => setAlignmentGuides([])}
                  onRoomMove={handleRoomMove}
                  onRoomResize={handleRoomResize}
                  onBoundaryChange={handleBoundaryChange}
                  onVertexMove={handleVertexMove}
                  onVertexAdd={handleVertexAdd}
                  onVertexDelete={handleVertexDelete}
                  onRoomClick={(room) => {
                    if (room.clickable === false) return

                    const isAdminOffice = room.name
                      ?.toUpperCase()
                      .includes('PURCHASE')

                    if (room.type === 'staffroom' && !isAdminOffice) {
                      setFacultyModalSearchTerm(room.name || '')
                      setIsFacultyModalOpen(true)
                    } else {
                      navigate(`?room=${room.id}`)
                    }
                  }}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Google Maps Style Floating Controls (Floor Switcher) */}
        <div
          className={`absolute top-3 left-3 md:top-5 md:left-5 z-30 transition-all duration-500 ${selectedRoom ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        >
          {/* Desktop Vertical Floor Switcher Stack (Desktop only) */}
          <div className="hidden md:flex bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 p-2 rounded-2xl shadow-xl flex-col gap-1.5 items-center w-28 md:w-32">
            <span className="text-[9px] md:text-[9.5px] font-orbitron font-black text-black/50 dark:text-white/40 uppercase tracking-wider pb-1 border-b border-black/10 dark:border-white/10 w-full text-center select-none">
              Floor Select
            </span>
            {floors.slice().reverse().map((f) => {
              const isActive = f.id === floorId
              const floorWord = getFloorWord(f.label)
              return (
                <button
                  key={f.id}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(floorIdToUrl(f.id))
                    resetView()
                  }}
                  className={`w-full px-2.5 py-1.5 text-[9.5px] md:text-[10.5px] font-orbitron font-black uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center text-center
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-102 font-black' 
                      : 'bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/60 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-black/10 dark:hover:bg-white/10 font-bold'
                    }`}
                >
                  {floorWord}
                </button>
              )
            })}
          </div>
        </div>

        {isBlueprintMode && (
          <>
            {/* Floating Exit Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={toggleBlueprintMode}
              className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/85 dark:bg-black/70 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full shadow-2xl text-[10px] font-orbitron font-black uppercase tracking-wider text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95 duration-300"
            >
              <XCircle className="w-4 h-4" />
              <span>Exit Blueprint Mode</span>
            </motion.button>

            {/* Floating Zoom & Recenter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 right-6 z-50 flex items-center gap-1 bg-white/85 dark:bg-black/70 backdrop-blur-xl border border-black/10 dark:border-white/10 p-1.5 rounded-2xl shadow-2xl"
            >
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-black/40 dark:text-white/30 hover:text-blue-500 transition-all active:scale-90"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-orbitron font-black text-blue-500 w-12 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.25)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-black/40 dark:text-white/30 hover:text-blue-500 transition-all active:scale-90"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1.5" />
              <button
                onClick={resetView}
                className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all active:scale-90"
                title="Recenter Map"
              >
                <Locate className="w-4 h-4" />
              </button>
              <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1.5" />
              <button
                onClick={() => setRendererMode((prev) => (prev === 'svg' ? 'canvas' : 'svg'))}
                className="px-2.5 py-1 text-[9px] font-orbitron font-black bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all active:scale-90 uppercase tracking-wider"
                title="Toggle Map Engine (SVG vs Canvas)"
              >
                ENGINE: {rendererMode.toUpperCase()}
              </button>
            </motion.div>
          </>
        )}



        {isEditMode && (
          <div className="absolute top-2 right-8 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-lg font-mono text-blue-400 z-50 shadow-2xl border-blue-500/30">
            <span className="opacity-40 mr-2">POS</span> X: {mouseCoords.x}{' '}
            <span className="opacity-20 mx-2">|</span> Y: {mouseCoords.y}
          </div>
        )}
      </main>


      <AnimatePresence>
        {selectedRoom && (
          <RoomModal
            room={selectedRoom}
            onClose={handleCloseRoom}
            isBookmarked={bookmarkedRoomIds.includes(selectedRoom.id)}
            onToggleBookmark={() => handleToggleBookmark(selectedRoom.id)}
            onUpdateRoomData={async (data) => {
              const updated = roomsWithMetadata.map((r) =>
                r.id === selectedRoom.id
                  ? { ...r, directions: data.directions, image: data.image }
                  : r
              )
              setRooms(updated)
              await onSave(updated)
            }}
          />
        )}
      </AnimatePresence>

      <Suspense fallback={<ModalSkeleton />}>
        <AnimatePresence>
          {isFacultyModalOpen && (
            <FacultyDirectoryModal
              isOpen={isFacultyModalOpen}
              onClose={() => setIsFacultyModalOpen(false)}
              initialSearch={facultyModalSearchTerm}
              floorData={floorData}
              facultyList={allFaculty}
              isEditMode={isEditMode}
              onDeleteFaculty={handleDeleteFaculty}
              onSelectFaculty={(f) => {
                setIsFacultyModalOpen(false)
                if (f.originalRoom) {
                  navigate(`?room=${f.originalRoom.id}&faculty=${encodeURIComponent(f.name)}`)
                } else {
                  navigate(`?faculty=${encodeURIComponent(f.name)}`)
                }
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedFacultyProfile && (
            <FacultyProfileModal
              faculty={selectedFacultyProfile}
              onClose={handleCloseFaculty}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDirectionsModalOpen && (
            <DirectionsManagerModal
              isOpen={isDirectionsModalOpen}
              onClose={() => setIsDirectionsModalOpen(false)}
              rooms={rooms}
              onSave={async (updatedRooms) => {
                setRooms(updatedRooms)
                await onSave(updatedRooms)
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFacultyManagerOpen && (
            <FacultyManagerModal
              isOpen={isFacultyManagerOpen}
              onClose={() => setIsFacultyManagerOpen(false)}
              facultyList={allFaculty}
              onSave={async (updatedFaculty) => {
                setFaculty(updatedFaculty)
                await onSave(null, updatedFaculty)
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </motion.div>
  )
}
