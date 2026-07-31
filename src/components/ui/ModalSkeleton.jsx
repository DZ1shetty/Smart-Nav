import { motion } from 'framer-motion'

/**
 * Glassmorphism Shimmer Skeleton Loader for Modals.
 * Provides a glowing modal placeholder during Suspense dynamic lazy loading.
 */
export default function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="w-40 h-4 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
              <div className="w-24 h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
        </div>

        {/* Content Body Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 animate-pulse" />
            <div className="h-28 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 animate-pulse" />
          </div>
          <div className="w-full h-20 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 animate-pulse" />
        </div>
      </motion.div>
    </div>
  )
}
