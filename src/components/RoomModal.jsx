import { motion } from 'framer-motion'
import {
  Image as ImageIcon,
  Navigation,
  Save,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Bookmark,
  MapPin,
  ExternalLink,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  ImagePlus,
  Upload,
} from 'lucide-react'
import { uploadToCloudinary } from '../utils/cloudinaryUpload'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
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
  const [editedName, setEditedName] = useState('')
  const [isFullScreen, setIsFullScreen] = useState(false)
  // Image upload state
  const [uploadProgress, setUploadProgress] = useState(null)  // 0-100 or null
  const [uploadError, setUploadError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Prefer room.image if it exists (meaning it was just uploaded/edited), fallback to room.images array
  const rawImages = room?.image ? [room.image] : (room?.images || [])
  const images = rawImages.map(resolveImageUrl)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose, isFullScreen])

  useEffect(() => {
    if (room) {
      setEditedDirections(room.directions || '')
      setEditedImage(room.image || '')
      setEditedName(room.name || room.label || '')
      setIsEditing(false)
      setIsFullScreen(false)
    }
  }, [room])

  if (!room) return null

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setUploadError(null)
    setUploadProgress(10) // Start progress

    try {
      const secureUrl = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress)
      })
      setEditedImage(secureUrl) // Save Cloudinary URL
      setUploadProgress(null)
      URL.revokeObjectURL(objectUrl) // free memory
    } catch (err) {
      console.error('[Upload] error:', err)
      setUploadError(err.message || 'Upload failed. Did you create the unsigned preset?')
      setUploadProgress(null)
    }
  }

  const handleSave = () => {
    if (onUpdateRoomData) {
      onUpdateRoomData({ name: editedName, directions: editedDirections, image: editedImage })
    }
    setIsEditing(false)
    setPreviewUrl(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 md:p-8 overflow-hidden">
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
          className="relative w-full max-w-4xl bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row items-stretch max-h-[90vh]"
        >
          {/* Actions Container */}
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-[60]">
            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                className={`p-2 border rounded-lg transition-all duration-300 backdrop-blur-md ${isBookmarked
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

          {/* Left Side: Image Carousel with Fullscreen Trigger */}
          <div
            onClick={() => {
              if (images.length > 0) setIsFullScreen(true)
            }}
            className="relative w-full md:w-[50%] bg-black/[0.03] dark:bg-white/[0.02] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 overflow-hidden group cursor-zoom-in"
            style={{ minHeight: '40vw', maxHeight: '42vh' }}
          >
            {images.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center">
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

                {/* Always-Visible Prominent Expand Image Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFullScreen(true)
                  }}
                  className="absolute bottom-3 left-3 z-20 px-3.5 py-1.5 bg-black/80 hover:bg-blue-600 active:scale-95 text-white text-xs font-mono font-bold rounded-xl border border-white/25 backdrop-blur-md transition-all shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 text-blue-400 group-hover:text-white" />
                  <span>Expand Image</span>
                </button>

                {images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-12 flex justify-center gap-2 px-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }}
                      className="p-2 bg-black/60 hover:bg-blue-500/80 rounded-lg border border-white/10 text-white transition-all shadow-md"
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
                      className="p-2 bg-black/60 hover:bg-blue-500/80 rounded-lg border border-white/10 text-white transition-all shadow-md"
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
          <div className="flex-1 p-4 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="mb-3 md:mb-8">
              <div className="flex items-center justify-between gap-3 mb-1 md:mb-2 pr-20">
                <h2 className="text-xl md:text-3xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white leading-tight">
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

            <div className="space-y-4 md:space-y-8 flex-1">
              <InfoSection label="Description" value={room.description} />

              <div className="grid grid-cols-2 gap-4 md:gap-8">
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

              <div className="p-3 md:p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl md:rounded-2xl relative group/directions overflow-hidden">
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
                        Room Name
                      </span>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border-2 border-blue-500/20 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none transition-all shadow-inner"
                        placeholder="e.g. LH-506"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-orbitron font-black uppercase text-black/30 dark:text-white/20 block">
                          Room Image
                        </span>
                        {(previewUrl || editedImage) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditedImage('')
                              setPreviewUrl(null)
                            }}
                            className="text-[9px] font-orbitron font-bold text-red-500 hover:underline uppercase flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Clear Image
                          </button>
                        )}
                      </div>

                      {/* Hidden real file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                      />

                      {/* Upload area */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleImageFile(e.dataTransfer.files?.[0])
                        }}
                        className="relative w-full border-2 border-dashed border-blue-500/30 hover:border-blue-500/70 rounded-xl cursor-pointer transition-all group overflow-hidden"
                        style={{ minHeight: previewUrl || editedImage ? 180 : 100 }}
                      >
                        {/* Preview */}
                        {(previewUrl || editedImage) && (
                          <img
                            src={previewUrl || resolveImageUrl(editedImage)}
                            alt="preview"
                            className="w-full h-full object-contain rounded-xl max-h-48"
                          />
                        )}

                        {/* Overlay prompt */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl transition-all ${previewUrl || editedImage
                            ? 'bg-black/40 opacity-0 group-hover:opacity-100'
                            : 'bg-black/5 dark:bg-white/5'
                          }`}>
                          {uploadProgress !== null ? (
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                          ) : (
                            <ImagePlus className="w-6 h-6 text-blue-400" />
                          )}
                          <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/50 dark:text-white/40">
                            {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Click or Drop Image'}
                          </span>
                        </div>

                        {/* Progress bar */}
                        {uploadProgress !== null && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Error message */}
                      {uploadError && (
                        <p className="mt-1.5 text-[10px] font-orbitron text-red-500">{uploadError}</p>
                      )}

                      {/* Uploaded indicator */}
                      {uploadProgress === null && editedImage && editedImage.includes('firebasestorage') && (
                        <p className="mt-1.5 text-[10px] font-orbitron text-emerald-500 flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Uploaded to Firebase Storage
                        </p>
                      )}
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

          {/* Fullscreen Image Lightbox Overlay */}
          {isFullScreen && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
              onClick={() => setIsFullScreen(false)}
            >
              {/* Prominent Floating Close Button (Cross Mark) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFullScreen(false)
                }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[310] p-3 md:p-4 bg-white/10 hover:bg-red-500 text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-2xl active:scale-90 group"
                aria-label="Close Fullscreen View"
                title="Close Fullscreen View (Esc)"
              >
                <X className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Fullscreen Image Display Container */}
              <div
                className="relative w-full h-full flex items-center justify-center max-w-7xl max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={room.name}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
                  onError={(e) => {
                    const currentSrc = e.target.src
                    if (currentSrc.includes('Smart_Nav')) {
                      e.target.src = currentSrc.replace('Smart_Nav', 'Smart-Nav')
                      return
                    }
                    if (currentSrc.includes('raw.githubusercontent.com')) {
                      const parts = currentSrc.split('/public-backup')
                      if (parts.length > 1) {
                        e.target.src = parts[1]
                        return
                      }
                    }
                    e.target.src = `https://placehold.co/800x600/0f172a/ffffff?text=${encodeURIComponent(room.name || 'Room Image')}`
                  }}
                />

                {/* Prev / Next controls if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                      }}
                      className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-blue-600 text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                      }}
                      className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-blue-600 text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </>
                )}

                {/* Bottom Caption Pill */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center pointer-events-none">
                  <div className="px-5 py-2 bg-black/80 text-white text-xs font-mono rounded-full border border-white/15 backdrop-blur-md shadow-xl flex items-center gap-3 pointer-events-auto">
                    <span className="font-bold">{room.name}</span>
                    {images.length > 1 && (
                      <span className="text-white/60 font-medium">
                        ({currentImageIndex + 1}/{images.length})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
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
            <span className="flex-1 text-xs md:text-[15px] font-black leading-snug text-black dark:text-white tracking-tight">
              {item.trim()}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="leading-relaxed text-xs md:text-[15px] font-black text-black dark:text-white">
      {value}
    </p>
  )
}

function InfoSection({ label, value, isFaculty, onViewProfile }) {
  const renderValue = () => {
    if (!value || value === 'TBD') return 'Not specified'

    return (
      <div className="flex flex-col gap-2">
        <p className="leading-relaxed text-xs md:text-sm font-bold text-black dark:text-white">
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
