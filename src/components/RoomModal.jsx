import { motion } from 'framer-motion'
import {
  X,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  Bookmark,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resolveImageUrl } from '../config'
import { searchIndex } from '../data/searchIndex'
import { floorIdToUrl } from '../utils/slugHelpers'

export default function RoomModal({ room, onClose, onUpdateRoomData, isBookmarked, onToggleBookmark }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDirections, setEditedDirections] = useState('')
  const [editedImage, setEditedImage] = useState('')

  const images = (room?.images || (room?.image ? [room.image] : [])).map(resolveImageUrl)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    if (room) {
      setEditedDirections(room.directions || '')
      setEditedImage(room.image || '')
      setIsEditing(false)
    }
  }, [room])

  if (!room) return null

  const handleSave = () => {
    if (onUpdateRoomData) {
      onUpdateRoomData({ directions: editedDirections, image: editedImage })
    }
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 dark:bg-black/85 backdrop-blur-xl"
        onMouseDown={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row items-stretch max-h-[88vh]"
      >
        {/* Actions Container */}
        <div className="absolute top-4 right-4 flex items-center gap-2.5 z-[60]">
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-2 border rounded-lg transition-all duration-300 backdrop-blur-md ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                  : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/40 dark:text-white/20 hover:text-amber-500 dark:hover:text-amber-400 shadow-sm'
              }`}
              aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all group border border-black/5 dark:border-white/5 backdrop-blur-md shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-black/40 dark:text-white/20 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Left Side: Image Carousel */}
        <div className="relative w-full md:w-[50%] bg-black/[0.03] dark:bg-white/[0.02] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 overflow-hidden">
          {images.length > 0 ? (
            <div className="relative w-full h-full group">
              <motion.img
                key={images[currentImageIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[currentImageIndex]}
                alt={room.name}
                loading="lazy"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const currentSrc = e.target.src;
                  if (currentSrc.includes('raw.githubusercontent.com')) {
                    const parts = currentSrc.split('/public-backup');
                    if (parts.length > 1) {
                      e.target.src = parts[1];
                      return;
                    }
                  }
                  e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                }}
              />

              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }}
                    className="p-2 bg-black/50 hover:bg-blue-500/80 rounded-lg border border-white/10 text-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }}
                    className="p-2 bg-black/50 hover:bg-blue-500/80 rounded-lg border border-white/10 text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-black/5 dark:text-white/5">
              <Building className="w-12 h-12 mb-3" />
              <span className="text-[10px] font-orbitron font-black uppercase tracking-widest">
                No Visual Data
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-2 pr-20">
              <h2 className="text-3xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white leading-tight">
                {room.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-500 text-[10px] font-orbitron font-black uppercase tracking-[0.2em]">
                {room.type}
              </span>
              <div className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
              <span className="text-black/40 dark:text-white/30 text-[10px] font-orbitron font-bold uppercase tracking-widest">
                {room.id}
              </span>
            </div>
          </div>

          <div className="space-y-8 flex-1">
            <InfoSection label="Description" value={room.description} />

            <div className="grid grid-cols-2 gap-8">
              {room.faculty && (
                <InfoSection
                  label="Personnel"
                  value={room.faculty}
                  isFaculty={true}
                  onViewProfile={() => {
                    const searchParams = new URLSearchParams(location.search)
                    searchParams.set('faculty', room.faculty)
                    navigate(`${location.pathname}?${searchParams.toString()}`)
                  }}
                />
              )}
              {room.department && (
                <InfoSection label="Affiliation" value={room.department} />
              )}
            </div>

            {room.linkToFloor && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose()
                    navigate(floorIdToUrl(room.linkToFloor))
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-orbitron font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98] border border-blue-500/20 group/btn"
                >
                  <Building className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-300" />
                  <span>
                    Go to {searchIndex[room.linkToFloor] ? `${searchIndex[room.linkToFloor].buildingName} (${searchIndex[room.linkToFloor].label})` : 'Connected Floor'}
                  </span>
                </button>
              </div>
            )}

            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl relative group/directions overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-orbitron font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/20">
                  Room Details
                </span>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 hover:border-blue-500 text-blue-500 hover:text-white rounded-lg transition-all duration-300 group"
                  >
                    <Edit3 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-orbitron font-black uppercase tracking-widest">
                      Edit Details
                    </span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 border border-black/10 dark:border-white/10 hover:border-red-500/50 text-black/40 dark:text-white/30 hover:text-red-500 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-orbitron font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      SAVE ALL
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-orbitron font-black uppercase text-black/30 dark:text-white/20 block mb-2">
                      ImgBB Link (Direct Image URL)
                    </span>
                    <input
                      type="text"
                      value={editedImage}
                      onChange={(e) => setEditedImage(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border-2 border-blue-500/20 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none transition-all shadow-inner"
                      placeholder="https://i.ibb.co/..."
                    />
                  </div>
                  <div>
                    <span className="text-[8px] font-orbitron font-black uppercase text-black/30 dark:text-white/20 block mb-2">
                      Navigation Path
                    </span>
                    <textarea
                      value={editedDirections}
                      onChange={(e) => setEditedDirections(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border-2 border-blue-500/20 focus:border-blue-500 rounded-xl p-4 text-sm font-medium text-black dark:text-white focus:outline-none transition-all min-h-[100px] custom-scrollbar shadow-inner"
                      placeholder="Describe the path to this room..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <DirectionDisplay value={room.directions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DirectionDisplay({ value }) {
  if (!value || value === 'TBD')
    return (
      <p className="text-sm font-medium text-black/40 dark:text-white/20">
        Not specified
      </p>
    )

  // Split primarily by newlines
  let items = value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item)

  // If still one block, try splitting by patterns but more carefully
  if (items.length === 1) {
    items = value
      .split(/(?=[a-z]\)\s|(?:\s|^)(?:[ivx]+\.\s|\d+\.\s|•\s))/i)
      .map((item) => item.trim())
      .filter((item) => item)
  }

  if (items.length > 1 || /^[ivx]+\.|^[a-z]\)|^\d+\.|^•/i.test(value.trim())) {
    return (
      <ul className="space-y-3 mt-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 items-start">
            <span className="flex-1 text-[15px] font-black leading-snug text-black dark:text-white tracking-tight">
              {item.trim()}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="leading-relaxed text-[15px] font-black text-black dark:text-white">
      {value}
    </p>
  )
}

function InfoSection({ label, value, isFaculty, onViewProfile }) {
  const renderValue = () => {
    if (!value || value === 'TBD') return 'Not specified'

    return (
      <div className="flex flex-col gap-2">
        <p className="leading-relaxed text-sm font-bold text-black dark:text-white">
          {value}
        </p>
        {isFaculty && onViewProfile && (
          <button
            onClick={onViewProfile}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 hover:border-blue-500 text-blue-500 hover:text-white rounded-lg transition-all duration-300 w-fit group"
          >
            <User className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-orbitron font-black uppercase tracking-widest">
              View Profile
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-orbitron font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/20">
        {label}
      </span>
      {renderValue()}
    </div>
  )
}
