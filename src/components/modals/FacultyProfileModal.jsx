import { motion } from 'framer-motion'
import { X, User, Briefcase, GraduationCap, FileText, Maximize2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resolveImageUrl } from '../../config'
import { formatBlockFloorCode } from '../../utils/floorFormatter'

export default function FacultyProfileModal({ faculty, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Close on ESC key
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

  if (!faculty) return null

  const bioContent = faculty.description || null
  const designation = faculty.designation?.trim() || '—'
  const department = faculty.department?.trim() || '—'
  const blockFloorCode = formatBlockFloorCode(faculty.floorKey, faculty.buildingName)

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 md:p-8 overflow-hidden" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingLeft: 'max(12px, env(safe-area-inset-left))', paddingRight: 'max(12px, env(safe-area-inset-right))' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-3xl"
          onMouseDown={onClose}
        />

        {/* Cinematic Backdrop Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-md md:max-w-2xl max-h-[min(82dvh,640px)] bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-row"
        >
          {/* Left Side: Portrait Area */}
          <div
            onClick={() => {
              if (faculty.image) setIsFullScreen(true)
            }}
            className="relative w-[42%] md:w-[40%] shrink-0 flex flex-col items-center justify-center bg-black/[0.03] dark:bg-white/[0.02] border-r border-black/5 dark:border-white/5 overflow-hidden group cursor-zoom-in"
          >
            {faculty.image ? (
              <>
                <img
                  src={resolveImageUrl(faculty.image)}
                  alt={faculty.name}
                  className="w-full h-full max-h-[200px] md:max-h-none object-contain object-center brightness-95"
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
                <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="px-2.5 py-1 bg-black/80 text-white text-[10px] font-mono rounded-lg border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3 h-3 text-blue-400" />
                    <span>Expand</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-black/10 dark:text-white/5" />
              </div>
            )}
          </div>

        {/* Right Side: Information Area */}
        <div className="flex-1 min-h-0 p-3.5 md:p-10 flex flex-col justify-center overflow-y-auto custom-scrollbar">
          <div className="mb-3 md:mb-6 flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-2xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white leading-tight mb-1 md:mb-2 break-words">
                {faculty.name}
              </h2>
              {blockFloorCode && (
                <p className="text-[10px] md:text-[11px] font-orbitron font-black uppercase tracking-[0.16em] text-blue-500">
                  {blockFloorCode}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all duration-300 group border border-black/5 dark:border-white/5 shadow-sm"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-black/50 dark:text-white/40 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>

          {/* description / Bio Section */}
          {bioContent && (
            <div className="mb-3 md:mb-6 p-3 md:p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-blue-500/60">
                  Profile description
                </span>
              </div>
              <p className="text-[12px] font-medium text-black/70 dark:text-white/60 leading-relaxed italic">
                "{bioContent}"
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="p-3.5 md:p-6 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl space-y-3 md:space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/40 dark:text-white/20">
                    Designation
                  </span>
                </div>
                <p className="text-[12px] md:text-[13px] font-black text-black dark:text-white leading-snug tracking-tight">
                  {designation}
                </p>
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-3 md:pt-5">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <GraduationCap className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/40 dark:text-white/20">
                    Department
                  </span>
                </div>
                <p className="text-[12px] md:text-[13px] font-black text-black dark:text-white leading-snug tracking-tight break-words">
                  {department}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Photo Lightbox Overlay */}
        {isFullScreen && faculty.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setIsFullScreen(false)}
          >
            {/* Cross Mark Close Button */}
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

            <div
              className="relative w-full h-full flex items-center justify-center max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resolveImageUrl(faculty.image)}
                alt={faculty.name}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl select-none"
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
                  e.target.src = `https://placehold.co/800x600/0f172a/ffffff?text=${encodeURIComponent(faculty.name || 'Faculty Portrait')}`
                }}
              />

              <div className="absolute bottom-4 inset-x-0 flex justify-center items-center pointer-events-none">
                <div className="px-5 py-2 bg-black/80 text-white text-xs font-mono rounded-full border border-white/15 backdrop-blur-md shadow-xl pointer-events-auto font-bold">
                  {faculty.name}
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
