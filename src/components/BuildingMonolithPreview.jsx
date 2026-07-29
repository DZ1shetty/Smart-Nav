import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Edit3,
  Save,
  X,
  MapPin,
  FlaskConical,
  Users,
  Building,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock,
  Accessibility,
  Layers,
} from 'lucide-react'
import { floorIdToUrl } from '../utils/slugHelpers'

export default function BuildingMonolithPreview({
  buildingKey,
  theme,
  floors,
  buildingData,
  isLoading,
  isEditing,
  editedData,
  setEditedData,
  handleStartEdit,
  handleCancelEdit,
  handleSaveBuilding,
  handleBackToHome,
  handleImageFileUpload,
}) {
  const navigate = useNavigate()
  const [activeFloorHover, setActiveFloorHover] = useState(null)

  // Map floor ID index to architectural level codes (e.g. L06, L05, L00, B01)
  const getLevelCode = (floorId, index, total) => {
    if (floorId.includes('basement')) return 'B01'
    if (floorId.includes('ground')) return 'L00'
    const match = floorId.match(/first|second|third|fourth|fifth|sixth/)
    if (!match) return `L0${index}`
    const map = {
      first: 'L01',
      second: 'L02',
      third: 'L03',
      fourth: 'L04',
      fifth: 'L05',
      sixth: 'L06',
    }
    return map[match[0]] || `L0${index}`
  }

  // Reverse floors so highest level is at top of monolith tower
  const reversedFloors = [...floors].reverse()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-7xl mx-auto flex flex-col justify-between py-1 px-3 md:px-6 text-[var(--text-main)] select-none"
    >
      {/* TOP CONTROL BAR: BACK + ARCHITECTURAL TITLE + ADMIN CONTROLS */}
      <div className="w-full flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2.5 mb-3">
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-orbitron font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
            BACK
          </span>
        </button>

        {/* Building Title & Floor Count Badge */}
        <div className="flex items-center gap-3">
          <h1
            className={`text-xl md:text-2xl lg:text-3xl font-orbitron font-black tracking-tighter uppercase ${theme.colorClass}`}
          >
            {theme.name}
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-orbitron font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-400 shadow-sm">
            {theme.floors}
          </span>
        </div>

        {/* Admin Edit Controls */}
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold uppercase tracking-wider flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveBuilding}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-black uppercase tracking-wider flex items-center gap-1.5 text-white ${theme.btnBg} shadow-md transition-all active:scale-95`}
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-orbitron font-black uppercase tracking-wider flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-blue-500/40 hover:text-blue-500 transition-all active:scale-95 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Info
            </button>
          )}
        </div>
      </div>

      {/* CENTER MONOLITH EXHIBIT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start my-1">
        {/* LEFT COLUMN: IMAGE, OVERVIEW & 3 CALLOUTS */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {/* Building Photo / Image Showcase */}
          <div className="relative rounded-2xl md:rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/[0.02] aspect-[16/8] max-h-[210px] shadow-lg flex flex-col justify-end group">
            {isEditing ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {editedData?.imageUrl ? (
                  <img
                    src={editedData.imageUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                      PASTE IMAGE URL OR UPLOAD FILE BELOW
                    </span>
                  </div>
                )}
              </div>
            ) : buildingData?.imageUrl ? (
              <img
                src={buildingData.imageUrl}
                alt={buildingData.name || theme.name}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <Building className="w-10 h-10 text-slate-400 mb-1 opacity-40" />
                <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                  ARCHITECTURAL PHOTO SHOWCASE
                </span>
              </div>
            )}
          </div>

          {/* Image Input Controls when isEditing === true */}
          {isEditing && (
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron font-black uppercase tracking-wider text-blue-500 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> BUILDING IMAGE URL / UPLOAD
                </span>
                {editedData?.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditedData({ ...editedData, imageUrl: '' })}
                    className="text-[9px] font-orbitron font-bold text-red-500 hover:underline uppercase"
                  >
                    Clear Image
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input
                    type="text"
                    value={editedData?.imageUrl || ''}
                    onChange={(e) =>
                      setEditedData({ ...editedData, imageUrl: e.target.value })
                    }
                    placeholder="Paste Image URL..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-main)] font-mono"
                  />
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-orbitron font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 whitespace-nowrap">
                  <Upload className="w-3 h-3" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Building Overview Panel */}
          <div className="p-4 md:p-4.5 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-slate-400">
              BUILDING OVERVIEW
            </span>
            {isEditing ? (
              <textarea
                value={editedData?.description || ''}
                onChange={(e) =>
                  setEditedData({ ...editedData, description: e.target.value })
                }
                rows={3}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 focus:border-blue-500 rounded-xl p-2.5 text-xs text-[var(--text-main)] leading-relaxed resize-none"
              />
            ) : (
              <p className="text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {buildingData?.description}
              </p>
            )}
          </div>

          {/* 3 Architectural Callout Cards (Horizontal Grid for Maximum Breathing Room) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Callout 1: Main Entrance */}
            <div className="p-3 md:p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-black/10 dark:border-white/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass} flex-shrink-0`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-orbitron font-black uppercase tracking-wider text-slate-400">
                  ENTRANCE
                </span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedData?.entranceDetails || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      entranceDetails: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-1.5 text-xs text-[var(--text-main)] resize-none"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-medium">
                  {buildingData?.entranceDetails}
                </p>
              )}
            </div>

            {/* Callout 2: Lab Access */}
            <div className="p-3 md:p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-black/10 dark:border-white/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass} flex-shrink-0`}>
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-orbitron font-black uppercase tracking-wider text-slate-400">
                  LAB ACCESS
                </span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedData?.labDetails || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      labDetails: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-1.5 text-xs text-[var(--text-main)] resize-none"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-medium">
                  {buildingData?.labDetails}
                </p>
              )}
            </div>

            {/* Callout 3: Staff Rooms */}
            <div className="p-3 md:p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-black/10 dark:border-white/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10 ${theme.colorClass} flex-shrink-0`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-orbitron font-black uppercase tracking-wider text-slate-400">
                  STAFF ROOMS
                </span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedData?.staffDetails || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      staffDetails: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-1.5 text-xs text-[var(--text-main)] resize-none"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-medium">
                  {buildingData?.staffDetails}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE ARCHITECTURAL LEVEL MONOLITH TOWER */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2.5 px-1">
            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-slate-400">
              STRUCTURAL LEVEL TOWER
            </span>
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase">
              SELECT LEVEL TO OPEN MAP
            </span>
          </div>

          {/* Architectural Slabs Stack */}
          <div className="w-full flex flex-col gap-2">
            {reversedFloors.map((floor, idx) => {
              const levelCode = getLevelCode(floor.id, idx, floors.length)
              const isHovered = activeFloorHover === floor.id

              return (
                <motion.button
                  key={floor.id}
                  onClick={() => navigate(floorIdToUrl(floor.id))}
                  onMouseEnter={() => setActiveFloorHover(floor.id)}
                  onMouseLeave={() => setActiveFloorHover(null)}
                  whileHover={{ scale: 1.012, x: 3 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className={`group relative w-full p-3 md:p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between overflow-hidden shadow-sm ${
                    isHovered
                      ? `${theme.borderClass} bg-white dark:bg-white/[0.08] ${theme.shadowClass}`
                      : 'border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  {/* Subtle Background Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Level Code Slab Tag */}
                  <div className="flex items-center gap-3.5 z-10">
                    <div
                      className={`px-2.5 py-1 rounded-xl text-xs md:text-sm font-orbitron font-black uppercase tracking-widest border transition-colors ${
                        isHovered
                          ? `${theme.bgClass} ${theme.colorClass} ${theme.borderClass}`
                          : 'bg-black/5 dark:bg-white/5 text-slate-400 border-black/10 dark:border-white/10'
                      }`}
                    >
                      {levelCode}
                    </div>

                    {/* Floor Label */}
                    <div className="flex flex-col text-left">
                      <h3
                        className={`text-xs md:text-sm lg:text-base font-orbitron font-black tracking-tight uppercase transition-colors ${
                          isHovered ? theme.colorClass : 'text-[var(--text-main)]'
                        }`}
                      >
                        {floor.label}
                      </h3>
                    </div>
                  </div>

                  {/* Level Action Trigger */}
                  <div className="flex items-center gap-2 z-10">
                    <span
                      className={`text-[10px] font-orbitron font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.colorClass}`}
                    >
                      OPEN MAP
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                        isHovered
                          ? `${theme.btnBg} text-white border-transparent shadow-md scale-105`
                          : 'border-black/10 dark:border-white/10 text-slate-400 bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Useful Campus Utility Bar */}
          <div className="w-full flex items-center justify-start gap-2 mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                ELEVATOR & STAIRS ACCESSIBLE
              </span>
            </div>

            {buildingKey === 'apj' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <Accessibility className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                  WHEELCHAIR RAMP AT ENTRANCE
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
