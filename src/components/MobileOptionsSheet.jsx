import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Locate, Users, Sun, Moon, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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
          className="md:hidden fixed top-[57px] left-0 right-0 z-30 bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl border-b border-white/10 p-4 shadow-2xl origin-top flex flex-col gap-4 text-white"
        >
          {/* Header row with close button */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-cyan-400">
              MAP CONTROLS & OPTIONS
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Zoom Controls Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-orbitron font-bold text-slate-300">
                ZOOM
              </span>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg">
                <button
                  onClick={onZoomOut}
                  className="p-1.5 hover:bg-white/10 rounded-md text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-cyan-400 w-9 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="p-1.5 hover:bg-white/10 rounded-md text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recenter Map Card */}
            <button
              onClick={() => {
                onResetView()
                onClose()
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors"
            >
              <span className="text-[11px] font-orbitron font-bold">RECENTER</span>
              <Locate className="w-4 h-4" />
            </button>

            {/* Faculty Directory Card */}
            <button
              onClick={() => {
                onOpenFacultyDirectory()
                onClose()
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-colors"
            >
              <span className="text-[11px] font-orbitron font-bold">DIRECTORY</span>
              <Users className="w-4 h-4" />
            </button>

            {/* Theme Toggle Card */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors"
            >
              <span className="text-[11px] font-orbitron font-bold">THEME</span>
              {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
