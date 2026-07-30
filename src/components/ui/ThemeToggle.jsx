import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 dark:bg-white/5 border border-black/15 dark:border-white/15 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <motion.div
        initial={false}
        animate={{
          y: isDark ? -24 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute flex items-center justify-center"
      >
        <Sun className="w-4 h-4 md:w-4.5 md:h-4.5 text-amber-500" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          y: isDark ? 0 : 24,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute flex items-center justify-center"
      >
        <Moon className="w-4 h-4 md:w-4.5 md:h-4.5 text-blue-400" />
      </motion.div>

      {/* Hover effect background */}
      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
}


export default ThemeToggle
