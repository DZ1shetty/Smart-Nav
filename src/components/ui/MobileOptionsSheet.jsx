import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Locate, Users, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

/**
 * Glassmorphic Options Sheet for Mobile Navigation.
 * Slides down smoothly on mobile screens to provide quick access to Zoom, Recenter, Faculty Directory, and Theme Toggle.
 */
export default function MobileOptionsSheet({
  isOpen,
  onClose,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenFacultyDirectory,
}) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed top-[57px] left-0 right-0 z-30 bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl border-b border-white/10 p-5 shadow-2xl origin-top flex flex-col gap-5 text-white"
        >
          {/* Header row with close button */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-sm font-orbitron font-black uppercase tracking-widest text-cyan-400">
              MAP CONTROLS &amp; OPTIONS
            </span>
            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Zoom Controls Card */}
            <div className="col-span-2 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-sm font-orbitron font-bold text-slate-300 tracking-widest uppercase">
                ZOOM
              </span>
              <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl">
                <button
                  onClick={onZoomOut}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-base font-mono font-bold text-cyan-400 w-14 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Recenter Map Card */}
            <button
              onClick={() => {
                onResetView()
                onClose()
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors"
            >
              <span className="text-sm font-orbitron font-bold tracking-widest uppercase">RECENTER</span>
              <Locate className="w-5 h-5 flex-shrink-0" />
            </button>

            {/* Faculty Directory Card */}
            <button
              onClick={() => {
                onOpenFacultyDirectory()
                onClose()
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-colors"
            >
              <span className="text-sm font-orbitron font-bold tracking-widest uppercase">DIRECTORY</span>
              <Users className="w-5 h-5 flex-shrink-0" />
            </button>

            {/* Theme Toggle Card */}
            <div className="col-span-2 flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span className="text-sm font-orbitron font-bold tracking-widest uppercase">THEME</span>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

