import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Locate, Moon, Sun, Users, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/**
 * Compact control sheet for mobile map navigation.
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
          className="md:hidden fixed top-[57px] left-0 right-0 z-30 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 px-3 py-2.5 shadow-lg origin-top flex flex-col gap-2.5 text-[var(--text-main)]"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-orbitron font-black uppercase tracking-[0.18em] text-black/45 dark:text-white/40">
              Map controls
            </span>
            <button
              onClick={onClose}
              className="-mr-1 flex min-w-[40px] min-h-[40px] items-center justify-center rounded-lg text-black/45 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Close map controls"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] px-1.5 py-1 flex items-center justify-between">
              <span className="pl-2 text-[10px] font-orbitron font-black tracking-[0.14em] uppercase text-black/50 dark:text-white/45">
                Zoom
              </span>
              <div className="flex items-center">
                <button
                  onClick={onZoomOut}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-black/65 dark:text-white/65 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Zoom out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono font-bold text-blue-500 dark:text-blue-400">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-black/65 dark:text-white/65 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Zoom in"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onResetView()
                onClose()
              }}
              className="min-h-[62px] flex flex-col items-center justify-center gap-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] text-black/60 dark:text-white/60 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
            >
              <Locate className="w-4 h-4" />
              <span className="text-[8px] font-orbitron font-black tracking-[0.12em] uppercase">Center</span>
            </button>

            <button
              onClick={() => {
                onOpenFacultyDirectory()
                onClose()
              }}
              className="min-h-[62px] flex flex-col items-center justify-center gap-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] text-black/60 dark:text-white/60 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-[8px] font-orbitron font-black tracking-[0.12em] uppercase">Directory</span>
            </button>

            <button
              onClick={toggleTheme}
              className="min-h-[62px] flex flex-col items-center justify-center gap-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] text-black/60 dark:text-white/60 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-[8px] font-orbitron font-black tracking-[0.12em] uppercase">Theme</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

