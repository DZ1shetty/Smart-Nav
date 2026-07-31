import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useSearchWorker } from '../../hooks/useSearchWorker'
import {
  Search,
  MapPin,
  X,
  User,
  Volume2,
  AlertCircle,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  FlaskConical,
  BookOpen,
  Zap,
  ChevronRight,
  Navigation,
  Award,
  Wrench,
  Mic,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

import { resolveNavigationQuery, updateSearchData } from '../../data/searchEngine'
import { trackSearch } from '../../utils/analytics'

// ─── ICON PER TYPE ────────────────────────────────────────────────────────────
const TypeIcon = ({ type, size = 14 }) => {
  const p = { width: size, height: size, strokeWidth: 1.8 }
  if (type === 'faculty') return <User {...p} />
  if (type === 'lab') return <FlaskConical {...p} />
  if (type === 'classroom') return <BookOpen {...p} />
  if (type === 'staffroom' || type === 'hod') return <User {...p} />
  if (type === 'utility') return <Zap {...p} />
  return <MapPin {...p} />
}

// ─── COLOR MAP ────────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  faculty: {
    ring: '#8b5cf6',
    pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    icon: 'bg-violet-500/20 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400',
  },
  lab: {
    ring: '#10b981',
    pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: 'bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  classroom: {
    ring: '#3b82f6',
    pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    icon: 'bg-blue-500/20 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  staffroom: {
    ring: '#f59e0b',
    pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: 'bg-amber-500/20 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  hod: {
    ring: '#ef4444',
    pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    icon: 'bg-rose-500/20 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
  },
  office: {
    ring: '#14b8a6',
    pill: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    icon: 'bg-teal-500/20 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',
  },
  utility: {
    ring: '#6b7280',
    pill: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    icon: 'bg-zinc-500/20 dark:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400',
  },
}
const getColor = (tags = []) => {
  for (const t of tags) if (TYPE_COLOR[t]) return TYPE_COLOR[t]
  return TYPE_COLOR.utility
}
const getType = (tags = []) => {
  const types = ['faculty', 'lab', 'classroom', 'staffroom', 'hod', 'office', 'utility']
  return tags.find((t) => types.includes(t)) || 'utility'
}

// ─── RESULT ROW (compact) ─────────────────────────────────────────────────────
const ResultRow = ({ item, isSelected, onSelect, onHover }) => {
  const color = getColor(item.category_tags)
  const type = getType(item.category_tags)
  const floor = item._floorLabel?.toUpperCase().replace(' FLOOR', '') || ''

  // Infer building name from floor key
  const floorKey = item.floorKey || item._floorKey || ''
  const buildingLabel = 
    floorKey.startsWith('cv_raman_') ? 'CV-RAMAN' :
    floorKey.startsWith('ramanujan_') ? 'RAMANUJAN' :
    floorKey.startsWith('smv_') || floorKey.startsWith('svm_') ? 'SMV BLOCK' :
    floorKey.startsWith('atal_') ? 'ATAL BLOCK' :
    floorKey.startsWith('rajraman_') ? 'V. RAJRAMAN' :
    'APJ BLOCK'

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(item)}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 text-left group
        ${isSelected 
          ? 'bg-blue-500/10 dark:bg-white/[0.08] shadow-sm border border-blue-500/30 dark:border-white/10' 
          : 'hover:bg-slate-100/70 dark:hover:bg-white/[0.04] border border-transparent'
        }`}
    >
      {/* icon wrapper */}
      <div
        className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-200 
          ${isSelected 
            ? color.icon 
            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/50'
          }`}
      >
        <TypeIcon type={type} size={16} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-[14px] font-bold truncate transition-colors duration-150 
              ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-white/80'}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {item.title}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-orbitron font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/50 dark:text-white/40">
            {buildingLabel}
          </span>
        </div>
        <div
          className={`text-[12px] truncate capitalize transition-colors duration-150 
            ${isSelected ? 'text-slate-600 dark:text-white/50' : 'text-slate-500 dark:text-white/35'}`}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {item.description}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {floor && (
          <span
            className={`text-xs font-orbitron font-black px-2.5 py-1 rounded-lg tracking-wider transition-colors duration-150 uppercase
              ${isSelected ? color.pill : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40'}`}
          >
            {floor}
          </span>
        )}
        {isSelected ? (
          <CornerDownLeft className="w-4 h-4 text-blue-500 dark:text-cyan-400 animate-pulse" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-2px] group-hover:translate-x-0" />
        )}
      </div>
    </button>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SearchSystem = ({ onResultsChange, onSearchFocus, currentFloor }) => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const { resolveQueryAsync } = useSearchWorker()
  const [resolution, setResolution] = useState(null)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isResolving, setIsResolving] = useState(false)

  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const [dbLayouts, setDbLayouts] = useState(null)

  // ── Firestore real-time sync ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'layouts'),
      (snap) => {
        const data = {}
        snap.forEach((doc) => {
          const d = doc.data()
          if (d.floorId) data[d.floorId] = d
        })
        updateSearchData(data)
        setDbLayouts(data)
      },
      (err) => {
        console.error("Error subscribing to layouts for search indexing:", err)
      }
    )
    return () => unsubscribe()
  }, [])


  // ── Debounced Search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResolution(null)
      setIsResolving(false)
      if (onResultsChange) onResultsChange(null)
      return
    }
    setIsResolving(true)
  }, [query, onResultsChange])

  useEffect(() => {
    let isCurrent = true
    if (!debouncedQuery.trim()) {
      setResolution(null)
      setIsResolving(false)
      return
    }

    resolveQueryAsync(debouncedQuery, currentFloor, dbLayouts).then((result) => {
      if (!isCurrent) return
      setResolution(result)
      setIsResolving(false)
      setSelectedIndex(0)

      if (onResultsChange) {
        if (result && result.confidence_score >= 20) {
          onResultsChange(
            [result.id, ...(result.alternatives?.map((a) => a.id) || [])].filter(
              Boolean
            )
          )
        } else {
          onResultsChange(null)
        }
      }
    })

    return () => {
      isCurrent = false
    }
  }, [debouncedQuery, currentFloor, onResultsChange, resolveQueryAsync, dbLayouts])

  // ── Focus pass-through ──────────────────────────────────────────────────────
  useEffect(() => {
    if (onSearchFocus) onSearchFocus(isFocused)
  }, [isFocused, onSearchFocus])

  // ── Click outside ───────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsFocused(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const allResults = resolution
    ? [resolution, ...(resolution.alternatives || [])]
    : []

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (allResults[selectedIndex]) handleSelect(allResults[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleSelect = useCallback(
    (item) => {
      if (!item?.url) return
      trackSearch(query || item.title, allResults.length)
      navigate(item.url)
      setQuery('')
      setIsFocused(false)
      inputRef.current?.blur()
    },
    [navigate, query, allResults]
  )

  const handleSpeak = (e, item) => {
    e.stopPropagation()
    window.speechSynthesis?.cancel()
    window.speechSynthesis?.speak(
      new SpeechSynthesisUtterance(
        `${item.title}. ${item.description}. Directions: ${item.directions}`
      )
    )
  }

  const topColor = resolution
    ? getColor(resolution.category_tags)
    : TYPE_COLOR.utility
  const topType = resolution ? getType(resolution.category_tags) : 'utility'

  return (
    <div
      ref={searchRef}
      className="relative w-full max-w-[640px] mx-auto z-[200]"
    >
      {/* ── Spotlight Backdrop Sheet ── */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/15 dark:bg-black/55 backdrop-blur-[3px] z-[-1] pointer-events-auto cursor-default"
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <div
          className={`relative flex items-center transition-all duration-350 ease-out border
            ${isFocused
              ? 'bg-white dark:bg-[#303134] border-transparent shadow-[0_4px_24px_rgba(32,33,36,0.28)] dark:shadow-[0_6px_32px_rgba(0,0,0,0.65)] rounded-t-[20px] rounded-b-none border-b border-slate-100 dark:border-zinc-700/30 scale-[1.01]'
              : 'bg-white dark:bg-[#202124] border-slate-200 dark:border-zinc-700/50 shadow-[0_2px_10px_rgba(32,33,36,0.18)] hover:shadow-[0_4px_16px_rgba(32,33,36,0.25)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_22px_rgba(0,0,0,0.6)] rounded-full hover:bg-white hover:dark:bg-[#303134]'
            }`}
          style={{
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          {/* search icon */}
          <div className="pl-4 pr-2.5 flex-shrink-0 transition-all duration-300">
            {isResolving ? (
              <div className="w-[18px] h-[18px] border-2 border-slate-300 dark:border-zinc-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
            ) : (
              <Search
                className={`w-[18px] h-[18px] transition-all duration-300 ${isFocused ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-500 dark:text-zinc-500'}`}
              />
            )}
          </div>

          {/* input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search campus blocks, rooms or staff..."
            aria-label="Search campus blocks, rooms or staff"
            className="w-full py-[9px] md:py-[11px] bg-transparent outline-none text-[14px] md:text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500"
            style={{
              fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
              fontWeight: 500,
            }}
          />


          {/* Google-style Action Cluster: Clear (X) + Keyboard guide */}
          <div className="flex items-center gap-1.5 pr-4 flex-shrink-0 z-10">
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.1 }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  aria-label="Clear search input"
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X className="w-[16px] h-[16px]" />
                </motion.button>
              )}
            </AnimatePresence>

            <div
              className="hidden md:flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-500 dark:text-zinc-500"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid rgba(128,128,128,0.12)',
              }}
            >
              ⌘K
            </div>
          </div>
        </div>
      </div>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-0 rounded-b-[24px] rounded-t-none overflow-hidden z-[150] border-x border-b border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#303134] shadow-[0_4px_16px_rgba(32,33,36,0.28)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            <div
              className="max-h-[400px] overflow-y-auto overscroll-contain"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.08) transparent',
              }}
            >
              {/* ── idle: just a hint, no Popular ── */}
              {!query.trim() && (
                <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 shadow-sm dark:shadow-none"
                  >
                    <Navigation
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-center mb-2">
                    <p
                      className="text-[13.5px] text-slate-700 dark:text-zinc-300 font-semibold"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      Search any room, lab or faculty
                    </p>
                    <p
                      className="text-[11.5px] text-slate-500 dark:text-zinc-500 mt-1 font-medium"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      Across all building layouts
                    </p>
                  </div>

                  {/* Google style quick category search chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mt-1 border-t border-slate-100 dark:border-zinc-800/60 pt-4 w-full">
                    {[
                      { queryText: 'classroom', label: 'Classrooms', icon: BookOpen },
                      { queryText: 'lab', label: 'Labs', icon: FlaskConical },
                      { queryText: 'hod', label: 'HODs', icon: Award },
                      { queryText: 'staffroom', label: 'Staff Rooms', icon: User },
                      { queryText: 'toilet', label: 'Washrooms', icon: Wrench },
                      { queryText: 'xerox', label: 'Xerox', icon: Zap },
                    ].map((chip) => {
                      const Icon = chip.icon
                      return (
                        <button
                          key={chip.queryText}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setQuery(chip.queryText)
                            inputRef.current?.focus()
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-xs font-semibold"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{chip.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── results ── */}
              {query.trim() && (
                <div className="p-2">
                  {resolution ? (
                    <>
                      {/* ── top result ── */}
                      <div
                        className={`relative rounded-xl mb-3 overflow-hidden cursor-pointer border transition-all duration-200 group
                          ${selectedIndex === 0
                            ? 'bg-slate-100/90 dark:bg-zinc-900/60 border-slate-300/60 dark:border-zinc-800/80 shadow-sm dark:shadow-none'
                            : 'bg-slate-50/40 dark:bg-zinc-900/20 border-slate-200/40 dark:border-zinc-800/30'
                          }`}
                        onClick={() => handleSelect(resolution)}
                        onMouseEnter={() => setSelectedIndex(0)}
                      >
                        {/* accent bar on left of top result */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[4px] transition-opacity duration-200"
                          style={{
                            background: topColor.ring,
                            opacity: selectedIndex === 0 ? 0.95 : 0,
                          }}
                        />

                        <div className="flex items-start gap-4 p-5 pl-6">
                          {/* icon */}
                          <div
                            className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-200 border
                              ${selectedIndex === 0
                                ? 'bg-white dark:bg-zinc-800 shadow-sm border-slate-200 dark:border-zinc-700'
                                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200/50 dark:border-zinc-800'
                              }`}
                            style={{
                              color: selectedIndex === 0 ? topColor.ring : undefined,
                            }}
                          >
                            <div className={selectedIndex !== 0 ? 'text-slate-500 dark:text-zinc-500' : ''}>
                              <TypeIcon type={topType} size={22} />
                            </div>
                          </div>

                          {/* text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className="text-[15px] font-bold truncate transition-colors"
                                style={{
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                }}
                              >
                                <span className={selectedIndex === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}>
                                  {resolution.title}
                                </span>
                              </h4>
                              <span
                                className="text-[9.5px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 tracking-wider"
                                style={{
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  background: `${topColor.ring}18`,
                                  color: topColor.ring,
                                  border: `1px solid ${topColor.ring}30`,
                                }}
                              >
                                {resolution._floorLabel?.toUpperCase().replace(' FLOOR', '')}
                              </span>
                            </div>
                            <p
                              className={`text-[11.5px] mt-0.5 capitalize transition-colors
                                ${selectedIndex === 0 ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-500 dark:text-zinc-500'}`}
                              style={{
                                fontFamily: 'Inter, system-ui, sans-serif',
                              }}
                            >
                              {resolution.description}
                            </p>
                            {resolution.directions &&
                              resolution.directions !== 'TBD' && (
                                <p
                                  className="text-sm mt-2 flex items-center gap-1 font-medium transition-opacity"
                                  style={{
                                    color: topColor.ring,
                                    opacity: selectedIndex === 0 ? 0.9 : 0.6,
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                  }}
                                >
                                  ↗&nbsp;{resolution.directions}
                                </p>
                              )}
                          </div>

                          {/* actions */}
                          <div
                            className="flex flex-col items-end gap-2.5 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelect(resolution)}
                              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95
                                ${selectedIndex === 0
                                  ? 'text-white'
                                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700'
                                }`}
                              style={{
                                fontFamily: 'Inter, system-ui, sans-serif',
                                background: selectedIndex === 0 ? topColor.ring : undefined,
                              }}
                            >
                              Go&nbsp;→
                            </button>
                            {resolution.directions &&
                              resolution.directions !== 'TBD' && (
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => handleSpeak(e, resolution)}
                                  className="p-2 rounded-lg text-slate-500 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/8 transition-all"
                                  title="Read directions aloud"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* ── alternatives ── */}
                      {resolution.alternatives?.length > 0 && (
                        <>
                          <div
                            className="px-4 pt-2 pb-1.5 text-[9.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500"
                            style={{
                              fontFamily: 'Inter, system-ui, sans-serif',
                            }}
                          >
                            Also found
                          </div>
                          <div className="space-y-0.5">
                            {resolution.alternatives.map((alt, idx) => (
                              <ResultRow
                                key={`${alt.id}-${idx}`}
                                item={alt}
                                isSelected={selectedIndex === idx + 1}
                                onSelect={handleSelect}
                                onHover={() => setSelectedIndex(idx + 1)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    /* no results */
                    <div className="flex flex-col items-center py-12 gap-3.5">
                      <AlertCircle className="w-6 h-6 text-slate-300 dark:text-zinc-700" />
                      <div className="text-center">
                        <p
                          className="text-[13px] text-slate-600 dark:text-zinc-400 font-semibold"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          Nothing found for "{query}"
                        </p>
                        <p
                          className="text-sm text-slate-500 dark:text-zinc-500 mt-1"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          Try a room code, floor name, or faculty name
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── footer ── */}
            <div
              className="flex items-center justify-between px-5 py-3 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16161a]/30"
            >
              <div className="flex items-center gap-5">
                {[
                  {
                    icon: (
                      <>
                        <ArrowUp className="w-2.5 h-2.5" />
                        <ArrowDown className="w-2.5 h-2.5" />
                      </>
                    ),
                    label: 'Navigate',
                  },
                  {
                    icon: <CornerDownLeft className="w-2.5 h-2.5" />,
                    label: 'Select',
                  },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500"
                  >
                    <div className="flex gap-0.5">{icon}</div>
                    <span
                      className="text-[9.5px] font-semibold"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500">
                <kbd
                  className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-200/60 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400"
                >
                  Esc
                </kbd>
                <span
                  className="text-[9.5px] font-semibold"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchSystem
