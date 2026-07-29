import { motion } from 'framer-motion'

/**
 * High-Tech Pulsing Skeleton Loader for Floor Maps.
 * Displays a glowing blueprint shimmer placeholder while floor data or map assets load.
 */
export default function FloorMapSkeleton() {
  return (
    <div className="relative w-full h-full p-4 flex flex-col items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl border border-white/10 rounded-[20px] overflow-hidden">
      {/* Background Animated Shimmer Glow */}
      <motion.div
        animate={{
          opacity: [0.15, 0.4, 0.15],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-teal-500/5 to-purple-500/10 pointer-events-none"
      />

      <svg
        viewBox="0 0 640 660"
        className="w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00eaff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Boundary Skeleton */}
        <rect
          x="20"
          y="20"
          width="600"
          height="620"
          rx="30"
          fill="none"
          stroke="url(#shimmer)"
          strokeWidth="3"
          strokeDasharray="10 6"
          className="animate-pulse"
        />

        {/* Room Box Skeletons */}
        <rect x="40" y="40" width="160" height="120" rx="12" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" />
        <rect x="220" y="40" width="200" height="120" rx="12" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1.5" />
        <rect x="440" y="40" width="160" height="120" rx="12" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" />

        <rect x="40" y="180" width="260" height="140" rx="12" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" />
        <rect x="340" y="180" width="260" height="140" rx="12" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5" />

        <rect x="40" y="340" width="180" height="140" rx="12" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" strokeWidth="1.5" />
        <rect x="240" y="340" width="360" height="140" rx="12" fill="rgba(20,184,166,0.08)" stroke="rgba(20,184,166,0.2)" strokeWidth="1.5" />

        <rect x="40" y="500" width="560" height="100" rx="12" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" />
      </svg>

      {/* Loading Label */}
      <div className="absolute bottom-8 flex items-center gap-3 px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
        <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-[11px] font-orbitron font-black tracking-widest text-cyan-400 uppercase">
          INITIALIZING FLOOR MAP...
        </span>
      </div>
    </div>
  )
}
