import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadToCloudinary } from '../utils/cloudinaryUpload'
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
import BuildingMonolithPreview from './BuildingMonolithPreview'

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
            <BuildingMonolithPreview
              buildingKey={selectedBuilding}
              theme={theme}
              floors={
                selectedBuilding === 'cv-raman'
                  ? cvRamanFloors
                  : selectedBuilding === 'ramanujan'
                  ? ramanujanFloors
                  : selectedBuilding === 'smv'
                  ? smvFloors
                  : selectedBuilding === 'atal'
                  ? atalFloors
                  : selectedBuilding === 'rajraman'
                  ? rajramanFloors
                  : apjFloors
              }
              buildingData={buildingData}
              isLoading={isLoading}
              isEditing={isEditing}
              editedData={editedData}
              setEditedData={setEditedData}
              handleStartEdit={handleStartEdit}
              handleCancelEdit={handleCancelEdit}
              handleSaveBuilding={handleSaveBuilding}
              handleBackToHome={handleBackToHome}
            />
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
