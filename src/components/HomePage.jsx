import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users,
  FlaskConical,
  Map,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  Edit3,
  Save,
  X,
  Image,
  Loader2,
  Upload,
  Trash2,
  Link as LinkIcon
} from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Toaster, toast } from 'sonner'
import SearchSystem from './SearchSystem'
import ThemeToggle from './ThemeToggle'
import { floorIdToUrl } from '../utils/slugHelpers'
import BuildingBentoGrid from './BuildingBentoGrid'

const buildingSlugMap = {
  'apj': 'apj',
  'apj-block': 'apj',
  'cv-raman': 'cv-raman',
  'cv-raman-block': 'cv-raman',
  'cv_raman': 'cv-raman',
  'ramanujan': 'ramanujan',
  'ramanujan-block': 'ramanujan',
  'smv': 'smv',
  'smv-block': 'smv',
  'svm': 'smv',
  'svm-block': 'smv',
  'atal': 'atal',
  'atal-block': 'atal',
  'rajraman': 'rajraman',
  'rajraman-block': 'rajraman',
  'v-rajraman': 'rajraman',
  'v-rajraman-block': 'rajraman',
  'v.-rajraman-block': 'rajraman'
}

const buildingKeyToUrlSlug = {
  'apj': 'APJ-Block',
  'cv-raman': 'CV-Raman-Block',
  'ramanujan': 'Ramanujan-Block',
  'smv': 'SMV-Block',
  'atal': 'Atal-Block',
  'rajraman': 'Rajraman-Block'
}

const getBuildingKeyFromSlug = (slug) => {
  if (!slug) return null
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  return buildingSlugMap[normalized] || buildingSlugMap[slug.toLowerCase()] || null
}

const apjFloors = [
  { id: 'basement', label: 'BASEMENT FLOOR' },
  { id: 'ground', label: 'GROUND FLOOR' },
  { id: 'first', label: 'FIRST FLOOR' },
  { id: 'second', label: 'SECOND FLOOR' },
  { id: 'third', label: 'THIRD FLOOR' },
  { id: 'fourth', label: 'FOURTH FLOOR' },
  { id: 'fifth', label: 'FIFTH FLOOR' },
]

const cvRamanFloors = [
  { id: 'cv_raman_basement', label: 'BASEMENT FLOOR' },
  { id: 'cv_raman_ground', label: 'GROUND FLOOR' },
  { id: 'cv_raman_first', label: 'FIRST FLOOR' },
  { id: 'cv_raman_second', label: 'SECOND FLOOR' },
  { id: 'cv_raman_third', label: 'THIRD FLOOR' },
  { id: 'cv_raman_fourth', label: 'FOURTH FLOOR' },
  { id: 'cv_raman_fifth', label: 'FIFTH FLOOR' },
]

const ramanujanFloors = [
  { id: 'ramanujan_ground', label: 'GROUND FLOOR' },
  { id: 'ramanujan_first', label: 'FIRST FLOOR' },
  { id: 'ramanujan_second', label: 'SECOND FLOOR' },
  { id: 'ramanujan_third', label: 'THIRD FLOOR' },
  { id: 'ramanujan_fourth', label: 'FOURTH FLOOR' },
]

const smvFloors = [
  { id: 'smv_ground', label: 'GROUND FLOOR' },
  { id: 'smv_first', label: 'FIRST FLOOR' },
  { id: 'smv_second', label: 'SECOND FLOOR' },
  { id: 'smv_third', label: 'THIRD FLOOR' },
  { id: 'smv_fourth', label: 'FOURTH FLOOR' },
  { id: 'smv_fifth', label: 'FIFTH FLOOR' },
  { id: 'smv_sixth', label: 'SIXTH FLOOR' },
]

const atalFloors = [
  { id: 'atal_ground', label: 'GROUND FLOOR' },
  { id: 'atal_first', label: 'FIRST FLOOR' },
  { id: 'atal_second', label: 'SECOND FLOOR' },
  { id: 'atal_third', label: 'THIRD FLOOR' },
]

const rajramanFloors = [
  { id: 'rajraman_ground', label: 'GROUND FLOOR' },
  { id: 'rajraman_first', label: 'FIRST FLOOR' },
  { id: 'rajraman_second', label: 'SECOND FLOOR' },
  { id: 'rajraman_third', label: 'THIRD FLOOR' },
]

const buildingThemes = {
  'apj': {
    name: 'APJ-BLOCK',
    floors: '7 FLOORS',
    primary: 'blue',
    colorClass: 'text-blue-500',
    borderClass: 'border-blue-500',
    hoverBorderClass: 'hover:border-blue-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    bgClass: 'bg-blue-500/10',
    gradient: 'from-blue-500/0 via-blue-500/[0.04] to-blue-500/0',
    btnBg: 'bg-blue-500 hover:bg-blue-600',
    btnShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    focusRing: 'focus:border-blue-500 focus:ring-blue-500/30',
    iconColor: 'text-blue-500',
    tintBg: 'bg-blue-500/5'
  },
  'cv-raman': {
    name: 'CV-RAMAN BLOCK',
    floors: '7 FLOORS',
    primary: 'emerald',
    colorClass: 'text-emerald-500',
    borderClass: 'border-emerald-500',
    hoverBorderClass: 'hover:border-emerald-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    bgClass: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/0 via-emerald-500/[0.04] to-emerald-500/0',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600',
    btnShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    focusRing: 'focus:border-emerald-500 focus:ring-emerald-500/30',
    iconColor: 'text-emerald-500',
    tintBg: 'bg-emerald-500/5'
  },
  'ramanujan': {
    name: 'RAMANUJAN BLOCK',
    floors: '5 FLOORS',
    primary: 'purple',
    colorClass: 'text-purple-500',
    borderClass: 'border-purple-500',
    hoverBorderClass: 'hover:border-purple-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    bgClass: 'bg-purple-500/10',
    gradient: 'from-purple-500/0 via-purple-500/[0.04] to-purple-500/0',
    btnBg: 'bg-purple-500 hover:bg-purple-600',
    btnShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    focusRing: 'focus:border-purple-500 focus:ring-purple-500/30',
    iconColor: 'text-purple-500',
    tintBg: 'bg-purple-500/5'
  },
  'smv': {
    name: 'SMV BLOCK',
    floors: '7 FLOORS',
    primary: 'amber',
    colorClass: 'text-amber-500',
    borderClass: 'border-amber-500',
    hoverBorderClass: 'hover:border-amber-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    bgClass: 'bg-amber-500/10',
    gradient: 'from-amber-500/0 via-amber-500/[0.04] to-amber-500/0',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
    btnShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    focusRing: 'focus:border-amber-500 focus:ring-amber-500/30',
    iconColor: 'text-amber-500',
    tintBg: 'bg-amber-500/5'
  },
  'atal': {
    name: 'ATAL BLOCK',
    floors: '4 FLOORS',
    primary: 'rose',
    colorClass: 'text-rose-500',
    borderClass: 'border-rose-500',
    hoverBorderClass: 'hover:border-rose-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    bgClass: 'bg-rose-500/10',
    gradient: 'from-rose-500/0 via-rose-500/[0.04] to-rose-500/0',
    btnBg: 'bg-rose-500 hover:bg-rose-600',
    btnShadow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    focusRing: 'focus:border-rose-500 focus:ring-rose-500/30',
    iconColor: 'text-rose-500',
    tintBg: 'bg-rose-500/5'
  },
  'rajraman': {
    name: 'V . RAJRAMAN-BLOCK',
    floors: '4 FLOORS',
    primary: 'cyan',
    colorClass: 'text-cyan-500',
    borderClass: 'border-cyan-500',
    hoverBorderClass: 'hover:border-cyan-500',
    shadowClass: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    bgClass: 'bg-cyan-500/10',
    gradient: 'from-cyan-500/0 via-cyan-500/[0.04] to-cyan-500/0',
    btnBg: 'bg-cyan-500 hover:bg-cyan-600',
    btnShadow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    focusRing: 'focus:border-cyan-500 focus:ring-cyan-500/30',
    iconColor: 'text-cyan-500',
    tintBg: 'bg-cyan-500/5'
  }
}

const defaultBuildingDetails = {
  'apj': {
    name: 'APJ-BLOCK',
    imageUrl: '',
    description: 'Hosting primary computer laboratories, advanced research facilities, and core department rooms. It features a modern structural layout with state-of-the-art academic spaces.',
    entranceDetails: 'APJ Block main entrance is located on the ground floor. Use the central staircase or elevator for quick floor access.',
    labDetails: "Most BTL labs are situated on the 3rd and 4th floors. Follow the 'BTL' signs from the elevator lobby.",
    staffDetails: 'Department staff rooms are distributed across all floors. Search by faculty name for precise office directions.'
  },
  'cv-raman': {
    name: 'CV-RAMAN BLOCK',
    imageUrl: '',
    description: 'Focused on natural and applied sciences, housing specialized physics and chemistry laboratories, research cabins, and spacious lecture halls.',
    entranceDetails: 'CV Raman Block main entrance leads to a spacious lobby on the ground floor. Direct access to science and research labs.',
    labDetails: 'Equipped with advanced Physics, Chemistry, and specialized research labs primarily situated across the lower floors.',
    staffDetails: 'Faculty offices and research guide cabins are located on the upper levels. Search by staff name for precise routing.'
  },
  'ramanujan': {
    name: 'RAMANUJAN BLOCK',
    imageUrl: '',
    description: 'Home to the main seminar hall, recruitment cells, placement offices, and mathematical sciences division.',
    entranceDetails: 'Ramanujan Block entrance is on the Ground Floor. Features a central lobby, seminar hall, guest room, and placement office routes.',
    labDetails: 'Ground floor features placement interview cubicles and academic rooms. Upper level labs are in setup.',
    staffDetails: 'LH003 Department Office and Purchase & C.G.P. Room are mapped on the Ground floor. Upper level offices are in progress.'
  },
  'smv': {
    name: 'SMV BLOCK',
    imageUrl: '',
    description: 'The engineering powerhouse of the campus, featuring multiple workshops, electronics/electrical testing labs, and high-performance computation centers across 7 levels.',
    entranceDetails: 'SMV Block features multiple entrances on the ground floor. It serves as the main engineering hub with easy stairs/lift access.',
    labDetails: 'Features mechanical workshops, computer labs, and specialized engineering facilities distributed from the ground to the 6th floor.',
    staffDetails: 'Engineering department staff rooms and HOD cabins are mapped across multiple floors. Use the search tool to find staff.'
  },
  'atal': {
    name: 'ATAL BLOCK',
    imageUrl: '',
    description: 'Designed for innovation and incubation, featuring startup incubation spaces, incubation centers, and advanced learning halls.',
    entranceDetails: 'Atal Block ground floor entrance lobby connects directly to modern incubation zones and research labs.',
    labDetails: 'Houses the Autoliv Incubation Centre and engineering research hubs on the ground floor, and advanced training labs on upper floors.',
    staffDetails: 'Research faculty offices and incubation project cabins are situated on the 1st and 2nd floors. Mapped for easy directions.'
  },
  'rajraman': {
    name: 'V . RAJRAMAN-BLOCK',
    imageUrl: '',
    description: 'The latest block addition dedicated to cutting-edge information technology, data centers, and advanced study zones.',
    entranceDetails: 'V . Rajraman-Block layout setup is in progress. Entrance pathways and lobby will be mapped shortly.',
    labDetails: 'Laboratory and workshop configurations for V . Rajraman-Block are currently being set up.',
    staffDetails: 'Staff rooms and faculty offices for V . Rajraman-Block will be configured and linked to Firestore as data is added.'
  }
}

const BuildingPlaceholder = ({ themeColor }) => {
  const strokeColor = 
    themeColor === 'emerald' ? '#10b981' :
    themeColor === 'purple' ? '#a855f7' :
    themeColor === 'amber' ? '#f59e0b' :
    themeColor === 'rose' ? '#f43f5e' :
    themeColor === 'cyan' ? '#06b6d4' :
    '#3b82f6';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/[0.04] dark:bg-white/[0.01] p-6 text-center select-none relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none blueprint-grid" />
      <div className="absolute w-48 h-48 rounded-full border border-dashed opacity-10 animate-spin" style={{ borderColor: strokeColor, animationDuration: '20s' }} />

      <svg
        className="w-14 h-14 md:w-16 md:h-16 mb-4 relative z-10"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="45" stroke={`${strokeColor}10`} strokeWidth="0.5" />
        <line x1="50" y1="5" x2="50" y2="95" stroke={`${strokeColor}15`} strokeWidth="0.5" className="origin-center animate-spin" style={{ animationDuration: '6s' }} />
        
        <path d="M50 85 L80 70 L50 55 L20 70 Z" stroke={strokeColor} strokeWidth="0.8" strokeLinejoin="round" opacity="0.3" />
        
        <path d="M20 70 L20 40" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
        <path d="M80 70 L80 40" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
        <path d="M50 85 L50 55" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
        
        <path d="M50 55 L80 40 L50 25 L20 40 Z" stroke={strokeColor} strokeWidth="0.8" strokeLinejoin="round" />
        
        <path d="M35 40 L35 20 L50 12 L65 20 L65 40" stroke={strokeColor} strokeWidth="0.8" opacity="0.7" />
        <path d="M50 25 L50 12" stroke={strokeColor} strokeWidth="1" />
        
        <circle cx="50" cy="12" r="1.5" fill={strokeColor} className="animate-ping" />
        <circle cx="50" cy="12" r="1" fill={strokeColor} />
      </svg>
      <span className="text-[9px] uppercase font-orbitron font-black tracking-[0.25em] opacity-30 relative z-10">
        Structure Preview
      </span>
    </div>
  );
};

export default function HomePage() {
  const { buildingId } = useParams()
  const navigate = useNavigate()

  const selectedBuilding = getBuildingKeyFromSlug(buildingId)
  const [buildingData, setBuildingData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedData, setEditedData] = useState(null)

  const handleSelectBuilding = (key) => {
    const slug = buildingKeyToUrlSlug[key] || key
    navigate(`/${slug}`)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  useEffect(() => {
    if (!selectedBuilding) {
      setBuildingData(null)
      setIsEditing(false)
      return
    }

    const fetchBuildingData = async () => {
      setIsLoading(true)
      try {
        const docRef = doc(db, 'buildings', selectedBuilding)
        const docSnap = await getDoc(docRef)
        
        const defaultData = defaultBuildingDetails[selectedBuilding] || defaultBuildingDetails['apj']
        if (docSnap.exists()) {
          setBuildingData({ ...defaultData, ...docSnap.data() })
        } else {
          setBuildingData(defaultData)
        }
      } catch (err) {
        console.error('Error fetching building details:', err)
        setBuildingData(defaultBuildingDetails[selectedBuilding] || defaultBuildingDetails['apj'])
        toast.error('Failed to load building details from cloud. Using local defaults.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBuildingData()
  }, [selectedBuilding])

  const handleStartEdit = () => {
    setEditedData({ ...buildingData })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedData(null)
  }

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2.5 * 1024 * 1024) {
      toast.error('Image size must be under 2.5MB for Firestore saving.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setEditedData((prev) => ({ ...prev, imageUrl: event.target.result }))
      toast.success('Image loaded! Click SAVE to save permanently to Firestore.')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveBuilding = async () => {
    if (!editedData) return

    const savePromise = (async () => {
      const docRef = doc(db, 'buildings', selectedBuilding)
      const dataToSave = {
        name: editedData.name || defaultBuildingDetails[selectedBuilding]?.name || '',
        imageUrl: editedData.imageUrl || '',
        description: editedData.description || '',
        entranceDetails: editedData.entranceDetails || '',
        labDetails: editedData.labDetails || '',
        staffDetails: editedData.staffDetails || '',
        lastEdited: new Date().toISOString()
      }
      await setDoc(docRef, dataToSave, { merge: true })
      setBuildingData(dataToSave)
      setIsEditing(false)
    })()

    toast.promise(savePromise, {
      loading: 'Saving building details permanently to Firestore...',
      success: 'Building image & details saved permanently to Firestore!',
      error: (err) => `Failed to save details: ${err.message || 'Firestore error'}`
    })
  }

  const theme = selectedBuilding ? (buildingThemes[selectedBuilding] || buildingThemes['apj']) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative min-h-screen lg:h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] font-space p-2 md:p-3 lg:p-4 lg:py-3 flex flex-col items-center justify-between overflow-y-auto lg:overflow-hidden selection:bg-blue-500/30 transform-gpu"
    >
      <Toaster richColors position="top-right" />
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]">
        <div className="absolute inset-0 blueprint-grid" />
      </div>

      {/* SCANLINE OVERLAY - Only visible in dark mode for tactical feel */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-0 dark:opacity-20" />

      {/* THEME TOGGLE + ADMIN (Local to HomePage) */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* HEADER SECTION */}
      <header className="relative z-30 flex flex-col items-center gap-1.5 mb-1.5 md:mb-2 flex-shrink-0 w-full max-w-4xl pt-1">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg md:text-xl lg:text-2xl font-orbitron font-black tracking-tighter leading-none text-center"
        >
          SMART{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500">
            NAVIGATION
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-xl"
        >
          <SearchSystem />
        </motion.div>
      </header>

      {/* MAIN NAVIGATION GRID */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-5xl py-0.5">
        <AnimatePresence mode="wait">
          {!selectedBuilding ? (
            <motion.div
              key="building-selector"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full max-w-5xl mx-auto py-0.5"
            >
              <BuildingBentoGrid onSelectBuilding={handleSelectBuilding} />
            </motion.div>

          ) : (
            <motion.div
              key="floor-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full py-4 relative flex flex-col justify-start"
            >
              {/* Background glow matching the active theme */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-2xl opacity-[0.06] dark:opacity-[0.05] pointer-events-none transition-all duration-700 ease-in-out z-0"
                style={{
                  background: `radial-gradient(circle, ${
                    theme.primary === 'emerald' ? '#10b981' :
                    theme.primary === 'purple' ? '#a855f7' :
                    theme.primary === 'amber' ? '#f59e0b' :
                    theme.primary === 'rose' ? '#f43f5e' :
                    theme.primary === 'cyan' ? '#06b6d4' :
                    '#3b82f6'
                  } 0%, transparent 70%)`
                }}
              />

              <div className="flex items-center justify-between mb-4 flex-shrink-0 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={handleBackToHome}
                    className={`group p-2 md:p-2.5 bg-black/[0.03] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl transition-all active:scale-95
                      hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 shadow-sm`}
                  >
                    <ChevronLeft className={`w-4 h-4 text-[var(--text-main)] transition-colors group-hover:${theme.colorClass}`} />
                  </button>
                  <div className="flex items-baseline gap-2.5">
                    <h3 className={`text-base md:text-lg lg:text-xl font-orbitron font-black tracking-tighter uppercase leading-none ${theme.colorClass}`}>
                      {theme.name}
                    </h3>
                    <span className="text-[10px] md:text-xs font-orbitron font-bold tracking-widest text-black/40 dark:text-white/30 uppercase">
                      {theme.floors}
                    </span>
                  </div>
                </div>

                {buildingData && (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-orbitron font-bold uppercase tracking-wider flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-black/60 dark:text-white/60 active:scale-95"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveBuilding}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-orbitron font-black uppercase tracking-wider flex items-center gap-1 text-white ${theme.btnBg} ${theme.btnShadow} transition-all active:scale-95`}
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleStartEdit}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-orbitron font-black uppercase tracking-wider flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-black/60 dark:text-white/60 hover:text-blue-500 active:scale-95 shadow-sm"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Info
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] relative z-10">
                  <Loader2 className={`w-6 h-6 animate-spin ${theme.colorClass} mb-2`} />
                  <span className="text-[9px] uppercase font-orbitron font-bold tracking-widest opacity-40">
                    Retrieving building data...
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
                    
                    {/* Left Column: Image & Description */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      
                      {/* Image Card */}
                      <div className="relative rounded-xl md:rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-black/[0.02] dark:bg-white/[0.01] aspect-[21/9] max-h-[130px] md:max-h-[150px] min-h-[110px] group transition-all duration-500 shadow-md">
                        {isEditing ? (
                          <div className="w-full h-full relative">
                            {editedData?.imageUrl ? (
                              <img
                                src={editedData.imageUrl}
                                alt={buildingData?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentNode;
                                  if (parent) {
                                    const fallbackDiv = parent.querySelector('.url-fallback');
                                    if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : (
                              <BuildingPlaceholder themeColor={theme.primary} />
                            )}
                            <div
                              className="url-fallback w-full h-full hidden items-center justify-center bg-black/20 text-[11px] font-mono text-rose-500 p-2 text-center absolute inset-0"
                            >
                              <BuildingPlaceholder themeColor={theme.primary} />
                            </div>
                          </div>
                        ) : (
                          buildingData?.imageUrl ? (
                            <img
                              src={buildingData.imageUrl}
                              alt={buildingData.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const parent = e.target.parentNode;
                                if (parent) {
                                  const fallbackDiv = parent.querySelector('.view-fallback');
                                  if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                }
                              }}
                            />
                          ) : (
                            <BuildingPlaceholder themeColor={theme.primary} />
                          )
                        )}
                        
                        <div className="view-fallback w-full h-full hidden absolute inset-0">
                          <BuildingPlaceholder themeColor={theme.primary} />
                        </div>
                      </div>

                      {/* Image Edit Controls when isEditing is true */}
                      {isEditing && (
                        <div className="flex flex-col gap-2 p-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-orbitron font-black uppercase tracking-wider text-blue-500 dark:text-cyan-400 flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              Building Image
                            </span>
                            {editedData?.imageUrl && (
                              <button
                                type="button"
                                onClick={() => setEditedData({ ...editedData, imageUrl: '' })}
                                className="text-[9px] font-orbitron font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase"
                              >
                                Clear Image
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1 flex items-center">
                              <LinkIcon className="absolute left-2.5 w-3 h-3 text-black/40 dark:text-white/40 pointer-events-none" />
                              <input
                                type="text"
                                value={editedData?.imageUrl || ''}
                                onChange={(e) => setEditedData({ ...editedData, imageUrl: e.target.value })}
                                placeholder="Paste Image URL or choose file..."
                                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-white dark:bg-black/40 border border-black/15 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--text-main)] font-mono"
                              />
                            </div>
                            <label className="cursor-pointer px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9.5px] font-orbitron font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 whitespace-nowrap">
                              <Upload className="w-3 h-3" />
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageFileUpload}
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="flex flex-col gap-1 px-0.5">
                        <span className="text-[10.5px] font-orbitron font-black tracking-widest text-black/90 dark:text-white/90 uppercase block mb-0.5">
                          About Building
                        </span>
                        {isEditing ? (
                          <textarea
                            value={editedData?.description || ''}
                            onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                            placeholder="Write building description..."
                            rows={3}
                            className={`w-full bg-white dark:bg-black/40 border border-black/15 dark:border-white/15 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-2.5 text-xs text-[var(--text-main)] leading-relaxed transition-all resize-none font-medium`}
                          />
                        ) : (
                          <p className="text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium tracking-normal">
                            {buildingData?.description}
                          </p>
                        )}
                      </div>

                    </div>
                    
                    {/* Right Column: Floor Grid */}
                    <div className="lg:col-span-7 flex flex-col gap-2">
                      <span className="text-[10.5px] font-orbitron font-black tracking-widest text-black/90 dark:text-white/90 uppercase block mb-0.5">
                        Select Floor
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2.5">
                        {(
                          selectedBuilding === 'cv-raman' ? cvRamanFloors : 
                          selectedBuilding === 'ramanujan' ? ramanujanFloors :
                          selectedBuilding === 'smv' ? smvFloors :
                          selectedBuilding === 'atal' ? atalFloors :
                          selectedBuilding === 'rajraman' ? rajramanFloors :
                          apjFloors
                        ).map((floor, idx) => (
                          <motion.button
                            key={floor.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.015 * idx }}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(floorIdToUrl(floor.id))}
                            className={`group relative overflow-hidden bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] border border-black/10 dark:border-white/10 py-2.5 px-4 text-center transition-all duration-300 rounded-xl flex items-center justify-between min-h-[40px] md:min-h-[44px] cursor-pointer hover:-translate-y-0.5 shadow-sm hover:shadow-md`}
                          >
                            <span className={`text-[11px] md:text-xs lg:text-sm font-orbitron font-black tracking-wider text-black/90 dark:text-white/90 transition-colors duration-300 z-10 group-hover:${theme.colorClass}`}>
                              {floor.label}
                            </span>
                            <div className={`w-2.5 h-2.5 rounded-full bg-transparent border border-black/30 dark:border-white/30 group-hover:bg-current group-hover:scale-125 transition-all duration-300 z-10 ${theme.colorClass}`} />
                            
                            <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${theme.gradient}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                  </div>


                  {/* QUICK NAVIGATION TIPS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-2.5 pt-3 border-t border-black/10 dark:border-white/10">
                    {/* Entrance Details */}
                    <div className="flex flex-col justify-start">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass}`}>
                          <Map className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs md:text-sm font-orbitron font-black uppercase tracking-wider text-black/90 dark:text-white/90">
                          Main Entrance
                        </h4>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editedData?.entranceDetails || ''}
                          onChange={(e) => setEditedData({ ...editedData, entranceDetails: e.target.value })}
                          placeholder="Entrance details..."
                          rows={2}
                          className="w-full bg-transparent border-b border-dashed border-black/20 dark:border-white/15 focus:border-white/30 focus:outline-none text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium resize-none py-0.5"
                        />
                      ) : (
                        <p className="text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium">
                          {buildingData?.entranceDetails}
                        </p>
                      )}
                    </div>

                    {/* Lab Access */}
                    <div className="flex flex-col justify-start">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass}`}>
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs md:text-sm font-orbitron font-black uppercase tracking-wider text-black/90 dark:text-white/90">
                          Lab Access
                        </h4>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editedData?.labDetails || ''}
                          onChange={(e) => setEditedData({ ...editedData, labDetails: e.target.value })}
                          placeholder="Lab access details..."
                          rows={2}
                          className="w-full bg-transparent border-b border-dashed border-black/20 dark:border-white/15 focus:border-white/30 focus:outline-none text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium resize-none py-0.5"
                        />
                      ) : (
                        <p className="text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium">
                          {buildingData?.labDetails}
                        </p>
                      )}
                    </div>

                    {/* Staff Rooms */}
                    <div className="flex flex-col justify-start">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass}`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs md:text-sm font-orbitron font-black uppercase tracking-wider text-black/90 dark:text-white/90">
                          Staff Rooms
                        </h4>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editedData?.staffDetails || ''}
                          onChange={(e) => setEditedData({ ...editedData, staffDetails: e.target.value })}
                          placeholder="Staff room details..."
                          rows={2}
                          className="w-full bg-transparent border-b border-dashed border-black/20 dark:border-white/15 focus:border-white/30 focus:outline-none text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium resize-none py-0.5"
                        />
                      ) : (
                        <p className="text-xs text-black/85 dark:text-white/85 leading-relaxed font-medium">
                          {buildingData?.staffDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
