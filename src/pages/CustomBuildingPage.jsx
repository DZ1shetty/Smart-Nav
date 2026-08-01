import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, Edit3, Trash2, Building2, Layers, 
  Map, AlertCircle, Loader2, CheckCircle2, Circle
} from 'lucide-react'
import { db } from '../firebase'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { toast } from 'sonner'
import ThemeToggle from '../components/ui/ThemeToggle'

// Mini SVG preview thumbnail for a floor
const FloorThumbnail = ({ rooms }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400">
        <Map className="w-6 h-6 opacity-30" />
      </div>
    )
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  rooms.forEach((room) => {
    if (room.points) {
      room.points.forEach((p) => {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
      })
    } else {
      const rx = room.x ?? 0, ry = room.y ?? 0
      const rw = room.w ?? room.width ?? 60
      const rh = room.h ?? room.height ?? 40
      if (rx < minX) minX = rx
      if (ry < minY) minY = ry
      if (rx + rw > maxX) maxX = rx + rw
      if (ry + rh > maxY) maxY = ry + rh
    }
  })

  if (!isFinite(minX)) return null
  const pad = 10
  const svgW = maxX - minX + pad * 2
  const svgH = maxY - minY + pad * 2

  const COLORS = {
    classroom: '#3b82f6', lab: '#22c55e', staffroom: '#facc15',
    hod: '#f97316', office: '#14b8a6', utility: '#9ca3af',
    hall: '#ef4444', corridor: '#e5e7eb',
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {rooms.map((room, i) => {
        const fill = COLORS[room.type] || '#6b7280'
        if (room.points && room.points.length > 1) {
          const pts = room.points.map(p => `${p.x - minX + pad},${p.y - minY + pad}`).join(' ')
          return <polygon key={i} points={pts} fill={fill} fillOpacity={0.6} stroke={fill} strokeWidth={1} />
        }
        const rx = (room.x ?? 0) - minX + pad
        const ry = (room.y ?? 0) - minY + pad
        return (
          <rect key={i} x={rx} y={ry}
            width={room.w ?? room.width ?? 60}
            height={room.h ?? room.height ?? 40}
            rx={4} fill={fill} fillOpacity={0.6} stroke={fill} strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

export default function CustomBuildingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(null)
  const [draftId, setDraftId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchDraft = useCallback(async () => {
    setIsLoading(true)
    try {
      const q = query(collection(db, 'builder_drafts'), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      let found = null
      let foundId = null
      snap.forEach((docSnap) => {
        const data = docSnap.data()
        const draftSlug = data.buildingSlug || data.buildingMeta?.slug
        if (draftSlug === slug && !found) {
          found = data
          foundId = docSnap.id
        }
      })
      setDraft(found)
      setDraftId(foundId)
    } catch (err) {
      console.error('[CustomBuildingPage] Error fetching draft:', err)
      toast.error('Failed to load building data.')
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchDraft()
  }, [fetchDraft])

  const handleContinueEditing = () => {
    // Store draft slug in localStorage so the builder SetupModal can auto-select it
    localStorage.setItem('smart_nav_open_draft_slug', slug)
    navigate('/builder')
  }

  const handleDelete = async () => {
    if (!draftId) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, 'builder_drafts', draftId))
      toast.success('Building deleted.')
      navigate('/')
    } catch (err) {
      console.error('[CustomBuildingPage] Delete error:', err)
      toast.error('Failed to delete building.')
    } finally {
      setIsDeleting(false)
    }
  }

  const meta = draft?.buildingMeta || {}
  const floorCount = meta.floorCount || 1
  const floors = Array.from({ length: floorCount }, (_, i) => ({
    index: i,
    label: i === 0 ? 'Ground Floor' : `Floor ${i}`,
    rooms: draft?.floorsData?.[i] || [],
  }))

  const THEME_COLORS = {
    blue: { text: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', glow: 'shadow-blue-500/20', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    emerald: { text: 'text-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    purple: { text: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500', glow: 'shadow-purple-500/20', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    amber: { text: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500', glow: 'shadow-amber-500/20', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    rose: { text: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-500', glow: 'shadow-rose-500/20', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
    cyan: { text: 'text-cyan-500', border: 'border-cyan-500', bg: 'bg-cyan-500', glow: 'shadow-cyan-500/20', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  }
  const themeKey = meta.theme || 'blue'
  const tc = THEME_COLORS[themeKey] || THEME_COLORS.blue

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[var(--bg-main)] text-[var(--text-main)] p-8">
        <AlertCircle className="w-12 h-12 text-zinc-400" />
        <h2 className="text-xl font-bold">Building Not Found</h2>
        <p className="text-zinc-500 text-sm text-center">No draft found for <span className="font-mono font-bold">{slug}</span>. It may have been deleted.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="min-h-[100dvh] bg-[var(--bg-main)] text-[var(--text-main)] font-mono p-3 md:p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-sm font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Building Header */}
        <div className={`p-6 rounded-2xl border ${tc.border}/30 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-lg ${tc.glow}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${tc.bg}/10 border ${tc.border}/30 flex items-center justify-center`}>
                <Building2 className={`w-7 h-7 ${tc.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-orbitron font-black uppercase tracking-widest ${tc.text}`}>
                    SMART BUILDER · DRAFT
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-orbitron font-black tracking-tight uppercase">
                  {meta.name || slug}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tc.badge}`}>
                    {floorCount} {floorCount === 1 ? 'FLOOR' : 'FLOORS'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">/{slug}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleContinueEditing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${tc.bg} text-white text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-95`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Continue Editing</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {meta.overview && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-black/5 dark:border-white/5 pt-4">
              {meta.overview}
            </p>
          )}
        </div>

        {/* Floor Tiles */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Layers className={`w-4 h-4 ${tc.text}`} />
            <span className="text-xs font-orbitron font-black uppercase tracking-widest text-zinc-500">
              SELECT LEVEL TO VIEW MAP
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {[...floors].reverse().map((floor) => {
              const hasRooms = floor.rooms && floor.rooms.length > 0
              return (
                <motion.button
                  key={floor.index}
                  onClick={() => hasRooms && navigate(`/custom/${slug}/floor/${floor.index}`)}
                  whileHover={hasRooms ? { scale: 1.01, x: 3 } : {}}
                  whileTap={hasRooms ? { scale: 0.99 } : {}}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className={`group relative w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                    hasRooms
                      ? `border-black/10 dark:border-white/10 hover:${tc.border}/40 bg-white/70 dark:bg-white/[0.03] hover:shadow-md cursor-pointer`
                      : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02] opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`w-20 h-14 flex-shrink-0 rounded-xl overflow-hidden border ${hasRooms ? 'border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'}`}>
                    <FloorThumbnail rooms={floor.rooms} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-orbitron font-black uppercase tracking-wider border ${
                        hasRooms
                          ? `bg-black/5 dark:bg-white/5 ${tc.text} border-black/10 dark:border-white/10`
                          : 'bg-black/5 dark:bg-white/5 text-zinc-400 border-black/5'
                      }`}>
                        L0{floor.index}
                      </span>
                      <h3 className={`text-sm font-orbitron font-black uppercase tracking-tight ${
                        hasRooms ? 'text-[var(--text-main)]' : 'text-zinc-400'
                      }`}>
                        {floor.label}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {hasRooms ? `${floor.rooms.length} room${floor.rooms.length !== 1 ? 's' : ''} mapped` : 'Setup in progress'}
                    </p>
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {hasRooms ? (
                      <CheckCircle2 className={`w-5 h-5 ${tc.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">Delete Building?</h3>
                  <p className="text-xs text-zinc-500">This cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to permanently delete <span className="font-bold text-zinc-900 dark:text-white">"{meta.name}"</span> and all its floor data?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
