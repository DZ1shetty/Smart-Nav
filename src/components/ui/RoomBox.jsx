import { memo, useState } from 'react'

const TYPE_COLORS = {
  classroom: '#3b82f6', // blue
  lab: '#22c55e', // green
  staffroom: '#facc15', // yellow
  hod: '#f97316', // orange
  office: '#14b8a6', // teal (office)
  utility: '#9ca3af', // gray
  hall: '#ef4444', // red
  corridor: 'transparent',
}

// --- SVG COORD LABEL COMPONENT (Prevents foreignObject clipping) ---
const InfoLabelSVG = ({ rx, ry, w, floorId, text, isHighlighted }) => {
  const isLargeViewBox =
    floorId?.startsWith('cv_raman_') ||
    floorId?.startsWith('ramanujan_') ||
    floorId?.startsWith('smv_') ||
    floorId?.startsWith('svm_') ||
    floorId?.startsWith('rajraman_') ||
    ['basement', 'ground', 'first', 'second', 'third', 'fourth', 'fifth'].includes(floorId)
  const isAtal = floorId?.startsWith('atal_')

  let fontSize = 10
  let arrowSize = 10
  let tipOffset = 6

  if (isAtal) {
    fontSize = 32
    arrowSize = 32
    tipOffset = 16
  } else if (isLargeViewBox) {
    fontSize = 18
    arrowSize = 20
    tipOffset = 10
  }

  const textX = rx + w / 2
  const arrowTipY = ry - tipOffset
  const arrowBaseY = arrowTipY - arrowSize
  const textY = arrowBaseY - (fontSize * 0.5)

  // Vibe matching cyan for the arrow
  const color = '#00eaff'

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Sleek, solid triangle arrow pointing down */}
      <path
        d={`M ${textX} ${arrowTipY} L ${textX - arrowSize * 0.6} ${arrowBaseY} L ${textX + arrowSize * 0.6} ${arrowBaseY} Z`}
        fill={color}
      />
      {text !== undefined && text !== '' && (
        <text
          x={textX}
          y={textY}
          fill={color}
          fontSize={fontSize}
          fontFamily="var(--font-main, sans-serif)"
          fontWeight="600"
          letterSpacing="0.05em"
          textAnchor="middle"
        >
          {text.toUpperCase()}
        </text>
      )}
      {text === undefined && (
        <text
          x={textX}
          y={textY}
          fill={color}
          fontSize={fontSize}
          fontFamily="monospace"
          textAnchor="middle"
        >
          ({Math.round(rx)}, {Math.round(ry)})
        </text>
      )}
    </g>
  )
}

// --- STATIC BOX (VIEW MODE) ---
const StaticRoom = ({ room, onClick, isSelected, isHighlighted, floorId, commonFontSize }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isCorridor = room.type === 'corridor'
  const isConnection = !!room.linkToFloor
  const color = isConnection ? '#a855f7' : (TYPE_COLORS[room.type] || '#ffffff')
  const c = 6
  const w = room.width ?? room.w ?? 0
  const h = room.height ?? room.h ?? 0
  const rx = room.x ?? 0
  const ry = room.y ?? 0

  // Clickability Logic: Filter out stairs, lifts, washrooms, and exits
  const isUtilityExcluded =
    room.name?.toLowerCase().includes('stairs') ||
    room.name?.toLowerCase().includes('lift') ||
    room.name?.toLowerCase().includes('washroom') ||
    room.name?.toLowerCase().includes('exit') ||
    room.id?.toLowerCase().includes('stairs') ||
    room.id?.toLowerCase().includes('lift') ||
    room.id?.toLowerCase().includes('washroom') ||
    room.id?.toLowerCase().includes('exit')

  const isClickable =
    !isCorridor && !isUtilityExcluded && room.clickable !== false

  const r = Math.min(12, w / 2, h / 2)
  const roomPath = isConnection
    ? `
    M ${rx + r} ${ry}
    H ${rx + w - r}
    A ${r} ${r} 0 0 1 ${rx + w} ${ry + r}
    V ${ry + h - r}
    A ${r} ${r} 0 0 1 ${rx + w - r} ${ry + h}
    H ${rx + r}
    A ${r} ${r} 0 0 1 ${rx} ${ry + h - r}
    V ${ry + r}
    A ${r} ${r} 0 0 1 ${rx + r} ${ry}
    Z
  `
    : `
    M ${rx + c} ${ry}
    H ${rx + w - c} 
    L ${rx + w} ${ry + c}
    V ${ry + h - c}
    L ${rx + w - c} ${ry + h}
    H ${rx + c}
    L ${rx} ${ry + h - c}
    V ${ry + c}
    Z
  `

  const safeId = room.id ? room.id.replace(/[^a-zA-Z0-9-_]/g, '_') : 'room'

  return (
    <g
      className="group"
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {!isCorridor && !isConnection && (
        <path
          d={roomPath}
          fill={color}
          opacity={isSelected ? '0.35' : '0.12'}
          className="transition-all duration-300"
        />
      )}

      {/* Pulsing highlight ring for active selected state only */}
      {isSelected && !isCorridor && !isConnection && (
        <path
          d={roomPath}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeOpacity="0.4"
          className="animate-pulse"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <path
        d={roomPath}
        fill={isCorridor ? 'var(--room-corridor)' : (isConnection ? '#a855f7' : 'var(--room-bg)')}
        stroke={isCorridor ? 'var(--blueprint-line)' : color}
        strokeOpacity={isCorridor ? 0.5 : isSelected ? 1 : 0.8}
        strokeWidth={isCorridor ? '1' : isConnection ? '2' : isSelected ? '3' : '2'}
        strokeDasharray={isCorridor ? '4 4' : '0'}
        className={isConnection ? "" : "transition-all duration-300"}
      />

      {!isCorridor && (
        <RoomLabel
          room={room}
          w={w}
          h={h}
          color={color}
          isConnection={isConnection}
          floorId={floorId}
          commonFontSize={commonFontSize}
        />
      )}
      {(isHovered || isSelected || isHighlighted) && !isCorridor && (
        <InfoLabelSVG 
          rx={rx} 
          ry={ry} 
          w={w} 
          floorId={floorId} 
          isHighlighted={isHighlighted}
          text={isHighlighted && !isSelected ? "" : undefined}
        />
      )}
    </g>
  )
}

// --- DRAGGABLE BOX (EDIT MODE ONLY) ---
const DraggableRoom = ({ room, onMove, onResize, floorId, commonFontSize }) => {
  const isCorridor = room.type === 'corridor'
  const isConnection = !!room.linkToFloor
  const color = isConnection ? '#a855f7' : (TYPE_COLORS[room.type] || '#ffffff')
  const c = 6
  const w = room.width ?? room.w ?? 0
  const h = room.height ?? room.h ?? 0
  const rx = room.x ?? 0
  const ry = room.y ?? 0

  // Custom Pointer Events for 1:1 Pixel Accuracy
  const handlePointerDown = (e) => {
    if (isCorridor) return
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)

    const svg = e.target.ownerSVGElement
    const startPt = svg.createSVGPoint()
    startPt.x = e.clientX
    startPt.y = e.clientY
    const startSVG = startPt.matrixTransform(svg.getScreenCTM().inverse())

    const startRoomX = room.x
    const startRoomY = room.y

    let lastRanMove = 0
    const onPointerMove = (moveEvent) => {
      const now = Date.now()
      if (now - lastRanMove < 16) return // Throttle pointermove to max 60fps (~16ms)
      lastRanMove = now

      const movePt = svg.createSVGPoint()
      movePt.x = moveEvent.clientX
      movePt.y = moveEvent.clientY
      const moveSVG = movePt.matrixTransform(svg.getScreenCTM().inverse())

      const dx = moveSVG.x - startSVG.x
      const dy = moveSVG.y - startSVG.y

      onMove(room.id, Math.round(startRoomX + dx), Math.round(startRoomY + dy))
    }

    const onPointerUp = (upEvent) => {
      e.target.releasePointerCapture(upEvent.pointerId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const handleResizePointerDown = (e) => {
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)

    const svg = e.target.ownerSVGElement
    const startPt = svg.createSVGPoint()
    startPt.x = e.clientX
    startPt.y = e.clientY
    const startSVG = startPt.matrixTransform(svg.getScreenCTM().inverse())

    const startRoomW = w
    const startRoomH = h

    let lastRanResize = 0
    const onPointerMove = (moveEvent) => {
      const now = Date.now()
      if (now - lastRanResize < 16) return // Throttle pointermove to max 60fps (~16ms)
      lastRanResize = now

      const movePt = svg.createSVGPoint()
      movePt.x = moveEvent.clientX
      movePt.y = moveEvent.clientY
      const moveSVG = movePt.matrixTransform(svg.getScreenCTM().inverse())

      const dx = moveSVG.x - startSVG.x
      const dy = moveSVG.y - startSVG.y

      onResize(
        room.id,
        Math.max(20, Math.round(startRoomW + dx)),
        Math.max(20, Math.round(startRoomH + dy))
      )
    }

    const onPointerUp = (upEvent) => {
      e.target.releasePointerCapture(upEvent.pointerId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const r = Math.min(12, w / 2, h / 2)
  const roomPath = isConnection
    ? `
    M ${rx + r} ${ry}
    H ${rx + w - r}
    A ${r} ${r} 0 0 1 ${rx + w} ${ry + r}
    V ${ry + h - r}
    A ${r} ${r} 0 0 1 ${rx + w - r} ${ry + h}
    H ${rx + r}
    A ${r} ${r} 0 0 1 ${rx} ${ry + h - r}
    V ${ry + r}
    A ${r} ${r} 0 0 1 ${rx + r} ${ry}
    Z
  `
    : `
    M ${rx + c} ${ry}
    H ${rx + w - c} 
    L ${rx + w} ${ry + c}
    V ${ry + h - c}
    L ${rx + w - c} ${ry + h}
    H ${rx + c}
    L ${rx} ${ry + h - c}
    V ${ry + c}
    Z
  `

  const safeId = room.id ? room.id.replace(/[^a-zA-Z0-9-_]/g, '_') : 'room'

  return (
    <g>
      {/* Edit Mode Bounding Box & Draggable Area */}
      <rect
        x={room.x - 4}
        y={room.y - 4}
        width={w + 8}
        height={h + 8}
        fill="transparent"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4 4"
        className={isConnection ? "" : "animate-pulse"}
        onPointerDown={handlePointerDown}
        style={{
          cursor: !isCorridor ? 'move' : 'default',
          touchAction: 'none',
        }}
      />

      <path
        d={roomPath}
        fill={isConnection ? '#a855f7' : 'var(--room-bg)'}
        stroke={color}
        strokeWidth={isConnection ? '2' : '2'}
        strokeDasharray="0"
        style={{ pointerEvents: 'none' }}
      />

      <RoomLabel room={room} w={w} h={h} color={color} isConnection={isConnection} floorId={floorId} commonFontSize={commonFontSize} />
      {!isCorridor && (
        <InfoLabelSVG rx={rx} ry={ry} w={w} floorId={floorId} />
      )}

      {/* Resize Handle */}
      <rect
        x={room.x + w - 12}
        y={room.y + h - 12}
        width="12"
        height="12"
        fill={color}
        className="cursor-nwse-resize"
        onPointerDown={handleResizePointerDown}
        style={{ touchAction: 'none' }}
      />
    </g>
  )
}

const getLabelFontSize = (floorId) => {
  if (!floorId) return '14px'

  // APJ Block floors (viewBox 1280)
  if (['basement', 'ground', 'first', 'second', 'third', 'fourth', 'fifth'].includes(floorId)) {
    return '28px'
  }

  // Ramanujan Block (viewBox ~3800) -> 18px physical size scales to 54px in SVG coordinate space
  if (floorId.startsWith('ramanujan_')) {
    return '54px'
  }

  // Atal Block (viewBox ~4400) -> 18px physical size scales to 62px in SVG coordinate space
  if (floorId.startsWith('atal_')) {
    return '62px'
  }

  // CV-Raman Block
  if (floorId.startsWith('cv_raman_')) {
    return '27px'
  }

  // SMV Block (viewBox ~1280) -> 27px for better readability
  if (floorId.startsWith('smv_')) {
    return '27px'
  }

  // SVM legacy alias + V. Rajraman Block
  if (floorId.startsWith('svm_') || floorId.startsWith('rajraman_')) {
    return '18px'
  }

  return '18px'
}

const RoomLabel = ({ room, w, h, color, isConnection, floorId, commonFontSize }) => {
  const baseFontSize = getLabelFontSize(floorId)
  let fontSizeNum = parseInt(baseFontSize)

  if (isConnection) {
    const text = room.name || room.label || ''
    const textLength = text.length
    let bestSize = 14
    const maxLimit = parseInt(baseFontSize)

    for (let testSize = maxLimit; testSize >= 14; testSize--) {
      const approxCharWidth = testSize * 0.52
      const approxTotalWidth = textLength * approxCharWidth
      const availableWidth = w * 0.92
      const lines = Math.ceil(approxTotalWidth / availableWidth)
      const neededHeight = lines * testSize * 1.25
      const availableHeight = h * 0.92

      if (neededHeight <= availableHeight) {
        bestSize = testSize
        break
      }
    }
    fontSizeNum = bestSize
  }

  const isApj = ['basement', 'ground', 'first', 'second', 'third', 'fourth', 'fifth'].includes(floorId)
  const isCvRaman = floorId?.startsWith('cv_raman_')

  const fontSizeStr = isApj
    ? '28px'
    : (isCvRaman
        ? '27px'
        : (isConnection
            ? `${fontSizeNum}px`
            : (typeof commonFontSize === 'number'
                ? `${commonFontSize}px`
                : (baseFontSize.endsWith('px') ? baseFontSize : `${baseFontSize}px`))))

  return (
    <foreignObject
      x={room.x ?? 0}
      y={room.y ?? 0}
      width={w}
      height={h}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <div className="w-full h-full flex items-center justify-center p-1">
        {isConnection ? (
          <div
            className="flex items-center justify-center text-white"
            style={{
              fontFamily: 'var(--font-main)',
              fontSize: fontSizeStr,
              fontWeight: 'var(--box-font-weight)',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              maxWidth: '95%',
              maxHeight: '95%',
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              padding: '4px',
            }}
          >
            <span>{room.name || room.label}</span>
          </div>
        ) : (
          <div className="box-label" style={{ color: color, fontSize: fontSizeStr }}>
            <span>{room.name || room.label}</span>
          </div>
        )}
      </div>
    </foreignObject>
  )
}

const RoomBox = ({
  room,
  floorId,
  isEditMode,
  onMove,
  onResize,
  onClick,
  isSelected,
  isHighlighted,
  commonFontSize,
}) => {
  return isEditMode ? (
    <DraggableRoom room={room} floorId={floorId} onMove={onMove} onResize={onResize} commonFontSize={commonFontSize} />
  ) : (
    <StaticRoom room={room} floorId={floorId} onClick={onClick} isSelected={isSelected} isHighlighted={isHighlighted} commonFontSize={commonFontSize} />
  )
}

export default memo(RoomBox)
