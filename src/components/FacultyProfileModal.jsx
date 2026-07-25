import { motion } from 'framer-motion'
import { X, User, Navigation, Building2, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { resolveImageUrl } from '../config'
import { formatFloorKeyToWords } from '../utils/floorFormatter'

export default function FacultyProfileModal({ faculty, onClose }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!faculty) return null

  // Priority: 1. Faculty own description, 2. Room directions, 3. Default message
  const bioContent = faculty.description || null
  const directions =
    faculty.originalRoom?.directions || 'Located in the department staff room.'

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 overflow-hidden">
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
        className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Portrait Area */}
        <div className="relative w-full md:w-[40%] p-8 flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 p-1 bg-white dark:bg-black shadow-xl">
            <div className="w-full h-full rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.05]">
              {faculty.image ? (
                <img
                  src={resolveImageUrl(faculty.image)}
                  alt={faculty.name}
                  className="w-full h-full object-contain brightness-95"
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
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-black/10 dark:text-white/5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Information Area */}
        <div className="flex-1 p-10 flex flex-col justify-center overflow-y-auto custom-scrollbar max-h-[70vh] md:max-h-none">
          <div className="mb-6">
            <h2 className="text-2xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white leading-tight mb-2">
              {faculty.name}
            </h2>
            <div className="flex items-center gap-2 text-blue-500">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-orbitron font-black uppercase tracking-widest">
                {formatFloorKeyToWords(faculty.floorKey)} • {faculty.roomName}
              </span>
            </div>
          </div>

          {/* description / Bio Section */}
          {bioContent && (
            <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
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
            <div className="p-6 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/40 dark:text-white/20">
                  Location Details
                </span>
              </div>
              <div className="text-[13px] font-black text-black dark:text-white leading-relaxed tracking-tight">
                {(() => {
                  if (!directions || directions === 'TBD')
                    return 'Located in the department staff room.'

                  let items = directions
                    .split('\n')
                    .map((item) => item.trim())
                    .filter((item) => item)

                  if (items.length === 1) {
                    items = directions
                      .split(
                        /(?=[a-z]\)\s|(?:\s|^)(?:[ivx]+\.\s|\d+\.\s|•\s))/i
                      )
                      .map((item) => item.trim())
                      .filter((item) => item)
                  }

                  if (
                    items.length > 1 ||
                    /^[ivx]+\.|^[a-z]\)|^\d+\.|^•/i.test(directions.trim())
                  ) {
                    return (
                      <ul className="space-y-2">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="flex-1 tracking-tight">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )
                  }

                  return directions
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Overlaid Close Button (rendered last for absolute z-index stacking safety) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all duration-300 group z-[60] border border-black/5 dark:border-white/5 shadow-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-black/50 dark:text-white/40 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:rotate-90 transition-all duration-300" />
        </button>
      </motion.div>
    </div>
  )
}
