import { motion } from 'framer-motion'
import RoomBox from '../ui/RoomBox'
import { memo, useMemo } from 'react'

/**
 * Renders the SVG representation of a building floor plan.
 * Handles the outer border geometry and child room rendering.
 */
const DraggableVertex = ({ x, y, index, onDrag, onDragEnd, onDoubleClick, isSnapTarget }) => {
  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0
  const safeY = typeof y === 'number' && !isNaN(y) ? y : 0

  const handlePointerDown = (e) => {
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)

    const svg = e.target.ownerSVGElement
    const startPt = svg.createSVGPoint()
    startPt.x = e.clientX
    startPt.y = e.clientY
    const startSVG = startPt.matrixTransform(svg.getScreenCTM().inverse())

    const startX = safeX
    const startY = safeY

    let lastRan = 0
    const onPointerMove = (moveEvent) => {
      const now = Date.now()
      if (now - lastRan < 16) return // Throttle pointermove to max 60fps (~16ms)
      lastRan = now

      const movePt = svg.createSVGPoint()
      movePt.x = moveEvent.clientX
      movePt.y = moveEvent.clientY
      const moveSVG = movePt.matrixTransform(svg.getScreenCTM().inverse())

      const dx = moveSVG.x - startSVG.x
      const dy = moveSVG.y - startSVG.y

      onDrag(index, Math.round(startX + dx), Math.round(startY + dy))
    }

    const onPointerUp = (upEvent) => {
      try {
        if (e.target.hasPointerCapture && e.target.hasPointerCapture(upEvent.pointerId)) {
          e.target.releasePointerCapture(upEvent.pointerId)
        }
      } catch (err) { /* ignore pointer capture error */ }
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      if (onDragEnd) onDragEnd()
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <g>
      {/* Outer pulsing ring for premium edit feedback */}
      <circle
        cx={String(safeX)}
        cy={String(safeY)}
        r="14"
        fill="transparent"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="4 2"
        className="animate-pulse"
        style={{ pointerEvents: 'none' }}
      />
      {/* Glowing snap target highlight */}
      {isSnapTarget && (
        <circle
          cx={String(safeX)}
          cy={String(safeY)}
          r="22"
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="3"
          className="animate-ping"
          style={{ pointerEvents: 'none', opacity: 0.8 }}
        />
      )}
      <circle
        cx={String(safeX)}
        cy={String(safeY)}
        r={isSnapTarget ? "10" : "8"}
        fill={isSnapTarget ? "#3b82f6" : "#10b981"}
        stroke="#ffffff"
        strokeWidth="2"
        onPointerDown={handlePointerDown}
        onDoubleClick={onDoubleClick}
        style={{ cursor: 'move', touchAction: 'none', transition: 'all 0.15s ease' }}
      />
      <text
        x={x + 12}
        y={y + 4}
        fontSize="10"
        fill={isSnapTarget ? "#3b82f6" : "#10b981"}
        fontWeight="black"
        className="font-orbitron select-none pointer-events-none tracking-widest bg-black/60 px-1 py-0.5 rounded"
      >
        V{index + 1} ({x},{y})
      </text>
    </g>
  )
}

const FloorMapSVG = memo(function FloorMapSVG({
  floorData,
  isEditMode,
  selectedRoomId,
  highlightedRoomId,
  activeSearchIds,
  activeFilters,
  bookmarkedRoomIds = [],
  alignmentGuides = [],
  onVertexDragEnd,
  onRoomMove,
  onRoomResize,
  onRoomClick,
  onBoundaryChange,
  onVertexMove,
  onVertexAdd,
  onVertexDelete,
}) {
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

  // Dynamic Floor-Wide Font Fitting
  const commonFontSize = useMemo(() => {
    const getBaseFontSizeForFitting = (fId) => {
      if (!fId) return 14
      // APJ Block floors (viewBox 1280)
      if (['basement', 'ground', 'first', 'second', 'third', 'fourth', 'fifth'].includes(fId)) {
        return 28
      }
      if (fId.startsWith('cv_raman_')) return 27
      if (fId.startsWith('ramanujan_')) return 54
      if (fId.startsWith('atal_')) return 62
      // SMV Block → 27px for better readability
      if (fId.startsWith('smv_')) return 27
      // SVM legacy alias + Rajraman → 18px
      if (fId.startsWith('svm_') || fId.startsWith('rajraman_')) return 18
      return 18
    }

    const baseSize = getBaseFontSizeForFitting(floorData?.floorId)

    // Bypass text fitting auto-scaler for APJ (28px), CV Raman (27px), and SMV (25px)
    if (
      ['basement', 'ground', 'first', 'second', 'third', 'fourth', 'fifth'].includes(floorData?.floorId) ||
      floorData?.floorId?.startsWith('cv_raman_') ||
      floorData?.floorId?.startsWith('smv_')
    ) {
      return baseSize
    }

    const activeRooms = (floorData?.rooms || []).filter(
      (room) =>
        room.type !== 'corridor' &&
        (isEditMode ||
          (!room.hideOnMap &&
            (activeFilters.length === 0 ||
              activeFilters.some(filter => 
                filter === 'bookmarked' ? bookmarkedRoomIds.includes(room.id) : room.type === filter
              )) &&
            (!activeSearchIds || activeSearchIds.includes(room.id))))
    )

    if (activeRooms.length === 0) return baseSize

    let bestCommonSize = baseSize
    const minSize = Math.max(10, Math.round(baseSize * 0.5))

    for (let testSize = baseSize; testSize >= minSize; testSize--) {
      let allFit = true
      for (const room of activeRooms) {
        const text = room.name || room.label || ''
        const textLength = text.length
        const rW = room.width ?? room.w ?? 0
        const rH = room.height ?? room.h ?? 0
        if (rW <= 0 || rH <= 0) continue

        const approxCharWidth = testSize * 0.52
        const approxTotalWidth = textLength * approxCharWidth
        const availableWidth = rW * 0.92
        const lines = Math.ceil(approxTotalWidth / availableWidth)
        const neededHeight = lines * testSize * 1.25
        const availableHeight = rH * 0.92

        if (neededHeight > availableHeight) {
          allFit = false
          break
        }
      }

      if (allFit) {
        bestCommonSize = testSize
        break
      }
      bestCommonSize = testSize
    }

    return bestCommonSize
  }, [floorData, isEditMode, activeFilters, bookmarkedRoomIds, activeSearchIds])

  // Outer border path calculation
  const borderPath = boundaryVertices.length > 0
    ? 'M ' + boundaryVertices.map(v => `${v.x},${v.y}`).join(' L ') + ' Z'
    : `
      M ${rounded + 5},10 
      L ${mainW - rounded},10 
      Q ${mainW},10 ${mainW},${rounded + 10} 
      L ${mainW},${midY - bH / 2} 
      L ${mainW + bW},${midY - bH / 2} 
      L ${mainW + bW},${midY + bH / 2} 
      L ${mainW},${midY + bH / 2} 
      L ${mainW},${h - rounded} 
      Q ${mainW},${h} ${mainW - rounded},${h} 
      L ${rounded + 5},${h} 
      Q 5,${h} 5,${h - rounded} 
      L 5,${rounded + 10} 
      Q 5,10 ${rounded + 5},10 
      Z
    `

  return (
    <svg
      viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
      className="w-full h-full p-2"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      {/* Background Image Layer (Uploaded Reference) */}
      {floorData?.mapImage && (
        <image
          href={floorData.mapImage}
          x="0"
          y="0"
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid slice"
          opacity={isEditMode ? 0.4 : 0.1}
          style={{ pointerEvents: 'none' }}
        />
      )}

      <g transform="translate(0, 0)">
        {/* Floor Border */}
        <path
          d={borderPath}
          fill="none"
          stroke={
            isEditMode ? 'rgba(16, 185, 129, 0.7)' : 'var(--boundary-stroke)'
          }
          strokeWidth={isEditMode ? '4' : '3'}
          strokeDasharray={isEditMode ? '12 6' : '10 5'}
        />

        {/* Alignment Snapping Guides */}
        {isEditMode && alignmentGuides && alignmentGuides.length > 0 && (
          <g>
            {alignmentGuides.map((guide, idx) => {
              if (guide.type === 'vertical') {
                return (
                  <line
                    key={`guide-${idx}`}
                    x1={guide.x}
                    y1={guide.y1}
                    x2={guide.x}
                    y2={guide.y2}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    style={{ pointerEvents: 'none' }}
                  />
                )
              } else {
                return (
                  <line
                    key={`guide-${idx}`}
                    x1={guide.x1}
                    y1={guide.y}
                    x2={guide.x2}
                    y2={guide.y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    style={{ pointerEvents: 'none' }}
                  />
                )
              }
            })}
          </g>
        )}

        {/* Custom Vertex Boundary Handles (Edit Mode only for all buildings) */}
        {isEditMode && boundaryVertices.length > 0 && onVertexMove && (
          <g>
            {boundaryVertices.map((vertex, index) => {
              const isSnapTarget = alignmentGuides?.some(
                (g) => g.targetIndex === index
              )
              const safeX = typeof vertex?.x === 'number' && !isNaN(vertex.x) ? vertex.x : 0
              const safeY = typeof vertex?.y === 'number' && !isNaN(vertex.y) ? vertex.y : 0
              return (
                <DraggableVertex
                  key={index}
                  x={safeX}
                  y={safeY}
                  index={index}
                  onDrag={onVertexMove}
                  onDragEnd={onVertexDragEnd}
                  isSnapTarget={isSnapTarget}
                  onDoubleClick={() => onVertexDelete && onVertexDelete(index)}
                />
              )
            })}
          </g>
        )}

        {/* Segment Midpoint Plus Handles for Dynamic Spoke Splitting */}
        {isEditMode && boundaryVertices.length > 0 && onVertexAdd && (
          <g>
            {boundaryVertices.map((vertex, index) => {
              const nextVertex =
                boundaryVertices[(index + 1) % boundaryVertices.length]
              const vx1 = typeof vertex?.x === 'number' && !isNaN(vertex.x) ? vertex.x : 0
              const vy1 = typeof vertex?.y === 'number' && !isNaN(vertex.y) ? vertex.y : 0
              const vx2 = typeof nextVertex?.x === 'number' && !isNaN(nextVertex.x) ? nextVertex.x : 0
              const vy2 = typeof nextVertex?.y === 'number' && !isNaN(nextVertex.y) ? nextVertex.y : 0

              const midX = Math.round((vx1 + vx2) / 2)
              const midY = Math.round((vy1 + vy2) / 2)
              return (
                <g
                  key={`mid-${index}`}
                  onClick={() =>
                    onVertexAdd(
                      (index + 1) % boundaryVertices.length,
                      midX,
                      midY
                    )
                  }
                  className="cursor-pointer group"
                >
                  <circle
                    cx={String(midX)}
                    cy={String(midY)}
                    r="7"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-150 transform origin-center group-hover:scale-125"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    fontSize="11"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontWeight="black"
                    className="font-orbitron select-none pointer-events-none"
                  >
                    +
                  </text>
                </g>
              )
            })}
          </g>
        )}

        {/* Rooms */}
        {floorData?.rooms &&
          floorData.rooms
            .filter(
              (room) =>
                room.type !== 'corridor' &&
                (isEditMode ||
                  (!room.hideOnMap &&
                    (activeFilters.length === 0 ||
                      activeFilters.some(filter => 
                        filter === 'bookmarked' ? bookmarkedRoomIds.includes(room.id) : room.type === filter
                      )) &&
                    (!activeSearchIds || activeSearchIds.includes(room.id))))
            )
            .map((room) => {
              return (
                <RoomBox
                  key={room.id}
                  room={room}
                  floorId={floorData?.floorId}
                  isSelected={selectedRoomId === room.id}
                  isHighlighted={highlightedRoomId === room.id && selectedRoomId !== room.id}
                  isEditMode={isEditMode}
                  onMove={onRoomMove}
                  onResize={onRoomResize}
                  onClick={() => onRoomClick(room)}
                  commonFontSize={commonFontSize}
                />
              )
            })}
      </g>
    </svg>
  )
})

export default FloorMapSVG
