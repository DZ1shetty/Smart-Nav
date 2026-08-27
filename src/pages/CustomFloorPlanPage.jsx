import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Loader2, AlertCircle, Edit3, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { toast } from 'sonner'
import ThemeToggle from '../components/ui/ThemeToggle'

// ─── Room info popup ────────────────────────────────────────────────────────

const RoomPopup = ({ room, onClose }) => {
  if (!room) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 min-w-[220px] max-w-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{room.label || room.name || 'Room'}</h3>
          {room.type && (
            <span className="text-xs text-zinc-500 capitalize">{room.type}</span>
          )}
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-lg leading-none">×</button>
      </div>
      {room.description && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{room.description}</p>
      )}
    </motion.div>
  )
}

// ─── Canvas Renderer ────────────────────────────────────────────────────────

const TYPE_COLORS = {
  classroom: '#3b82f6', lab: '#22c55e', staffroom: '#facc15',
  hod: '#f97316', office: '#14b8a6', utility: '#9ca3af',
  hall: '#ef4444', corridor: 'rgba(200,200,200,0.3)',
}

function CustomFloorCanvas({ rooms, onRoomClick }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Calculate bounds
  const bounds = useCallback(() => {
    if (!rooms || rooms.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    rooms.forEach((r) => {
      if (r.points) {
        r.points.forEach((p) => {
          if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y
          if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y
        })
      } else {
        const rx = r.x ?? 0, ry = r.y ?? 0
        const rw = r.w ?? r.width ?? 60, rh = r.h ?? r.height ?? 40
        if (rx < minX) minX = rx; if (ry < minY) minY = ry
        if (rx + rw > maxX) maxX = rx + rw; if (ry + rh > maxY) maxY = ry + rh
      }
    })
    return isFinite(minX) ? { minX: minX - 40, minY: minY - 40, maxX: maxX + 40, maxY: maxY + 40 } : { minX: 0, minY: 0, maxX: 800, maxY: 600 }
  }, [rooms])

  const fitToContainer = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const b = bounds()
    const cw = container.clientWidth, ch = container.clientHeight
    const mapW = b.maxX - b.minX, mapH = b.maxY - b.minY
    const newScale = Math.min(cw / mapW, ch / mapH, 2) * 0.9
    const newOffsetX = (cw - mapW * newScale) / 2 - b.minX * newScale
    const newOffsetY = (ch - mapH * newScale) / 2 - b.minY * newScale
    setScale(newScale)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }, [bounds])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.clientWidth, ch = canvas.clientHeight
    canvas.width = cw * dpr; canvas.height = ch * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, cw, ch)

    // Dark mode check
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#0a0a0a' : '#f8fafc'
    ctx.fillRect(0, 0, cw, ch)

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
    ctx.lineWidth = 0.5
    const gridSize = 20 * scale
    const startX = ((offset.x % gridSize) + gridSize) % gridSize
    const startY = ((offset.y % gridSize) + gridSize) % gridSize
    for (let x = startX; x < cw; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke() }
    for (let y = startY; y < ch; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke() }

    if (!rooms) return

    rooms.forEach((room) => {
      const color = TYPE_COLORS[room.type] || '#6b7280'
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      if (room.points && room.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(room.points[0].x, room.points[0].y)
        room.points.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.closePath()
        ctx.fillStyle = color + '33'
        ctx.strokeStyle = color
        ctx.lineWidth = 2 / scale
        ctx.fill()
        ctx.stroke()
      } else {
        const rx = room.x ?? 0, ry = room.y ?? 0
        const rw = room.w ?? room.width ?? 60, rh = room.h ?? room.height ?? 40
        const r = Math.min(6 / scale, rw / 4, rh / 4)
        ctx.beginPath()
        ctx.moveTo(rx + r, ry)
        ctx.lineTo(rx + rw - r, ry)
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
        ctx.lineTo(rx + rw, ry + rh - r)
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
        ctx.lineTo(rx + r, ry + rh)
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
        ctx.lineTo(rx, ry + r)
        ctx.quadraticCurveTo(rx, ry, rx + r, ry)
        ctx.closePath()
        ctx.fillStyle = color + '33'
        ctx.strokeStyle = color
        ctx.lineWidth = 2 / scale
        ctx.fill()
        ctx.stroke()

        // Label
        const label = room.label || room.name || ''
        if (label) {
          const fontSize = Math.max(8, Math.min(14, rh * 0.35)) / scale
          ctx.font = `bold ${fontSize}px 'Space Mono', monospace`
          ctx.fillStyle = isDark ? '#fff' : '#111'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.globalAlpha = 0.9
          const maxW = rw * 0.85
          let text = label
          while (ctx.measureText(text).width > maxW && text.length > 1) {
            text = text.slice(0, -1)
          }
          if (text !== label) text += '…'
          ctx.fillText(text, rx + rw / 2, ry + rh / 2)
          ctx.globalAlpha = 1
        }
      }
      ctx.restore()
    })
  }, [rooms, scale, offset])

  // Fit on mount / room change
  useEffect(() => {
    const t = setTimeout(fitToContainer, 80)
    return () => clearTimeout(t)
  }, [fitToContainer, rooms])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(fitToContainer)
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [fitToContainer])

  // Hit-test click
  const handleClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas || !onRoomClick) return
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX - rect.left - offset.x) / scale
    const cy = (e.clientY - rect.top - offset.y) / scale

    let hit = null
    for (let i = rooms.length - 1; i >= 0; i--) {
      const r = rooms[i]
      if (r.points) continue // polygon hit-test skipped for simplicity
      const rx = r.x ?? 0, ry = r.y ?? 0
      const rw = r.w ?? r.width ?? 60, rh = r.h ?? r.height ?? 40
      if (cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh) { hit = r; break }
    }
    onRoomClick(hit)
  }

  // Pan
  const onPointerDown = (e) => {
    isPanning.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }
  const onPointerUp = () => { isPanning.current = false }
  const onWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setScale(s => Math.min(4, Math.max(0.2, s * factor)))
  }

  return (
    <div ref={containerRef} className="relative w-full h-full" onWheel={onWheel} style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button onClick={() => setScale(s => Math.min(4, s * 1.2))}
          className="w-9 h-9 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(0.2, s / 1.2))}
          className="w-9 h-9 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={fitToContainer}
          className="w-9 h-9 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CustomFloorPlanPage() {
  const { slug, floorIndex: floorIndexStr } = useParams()
  const navigate = useNavigate()
  const floorIndex = parseInt(floorIndexStr ?? '0', 10)

  const [rooms, setRooms] = useState([])
  const [buildingMeta, setBuildingMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const fetchFloor = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'builder_drafts'), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      let found = null
      let foundId = null
      snap.forEach((docSnap) => {
        const data = docSnap.data()
        const draftSlug = data.buildingSlug || data.buildingMeta?.slug
        if (draftSlug === slug && !found) { found = data; foundId = docSnap.id }
      })

      if (!found) { setError('Building not found.'); return }

      setBuildingMeta(found.buildingMeta || {})

      // Try subcollection floors first
      const { getDocs: gd2, collection: col2 } = await import('firebase/firestore')
      const floorsRef = col2(db, `builder_drafts/${foundId}/floors`)
      const floorsSnap = await gd2(floorsRef)
      const subcollectionFloors = {}
      floorsSnap.forEach(fd => { subcollectionFloors[parseInt(fd.id)] = fd.data().rooms || [] })

      const merged = { ...(found.floorsData || {}), ...subcollectionFloors }
      const floorRooms = merged[floorIndex] || found.floorsData?.[floorIndex] || []

      if (!floorRooms || floorRooms.length === 0) {
        setError('No floor data found. Go back and add rooms in Smart Builder.')
        return
      }
      setRooms(floorRooms)
    } catch (err) {
      console.error('[CustomFloorPlanPage] Error:', err)
      setError('Failed to load floor data.')
      toast.error('Failed to load floor data.')
    } finally {
      setIsLoading(false)
    }
  }, [slug, floorIndex])

  useEffect(() => { fetchFloor() }, [fetchFloor])

  const floorLabel = floorIndex === 0 ? 'Ground Floor' : `Floor ${floorIndex}`
  const buildingName = buildingMeta?.name || slug

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(`/custom/${slug}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="min-w-0 truncate font-bold text-zinc-900 dark:text-white font-mono">{buildingName}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="shrink-0 text-zinc-600 dark:text-zinc-400 font-mono">{floorLabel}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { localStorage.setItem('smart_nav_open_draft_slug', slug); navigate('/builder') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit in Builder</span>
            <span className="sm:hidden">Edit</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-zinc-400" />
            <div>
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Floor Not Ready</h3>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
            <button
              onClick={() => { localStorage.setItem('smart_nav_open_draft_slug', slug); navigate('/builder') }}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Open in Smart Builder
            </button>
          </div>
        ) : (
          <CustomFloorCanvas
            rooms={rooms}
            onRoomClick={setSelectedRoom}
          />
        )}
      </div>

      {/* Room Popup */}
      {selectedRoom && (
        <RoomPopup room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  )
}
