import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * A reusable, premium dossier-style modal wrapper.
 * Provides the glassmorphism, blur effects, and common header/footer structure.
 */
export default function DossierModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-5xl',
  footer,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidth} bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 hover:bg-white/5 rounded-full transition-all group z-[60] border border-white/5 backdrop-blur-md"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white/20 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
            {/* Holographic Header */}
            <div className="relative p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center gap-5">
                {Icon && (
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white italic">
                    {title}
                  </h2>
                  {subtitle && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                        {subtitle}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 bg-black/40 border-t border-white/5 px-8">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
