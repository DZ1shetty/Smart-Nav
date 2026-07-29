import { motion } from 'framer-motion'
import { Search, Building2, Users, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Minimalist Floating Mobile Control Dock.
 * Positioned at the bottom of mobile viewports for thumb-reach ergonomics.
 */
export default function MobileDock({
  onOpenSearch,
  onOpenFloorSelector,
  onOpenFacultyDirectory,
}) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] md:hidden pointer-events-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-1 px-3 py-2 bg-slate-900/80 dark:bg-black/80 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl"
      >
        {/* Search Trigger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSearch}
          aria-label="Open Search"
          className="p-2.5 rounded-full text-slate-300 dark:text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Search className="w-5 h-5" />
        </motion.button>

        {/* Floor Selector Trigger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onOpenFloorSelector}
          aria-label="Open Floor Selector"
          className="p-2.5 rounded-full text-slate-300 dark:text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Building2 className="w-5 h-5" />
        </motion.button>

        {/* Faculty Directory Trigger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onOpenFacultyDirectory}
          aria-label="Open Faculty Directory"
          className="p-2.5 rounded-full text-slate-300 dark:text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Users className="w-5 h-5" />
        </motion.button>

        <div className="w-[1px] h-5 bg-white/15 mx-1" />

        {/* Theme Toggle Trigger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-full text-amber-400 dark:text-blue-400 hover:bg-white/10 transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </motion.button>
      </motion.div>
    </div>
  )
}
