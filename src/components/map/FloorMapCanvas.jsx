import { useEffect, useRef, useMemo, useCallback } from 'react'

const TYPE_COLORS = {
  classroom: '#3b82f6',
  lab: '#22c55e',
  staffroom: '#facc15',
  hod: '#f97316',
  office: '#14b8a6',
  utility: '#9ca3af',
  hall: '#ef4444',
  corridor: 'transparent',
}

/**
 * High-Performance HTML5 Canvas Renderer for Floor Plans.
 * Renders floor boundary geometry, rooms, labels, and selection highlights
 * on a single GPU-accelerated HTML5 2D Canvas context.
 */
export default function FloorMapCanvas({
  floorData,
  isEditMode,
  selectedRoomId,
  highlightedRoomId,
  activeSearchIds,
  activeFilters,
  bookmarkedRoomIds = [],
  alignmentGuides = [],
  onRoomClick,
  onRoomMove,
  onRoomResize,
  onVertexMove,
  onVertexDragEnd,
  onVertexAdd,
  onVertexDelete,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const { viewWidth, viewHeight, mainWidth, bulgeWidth, bulgeHeight, mapBounds } =
    floorData || {}
  const w = viewWidth || 640
  const h = viewHeight || 663
  const mainW = mainWidth || 455
  const bW = bulgeWidth || 165
  const bH = bulgeHeight || 200
  const midY = h / 2
  const rounded = 40

  const boundaryVertices = floorData?.boundaryVertices || []

  // Bounding box for exact rendering and scaling
  const minX = mapBounds ? mapBounds.minX : 0
  const minY = mapBounds ? mapBounds.minY : 0
  const svgW = mapBounds ? mapBounds.svgW : w
  const svgH = mapBounds ? mapBounds.svgH : h

  // Filter visible active rooms based on search, category filters, and edit mode
  const activeRooms = useMemo(() => {
    return (floorData?.rooms || []).filter(
      (room) =>
        room.type !== 'corridor' &&
        (isEditMode ||
          (!room.hideOnMap &&
            (activeFilters.length === 0 ||
              activeFilters.some((filter) =>
                filter === 'bookmarked'
                  ? bookmarkedRoomIds.includes(room.id)
                  : room.type === filter
              )) &&
            (!activeSearchIds || activeSearchIds.includes(room.id))))
    )
  }, [floorData, isEditMode, activeFilters, bookmarkedRoomIds, activeSearchIds])

  // Canvas Drawing Loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const devicePixelRatio = window.devicePixelRatio || 1
    const displayW = canvas.clientWidth || svgW
    const displayH = canvas.clientHeight || svgH

    canvas.width = displayW * devicePixelRatio
    canvas.height = displayH * devicePixelRatio

    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, displayW, displayH)

    // Calculate scaling transform to map (minX, minY, svgW, svgH) to (0, 0, displayW, displayH)
    const scaleX = displayW / svgW
    const scaleY = displayH / svgH
    const scale = Math.min(scaleX, scaleY)

    const offsetX = (displayW - svgW * scale) / 2
    const offsetY = (displayH - svgH * scale) / 2

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)
    ctx.translate(-minX, -minY)

    // 1. Draw Outer Floor Boundary
    ctx.beginPath()
    if (boundaryVertices.length > 0) {
      boundaryVertices.forEach((v, idx) => {
        if (idx === 0) ctx.moveTo(v.x, v.y)
        else ctx.lineTo(v.x, v.y)
      })
      ctx.closePath()
    } else {
      ctx.moveTo(rounded + 5, 10)
      ctx.lineTo(mainW - rounded, 10)
      ctx.quadraticCurveTo(mainW, 10, mainW, rounded + 10)
      ctx.lineTo(mainW, midY - bH / 2)
      ctx.lineTo(mainW + bW, midY - bH / 2)
      ctx.lineTo(mainW + bW, midY + bH / 2)
      ctx.lineTo(mainW, midY + bH / 2)
      ctx.lineTo(mainW, h - rounded)
      ctx.quadraticCurveTo(mainW, h, mainW - rounded, h)
      ctx.lineTo(rounded + 5, h)
      ctx.quadraticCurveTo(5, h, 5, h - rounded)
      ctx.lineTo(5, rounded + 10)
      ctx.quadraticCurveTo(5, 10, rounded + 5, 10)
      ctx.closePath()
    }

    ctx.lineWidth = isEditMode ? 4 : 3
    ctx.strokeStyle = isEditMode ? '#10b981' : '#3b82f6'
    ctx.setLineDash(isEditMode ? [12, 6] : [10, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // 2. Draw Rooms
    activeRooms.forEach((room) => {
      const rx = room.x ?? 0
      const ry = room.y ?? 0
      const rw = room.width ?? room.w ?? 0
      const rh = room.height ?? room.h ?? 0
      const isSelected = selectedRoomId === room.id || highlightedRoomId === room.id
      const isConnection = !!room.linkToFloor
      const color = isConnection ? '#a855f7' : TYPE_COLORS[room.type] || '#3b82f6'

      ctx.save()

      // Room Fill
      ctx.fillStyle = isSelected ? `${color}44` : `${color}22`
      ctx.fillRect(rx, ry, rw, rh)

      // Room Border
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.strokeStyle = isSelected ? '#3b82f6' : color
      ctx.strokeRect(rx, ry, rw, rh)

      // Selection Glow Box
      if (isSelected) {
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 12
        ctx.strokeStyle = '#60a5fa'
        ctx.strokeRect(rx - 2, ry - 2, rw + 4, rh + 4)
        ctx.shadowBlur = 0
      }

      // Room Text Label
      const title = room.name || room.label || ''
      if (title && rw > 20 && rh > 15) {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(title, rx + rw / 2, ry + rh / 2, rw - 8)
      }

      ctx.restore()
    })

    // 3. Draw Edit Mode Alignment Guides
    if (isEditMode && alignmentGuides && alignmentGuides.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      alignmentGuides.forEach((g) => {
        ctx.beginPath()
        if (g.type === 'vertical') {
          ctx.moveTo(g.x, g.y1)
          ctx.lineTo(g.x, g.y2)
        } else {
          ctx.moveTo(g.x1, g.y)
          ctx.lineTo(g.x2, g.y)
        }
        ctx.stroke()
      })
      ctx.setLineDash([])
    }

    // 4. Draw Vertex Handles (Edit Mode)
    if (isEditMode && boundaryVertices.length > 0) {
      boundaryVertices.forEach((v, index) => {
        ctx.beginPath()
        ctx.arc(v.x, v.y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = '#10b981'
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
      })
    }

    ctx.restore()
  }, [
    activeRooms,
    alignmentGuides,
    boundaryVertices,
    bH,
    bW,
    h,
    highlightedRoomId,
    isEditMode,
    mainW,
    minX,
    minY,
    rounded,
    selectedRoomId,
    svgH,
    svgW,
  ])

  // Redraw when properties change or window resizes
  useEffect(() => {
    let animId
    const handleDraw = () => {
      animId = requestAnimationFrame(drawCanvas)
    }
    handleDraw()
    window.addEventListener('resize', handleDraw)
    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleDraw)
    }
  }, [drawCanvas])

  // Canvas Click Handler (Hit Testing)
  const handleCanvasClick = (e) => {
    if (!onRoomClick) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    const displayW = canvas.clientWidth || svgW
    const displayH = canvas.clientHeight || svgH

    const scaleX = displayW / svgW
    const scaleY = displayH / svgH
    const scale = Math.min(scaleX, scaleY)

    const offsetX = (displayW - svgW * scale) / 2
    const offsetY = (displayH - svgH * scale) / 2

    const clickX = (e.clientX - rect.left - offsetX) / scale + minX
    const clickY = (e.clientY - rect.top - offsetY) / scale + minY

    // Find clicked room
    const clickedRoom = activeRooms.find((room) => {
      const rx = room.x ?? 0
      const ry = room.y ?? 0
      const rw = room.width ?? room.w ?? 0
      const rh = room.height ?? room.h ?? 0
      return (
        clickX >= rx &&
        clickX <= rx + rw &&
        clickY >= ry &&
        clickY <= ry + rh
      )
    })

    if (clickedRoom) {
      onRoomClick(clickedRoom)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full p-2 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer touch-none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
