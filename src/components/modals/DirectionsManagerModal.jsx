import { motion } from 'framer-motion'
import { X, Save, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

export default function DirectionsManagerModal({
  isOpen,
  onClose,
  rooms,
  onSave,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editedDirections, setEditedDirections] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize editedDirections when modal opens or rooms change
  useEffect(() => {
    if (isOpen) {
      const initial = {}
      rooms.forEach((room) => {
        initial[room.id] = room.directions || ''
      })
      setEditedDirections(initial)
    }
  }, [isOpen, rooms])

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [rooms, searchQuery])

  const handleDirectionChange = (roomId, value) => {
    setEditedDirections((prev) => ({ ...prev, [roomId]: value }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const updatedRooms = rooms.map((room) => ({
        ...room,
        directions: editedDirections[room.id] || '',
      }))
      await onSave(updatedRooms)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to save directions:', error)
      alert('Error saving directions')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onMouseDown={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[min(85dvh,700px)] bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-black/5 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              Directions Manager
            </h2>
            <p className="text-xs font-orbitron font-bold text-black/40 dark:text-white/20 uppercase tracking-[0.2em] mt-1">
              Batch edit navigation paths for all rooms
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-black/20 dark:text-white/20 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTER ROOMS..."
                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-orbitron font-black uppercase tracking-widest outline-none focus:border-blue-500/50 transition-all w-48 md:w-64"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 text-black/30 dark:text-white/20 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="group flex flex-col md:flex-row gap-4 p-6 bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-2xl hover:border-blue-500/30 transition-all"
              >
                <div className="w-full md:w-64 shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${room.type === 'lab' ? 'bg-emerald-500' : room.type === 'classroom' ? 'bg-blue-500' : 'bg-amber-500'}`}
                    />
                    <h4 className="text-sm font-orbitron font-black uppercase tracking-widest text-black dark:text-white truncate">
                      {room.name}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-black/30 dark:text-white/20 uppercase tracking-tighter">
                      ID: {room.id}
                    </span>
                    <span className="text-[11px] font-orbitron font-bold text-blue-500/50 uppercase tracking-widest">
                      {room.type}
                    </span>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <textarea
                    value={editedDirections[room.id] || ''}
                    onChange={(e) =>
                      handleDirectionChange(room.id, e.target.value)
                    }
                    placeholder="Enter navigation directions here (e.g., 'Turn left at the stairs...')"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-black dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[80px] custom-scrollbar"
                  />
                  {(!editedDirections[room.id] ||
                    editedDirections[room.id] === 'TBD') && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-amber-500/50">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-orbitron font-black uppercase tracking-widest">
                        Missing Data
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 md:p-8 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-orbitron font-black text-black/40 dark:text-white/20 uppercase tracking-widest">
                {rooms.length} Rooms Total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-orbitron font-black text-black/40 dark:text-white/20 uppercase tracking-widest">
                {
                  rooms.filter((r) => !r.directions || r.directions === 'TBD')
                    .length
                }{' '}
                Missing
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving || saveSuccess}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-orbitron font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl
              ${
                saveSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-95 disabled:opacity-50'
              }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                SAVING DATA...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                DATA UPDATED!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                SAVE ALL DIRECTIONS
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
