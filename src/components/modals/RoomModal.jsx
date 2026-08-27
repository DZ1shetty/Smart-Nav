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
  Camera,
  FileText,
  Compass,
} from 'lucide-react'
import { uploadToCloudinary } from '../../utils/cloudinaryUpload'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resolveImageUrl } from '../../config'
import { searchIndex } from '../../data/searchIndex'
import { floorIdToUrl } from '../../utils/slugHelpers'

export default function RoomModal({ room, onClose, onUpdateRoomData, isBookmarked, onToggleBookmark, onManageFaculty }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDirections, setEditedDirections] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedImage, setEditedImage] = useState('')
  const [editedName, setEditedName] = useState('')
  const [editedType, setEditedType] = useState('')
  const [editedFacultyImage, setEditedFacultyImage] = useState('')
  const [editedFacultyDescription, setEditedFacultyDescription] = useState('')
  const [isFullScreen, setIsFullScreen] = useState(false)
  // Image upload state
  const [uploadProgress, setUploadProgress] = useState(null)  // 0-100 or null
  const [uploadError, setUploadError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [clearedImage, setClearedImage] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Faculty image upload state
  const [facultyUploadProgress, setFacultyUploadProgress] = useState(null)
  const [facultyUploadError, setFacultyUploadError] = useState(null)
  const [facultyPreviewUrl, setFacultyPreviewUrl] = useState(null)
  const facultyFileInputRef = useRef(null)

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
      setEditedDescription(room.description || '')
      setEditedImage(room.image || '')
      setEditedName(room.name || room.label || '')
      setEditedType(room.type || 'office')
      setEditedFacultyImage(room.facultyImage || '')
      setEditedFacultyDescription(room.facultyDescription || '')
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
      const updates = { name: editedName, type: editedType, description: editedDescription, directions: editedDirections, image: editedImage }
      if (room.type === 'staffroom') {
        updates.facultyImage = editedFacultyImage
        updates.facultyDescription = editedFacultyDescription
      }
      onUpdateRoomData(updates)
    }
    setIsEditing(false)
    setPreviewUrl(null)
    setFacultyPreviewUrl(null)
  }

  const handleFacultyImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const objectUrl = URL.createObjectURL(file)
    setFacultyPreviewUrl(objectUrl)
    setFacultyUploadError(null)
    setFacultyUploadProgress(10)

    try {
      const secureUrl = await uploadToCloudinary(file, (progress) => {
        setFacultyUploadProgress(progress)
      })
      setEditedFacultyImage(secureUrl)
      setFacultyUploadProgress(null)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error('[Upload] error:', err)
      setFacultyUploadError(err.message || 'Upload failed.')
      setFacultyUploadProgress(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingLeft: 'max(12px, env(safe-area-inset-left))', paddingRight: 'max(12px, env(safe-area-inset-right))' }}>
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
          className={`relative w-full ${
            room.linkToFloor || room.id?.startsWith('connection-') || room.name?.toLowerCase().includes('connection') || room.id?.includes('connection')
              ? 'max-w-lg'
              : 'max-w-[calc(100vw-24px)] sm:max-w-md md:max-w-4xl'
          } bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden flex ${
            room.linkToFloor || room.id?.startsWith('connection-') || room.name?.toLowerCase().includes('connection') || room.id?.includes('connection')
              ? 'flex-col'
              : 'flex-row'
          } items-stretch max-h-[min(82dvh,720px)]`}
        >

          {/* If Editing: Full-Width Spacious 2-Column Studio Editor Workspace */}
          {isEditing ? (
            <div className="w-full flex flex-col h-full max-h-[85vh] p-4 md:p-8 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm md:text-base font-orbitron font-black uppercase tracking-tight text-black dark:text-white">
                  Edit Room
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all group border border-black/5 dark:border-white/5 shadow-sm"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-black/40 dark:text-white/20 group-hover:text-red-500" />
                </button>
              </div>

              {/* Form Fields: 2 Columns on Desktop */}
              <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8 pr-2">
                {/* Column 1: Text Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-orbitron font-black uppercase text-black/50 dark:text-white/40 block mb-2">
                      Room Name / Label
                    </label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none transition-all shadow-inner"
                      placeholder="e.g. Accounts Section"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-orbitron font-black uppercase text-black/50 dark:text-white/40 block mb-2">
                      Room Category / Type (e.g. Office, Classroom, Lab, Staffroom)
                    </label>
                    <input
                      type="text"
                      value={editedType}
                      onChange={(e) => setEditedType(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none transition-all shadow-inner uppercase font-mono"
                      placeholder="e.g. office, classroom, lab, staffroom"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-orbitron font-black uppercase text-black/50 dark:text-white/40 block mb-2">
                      Room Description
                    </label>
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm font-medium text-black dark:text-white focus:outline-none transition-all shadow-inner custom-scrollbar"
                      placeholder="Describe the room functions, services, or purpose..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-orbitron font-black uppercase text-black/50 dark:text-white/40 block mb-2">
                      Navigation Directions / Path Notes
                    </label>
                    <textarea
                      value={editedDirections}
                      onChange={(e) => setEditedDirections(e.target.value)}
                      rows={7}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium font-mono text-black dark:text-white focus:outline-none transition-all shadow-inner custom-scrollbar leading-relaxed"
                      placeholder="Provide turn-by-turn guidance or landmarks to reach this room..."
                    />
                  </div>

                  {room.type === 'staffroom' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onManageFaculty) onManageFaculty(room.faculty || room.id);
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-orbitron font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-[0.98] border border-emerald-500/20"
                      >
                        <User className="w-4 h-4" />
                        <span>Manage Staff Faculty</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2: Photo Manager */}
                <div className="space-y-4 flex flex-col">
                  <label className="text-[10px] font-orbitron font-black uppercase text-black/50 dark:text-white/40 block">
                    Room Photo
                  </label>

                  <div className="flex-1 p-5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-bold text-black/60 dark:text-white/60">
                        Photo Preview
                      </span>
                      {(previewUrl || editedImage) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setClearedImage(previewUrl || editedImage)
                            setEditedImage('')
                            setPreviewUrl(null)
                          }}
                          className="text-xs font-orbitron font-bold text-red-500 hover:underline uppercase flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" /> Clear Image
                        </button>
                      ) : clearedImage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (clearedImage.startsWith('blob:')) {
                              setPreviewUrl(clearedImage)
                            } else {
                              setEditedImage(clearedImage)
                            }
                            setClearedImage(null)
                          }}
                          className="text-xs font-orbitron font-bold text-blue-500 hover:underline uppercase flex items-center gap-1.5"
                        >
                          Undo Clear
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleImageFile(e.dataTransfer.files?.[0])
                      }}
                      className="relative flex-1 min-h-[220px] border-2 border-dashed border-blue-500/30 hover:border-blue-500/70 rounded-xl cursor-pointer transition-all group overflow-hidden flex flex-col items-center justify-center p-4 bg-black/5 dark:bg-white/5"
                    >
                      {(previewUrl || editedImage) ? (
                        <img
                          src={previewUrl || resolveImageUrl(editedImage)}
                          alt="preview"
                          loading="lazy"
                          className="w-full h-full max-h-56 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-orbitron font-black uppercase tracking-widest text-black/60 dark:text-white/60">
                            Click or Drag Photo Here
                          </span>
                          <p className="text-[11px] font-mono text-black/40 dark:text-white/30">
                            Upload directly to Cloudinary & save URL to Firestore
                          </p>
                        </div>
                      )}

                      {(previewUrl || editedImage) && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all">
                          <ImagePlus className="w-6 h-6 text-blue-400" />
                          <span className="text-xs font-orbitron font-black uppercase tracking-widest">
                            Click or Drop to Replace Photo
                          </span>
                        </div>
                      )}

                      {uploadProgress !== null && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 rounded-b-xl overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Mobile Camera */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                    <div className="flex md:hidden">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 active:bg-blue-500/10 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-orbitron font-black uppercase tracking-widest text-black/60 dark:text-white/60">
                          Capture with Camera
                        </span>
                      </button>
                    </div>

                    {uploadError && (
                      <p className="text-xs font-orbitron text-red-500">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="pt-5 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 border border-black/10 dark:border-white/10 hover:border-red-500/50 text-black/60 dark:text-white/60 hover:text-red-500 rounded-xl text-xs font-orbitron font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-orbitron font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          ) : (
            /* READ-ONLY VIEW (Image Carousel on Left + Room Information on Right) */
            <>
              {/* Left Side: Image Carousel with Fullscreen Trigger (OMITTED for Connection Rooms) */}
              {!(room.linkToFloor || room.id?.startsWith('connection-') || room.name?.toLowerCase().includes('connection') || room.id?.includes('connection')) && (
                <div
                  onClick={() => {
                    if (images.length > 0) setIsFullScreen(true)
                  }}
                  className="relative w-[42%] md:w-[50%] shrink-0 bg-black/[0.03] dark:bg-white/[0.02] flex flex-col items-center justify-center border-r border-black/5 dark:border-white/5 overflow-hidden group cursor-zoom-in"
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
                        className="w-full h-full max-h-[200px] md:max-h-none object-contain object-center"
                        onError={(e) => {
                          const currentSrc = e.target.src;
                          if (currentSrc.includes('Smart_Nav')) {
                            e.target.src = currentSrc.replace('Smart_Nav', 'Smart-Nav');
                            return;
                          }
                          if (currentSrc.includes('raw.githubusercontent.com')) {
                            if (currentSrc.includes('/public/')) {
                              const parts = currentSrc.split('/public/');
                              if (parts.length > 1 && !currentSrc.endsWith(parts[1])) {
                                e.target.src = '/' + parts[1];
                                return;
                              }
                            }
                            if (currentSrc.includes('/public-backup/')) {
                              const parts = currentSrc.split('/public-backup/');
                              if (parts.length > 1 && !currentSrc.endsWith(parts[1])) {
                                e.target.src = '/' + parts[1];
                                return;
                              }
                            }
                          }
                          e.target.src = `https://placehold.co/800x600/0f172a/ffffff?text=${encodeURIComponent(room.name || 'Room Image')}`;
                        }}
                      />

                      {/* Always-Visible Prominent Expand Image Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsFullScreen(true)
                        }}
                        className="absolute top-2 left-2 md:bottom-3 md:left-3 md:top-auto z-20 p-1.5 md:px-3.5 md:py-2.5 bg-black/70 hover:bg-blue-600 active:scale-95 text-white text-[9px] md:text-xs font-mono font-bold rounded-md md:rounded-xl border border-white/25 backdrop-blur-md transition-all shadow-xl flex items-center gap-1 md:gap-2 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3 md:w-4 md:h-4 text-blue-400 group-hover:text-white" />
                        <span className="hidden md:inline">Expand Image</span>
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
                    <div className="w-full h-full min-h-[160px] md:min-h-0 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-zinc-900/60 to-black text-center">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                          <Building className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-orbitron font-black uppercase text-white tracking-wider">
                          {room.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {room.type || 'ROOM'}
                        </span>
                        <p className="text-xs text-zinc-400 max-w-xs font-mono mt-1">
                          No custom photograph uploaded yet.
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsEditing(true)
                          }}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-orbitron font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Room Image</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Right Side: Information */}
              <div className="flex-1 min-h-0 p-3.5 md:p-8 overflow-y-auto custom-scrollbar flex flex-col space-y-3 md:space-y-6">
                {/* Header Bar: Title & Action Badges */}
                <div className="border-b border-black/10 dark:border-white/10 pb-3 md:pb-5 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <h2 className="flex-1 min-w-0 text-base sm:text-lg md:text-3xl font-orbitron font-black uppercase tracking-tight text-black dark:text-white leading-tight break-words">
                      {room.name}
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onToggleBookmark && (
                        <button
                          onClick={onToggleBookmark}
                          className={`p-2 border rounded-lg transition-all duration-300 ${isBookmarked
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/40 dark:text-white/20 hover:text-amber-500 dark:hover:text-amber-400 shadow-sm'
                            }`}
                          aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                          title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                        >
                          <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all group border border-black/5 dark:border-white/5 shadow-sm"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5 text-black/40 dark:text-white/20 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-orbitron font-black uppercase tracking-widest bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {room.type === 'staffroom' ? 'STAFF ROOM' : room.type}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 md:px-3.5 md:py-1.5 bg-blue-500/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-600 text-blue-600 dark:text-blue-400 hover:text-white rounded-lg md:rounded-xl transition-all duration-300 shadow-sm active:scale-95 group cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] md:text-[10px] font-orbitron font-black uppercase tracking-wider">
                        Edit
                      </span>
                    </button>
                  </div>
                </div>

                {/* Content Sections Container */}
                <div className="space-y-3 md:space-y-6 flex-1">
                  {/* Description Section */}
                  <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-orbitron font-black text-blue-500 uppercase tracking-widest">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Description</span>
                    </div>
                    <p className="text-sm font-medium text-black/80 dark:text-white/80 leading-relaxed pl-6">
                      {room.description || 'No detailed description available for this room.'}
                    </p>
                  </div>

                  {/* Personnel & Affiliation Grid */}
                  {((room.faculty || (room.linkedFaculty && room.linkedFaculty.length > 0)) || room.department) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(room.faculty || (room.linkedFaculty && room.linkedFaculty.length > 0)) && (
                        <InfoSection
                          label="Personnel"
                          value={room.faculty || (room.linkedFaculty && room.linkedFaculty.join(', '))}
                          isFaculty={true}
                          onViewProfile={(facultyName) => {
                            const target = facultyName || room.faculty || (room.linkedFaculty && room.linkedFaculty[0])
                            if (!target) return
                            const searchParams = new URLSearchParams(location.search)
                            if (room.id) searchParams.set('room', room.id)
                            searchParams.set('faculty', target)
                            navigate(`${location.pathname}?${searchParams.toString()}`)
                          }}
                        />
                      )}
                      {room.department && (
                        <InfoSection label="Affiliation" value={room.department} />
                      )}
                    </div>
                  )}

                  {/* Connected Floor Link Button */}
                  {room.linkToFloor && (
                    <div className="pt-1">
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

                  {/* Navigation & Directions Card */}
                  <div className="p-3 md:p-5 bg-gradient-to-br from-emerald-500/5 via-black/[0.02] dark:via-white/[0.02] to-transparent border border-emerald-500/20 dark:border-emerald-500/20 rounded-xl md:rounded-2xl relative overflow-hidden space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 text-xs font-orbitron font-black text-emerald-500 uppercase tracking-widest">
                      <Compass className="w-4 h-4 text-emerald-500" />
                      <span>Wayfinding & Directions</span>
                    </div>

                    <div className="pl-6">
                      <DirectionDisplay value={room.directions} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
                  loading="lazy"
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    if (currentSrc.includes('Smart_Nav')) {
                      e.target.src = currentSrc.replace('Smart_Nav', 'Smart-Nav');
                      return;
                    }
                    if (currentSrc.includes('raw.githubusercontent.com')) {
                      if (currentSrc.includes('/public/')) {
                        const parts = currentSrc.split('/public/');
                        if (parts.length > 1 && !currentSrc.endsWith(parts[1])) {
                          e.target.src = '/' + parts[1];
                          return;
                        }
                      }
                      if (currentSrc.includes('/public-backup/')) {
                        const parts = currentSrc.split('/public-backup/');
                        if (parts.length > 1 && !currentSrc.endsWith(parts[1])) {
                          e.target.src = '/' + parts[1];
                          return;
                        }
                      }
                    }
                    e.target.src = `https://placehold.co/800x600/0f172a/ffffff?text=${encodeURIComponent(room.name || 'Room Image')}`;
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
                      className="absolute left-2 md:left-6 top-2/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-blue-600 text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                      }}
                      className="absolute right-2 md:right-6 top-2/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-blue-600 text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95"
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

    const items = isFaculty && typeof value === 'string'
      ? value.split(',').map(s => s.trim()).filter(Boolean)
      : [value]

    return (
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <p className="leading-relaxed text-xs md:text-sm font-bold text-black dark:text-white">
              {item}
            </p>
            {isFaculty && onViewProfile && (
              <button
                type="button"
                onClick={() => onViewProfile(item)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 hover:border-blue-500 text-blue-500 hover:text-white rounded-lg transition-all duration-300 w-fit group cursor-pointer"
              >
                <User className="w-3 h-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-orbitron font-black uppercase tracking-widest">
                  View Profile
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-orbitron font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/20">
        {label}
      </span>
      {renderValue()}
    </div>
  )
}
