import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Search, AlertCircle, CheckCircle2, User, Image as ImageIcon, FileText } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

export default function FacultyManagerModal({ isOpen, onClose, facultyList, onSave }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editedFaculty, setEditedFaculty] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize edited data when modal opens or facultyList changes
  useEffect(() => {
    if (isOpen) {
      const initial = {}
      facultyList.forEach((faculty, idx) => {
        const id = faculty.id || `list-${idx}-${faculty.name}`
        initial[id] = {
          description: faculty.description || '',
          image: faculty.image || ''
        }
      })
      setEditedFaculty(initial)
    }
  }, [isOpen, facultyList])

  const filteredFaculty = useMemo(() => {
    return facultyList.map((f, idx) => ({
      ...f,
      id: f.id || `list-${idx}-${f.name}`
    })).filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [facultyList, searchQuery])

  const handleFieldChange = (facultyId, field, value) => {
    setEditedFaculty(prev => ({
      ...prev,
      [facultyId]: {
        ...prev[facultyId],
        [field]: value
      }
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const updatedFaculty = facultyList.map((faculty, idx) => {
        const id = faculty.id || `list-${idx}-${faculty.name}`
        return {
          ...faculty,
          description: editedFaculty[id]?.description || '',
          image: editedFaculty[id]?.image || ''
        }
      })
      await onSave(updatedFaculty)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Failed to save faculty data:", error)
      alert("Error saving faculty data")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
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
          className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
            <div>
              <h2 className="text-2xl font-orbitron font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                Faculty Manager
              </h2>
              <p className="text-[10px] font-orbitron font-bold text-black/40 dark:text-white/20 uppercase tracking-[0.2em] mt-1">
                Edit profile details and images for all faculty
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
                  placeholder="FILTER FACULTY..."
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-orbitron font-black uppercase tracking-widest outline-none focus:border-blue-500/50 transition-all w-48 md:w-64"
                />
              </div>
              <button 
                onMouseDown={onClose}
                className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 text-black/30 dark:text-white/20 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6">
              {filteredFaculty.map((faculty) => (
                <div key={faculty.id} className="group flex flex-col md:flex-row gap-6 p-6 bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-2xl hover:border-blue-500/30 transition-all">
                  <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                        {editedFaculty[faculty.id]?.image ? (
                          <img src={editedFaculty[faculty.id].image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-black/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-orbitron font-black uppercase tracking-widest text-black dark:text-white truncate">
                          {faculty.name}
                        </h4>
                        <span className="text-[9px] font-orbitron font-bold text-blue-500/50 uppercase tracking-widest">{faculty.department || 'No Dept'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                         <span className="text-[8px] font-mono text-black/40 dark:text-white/20 uppercase">ROOM:</span>
                         <span className="text-[8px] font-orbitron font-black text-black/60 dark:text-white/40">{faculty.roomName || faculty.roomId}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {/* Image URL Field */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/40">Profile Image URL</span>
                      </div>
                      <input 
                        type="text"
                        value={editedFaculty[faculty.id]?.image || ''}
                        onChange={(e) => handleFieldChange(faculty.id, 'image', e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-blue-500 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>

                    {/* description Field */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] font-orbitron font-black uppercase tracking-widest text-black/40">Professional description</span>
                      </div>
                      <textarea 
                        value={editedFaculty[faculty.id]?.description || ''}
                        onChange={(e) => handleFieldChange(faculty.id, 'description', e.target.value)}
                        placeholder="Enter faculty description, specializations, or notes..."
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-black dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[100px] custom-scrollbar"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-orbitron font-black text-black/40 dark:text-white/20 uppercase tracking-widest">
                  {facultyList.length} Faculty Members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-orbitron font-black text-black/40 dark:text-white/20 uppercase tracking-widest">
                  {Object.values(editedFaculty).filter(f => !f.description).length} Incomplete
                </span>
              </div>
            </div>

            <button 
              onClick={handleSaveAll}
              disabled={isSaving || saveSuccess}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-orbitron font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl
                ${saveSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-95 disabled:opacity-50'}`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  SAVING...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  UPDATED!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
