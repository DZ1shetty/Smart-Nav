import { motion } from 'framer-motion'
import { X, Users, Search, MapPin, User, Trash2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { resolveImageUrl } from '../../config'
import { getFloorFullNameInWords } from '../../utils/floorFormatter'
import { useDebounce } from '../../hooks/useDebounce'

function FacultyPortraitImage({ sources = [], name = '' }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const initials = name
    ? name.replace(/^(DR\.|MR\.|MRS\.|MS\.|PROF\.)\s+/i, '')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
    : 'FC';

  if (hasFailedAll || !sources[currentIdx]) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center bg-gradient-to-tr from-blue-500/10 via-teal-500/5 to-purple-500/10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-purple-600 text-white flex items-center justify-center font-orbitron font-black text-lg tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] border-2 border-white/20 group-hover:scale-110 transition-transform duration-500">
          {initials}
        </div>
        <span className="text-[8px] font-orbitron font-bold text-black/50 dark:text-white/40 uppercase tracking-widest">
          FACULTY MEMBER
        </span>
      </div>
    );
  }

  return (
    <img
      src={sources[currentIdx]}
      alt={name}
      className="w-full h-full object-cover brightness-95 dark:brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
      onError={() => {
        if (currentIdx + 1 < sources.length) {
          setCurrentIdx(prev => prev + 1);
        } else {
          setHasFailedAll(true);
        }
      }}
    />
  );
}

export default function FacultyDirectoryModal({
  onClose,
  floorData,
  facultyList,
  onSelectFaculty,
  isEditMode,
  onDeleteFaculty,
  initialSearch = '',
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const debouncedSearchTerm = useDebounce(searchTerm, 200)

  // Sync searchTerm when initialSearch updates (e.g. clicking different rooms)
  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  // Safe expanded fuzzy search covering Name, Department, and Room Name
  const filteredFaculty = useMemo(() => {
    if (!facultyList) return []

    const query = debouncedSearchTerm.toLowerCase().trim()
    if (!query) return facultyList

    return facultyList.filter((f) => {
      const nameMatch = f.name?.toLowerCase().includes(query)
      const deptMatch = f.department?.toLowerCase().includes(query)
      const roomMatch = f.roomName?.toLowerCase().includes(query)
      return nameMatch || deptMatch || roomMatch
    })
  }, [facultyList, debouncedSearchTerm])

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md"
        onMouseDown={onClose}
      />

      {/* High-Tech Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-5xl bg-white/95 dark:bg-[#070707]/90 border border-black/10 dark:border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-xl z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all duration-300 group z-[60] border border-black/5 dark:border-white/5"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-black/50 dark:text-white/40 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:rotate-90 transition-all duration-300" />
        </button>

        {/* Header */}
        <div className="p-8 pb-5 border-b border-black/5 dark:border-white/5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white">
                  FACULTY <span className="text-blue-500 dark:text-blue-400">DIRECTORY</span>
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-orbitron font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15">
                    {getFloorFullNameInWords(floorData?.label) || 'APJ-BLOCK'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/15" />
                  <span className="text-[9px] font-orbitron font-bold text-black/40 dark:text-white/30 uppercase tracking-widest">
                    {filteredFaculty.length} PERSONNEL
                  </span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative group max-w-[320px] w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/20 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type="text"
                placeholder="SEARCH DIRECTORY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/[0.02] dark:bg-white/[0.01] hover:bg-black/[0.04] dark:hover:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-blue-500/50 dark:focus:border-blue-500/40 rounded-xl py-3.5 pl-11 pr-4 text-[10px] font-orbitron font-bold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none focus:shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)] transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-orbitron font-black text-black/40 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth relative z-10">
          {filteredFaculty.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 pb-12"
            >
              {filteredFaculty.map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(0.2, idx * 0.03),
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                  }}
                  onClick={() => onSelectFaculty(item)}
                  className="group relative bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.15)] will-change-transform flex flex-col justify-between"
                >
                  {/* Portrait Area */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-b from-blue-500/5 via-slate-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-slate-900/40 dark:to-purple-900/20 border-b border-black/5 dark:border-white/5 flex items-center justify-center">
                    {(() => {
                      const facultyPhoto = item.avatar || item.photo || item.facultyImage;
                      const isDoorImage = item.image && (
                        item.image.includes('staff_room') ||
                        item.image.includes('dept_office') ||
                        item.image.includes('hod_') ||
                        item.image.includes('door') ||
                        item.image.includes('lab')
                      );

                      // Primary image candidates: explicit photo -> non-door image -> automatic faculty headshot path
                      const cleanSlug = item.name
                        ? item.name.toLowerCase().replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.)\s+/i, '').split(' ')[0]
                        : '';

                      const candidateSources = [];
                      if (facultyPhoto) candidateSources.push(resolveImageUrl(facultyPhoto));
                      if (item.image && !isDoorImage) candidateSources.push(resolveImageUrl(item.image));
                      if (cleanSlug) {
                        candidateSources.push(`/rajraman-block-images/faculty/${cleanSlug}.jpg`);
                        candidateSources.push(`/rajraman-block-images/faculty/${cleanSlug}.png`);
                        candidateSources.push(`/rajraman-block-images/faculty/${cleanSlug}.jpeg`);
                        candidateSources.push(`/rajraman-block-images/${cleanSlug}.jpg`);
                        candidateSources.push(`/rajraman-block-images/${cleanSlug}.png`);
                      }

                      return (
                        <FacultyPortraitImage
                          sources={candidateSources}
                          name={item.name}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 dark:from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Delete Button (Architect Mode Only) */}
                    {isEditMode && item.id?.startsWith('list-') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteFaculty(item.id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-[70] border border-red-600/30"
                        title="Remove from directory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <h3 className="text-[10px] font-orbitron font-black text-black/80 dark:text-white/90 uppercase tracking-wide truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {item.name}
                      </h3>
                      {item.department && (
                        <p className="text-[7.5px] font-orbitron font-black text-blue-500/60 dark:text-blue-400/60 uppercase tracking-widest mt-0.5 truncate">
                          {item.department}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[8px] font-medium text-black/50 dark:text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 border-t border-black/5 dark:border-white/5 pt-2">
                      <MapPin className="w-2.5 h-2.5 text-blue-500/50 dark:text-blue-400/50 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      <span className="text-[8px] font-orbitron font-bold text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 uppercase tracking-widest truncate">
                        {item.roomName}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30">
              <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-black/5 dark:border-white/5">
                <User className="w-6 h-6 text-black/30 dark:text-white/30" />
              </div>
              <h3 className="font-orbitron font-black uppercase tracking-[0.2em] text-xs text-black/60 dark:text-white/50">
                No Records Found
              </h3>
              <p className="text-[9px] font-orbitron text-black/30 dark:text-white/30 uppercase tracking-wider mt-1.5">
                Try searching for a name, department, or staff room code
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between relative z-10 bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[9px] font-orbitron font-black text-black/35 dark:text-white/20 uppercase tracking-widest">
              Database Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
