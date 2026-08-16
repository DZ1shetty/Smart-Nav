import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { 
  Building2, Layers, Type, Tag, AlignLeft, Plus, Clock, Trash2, ArrowLeft, 
  FolderOpen, Sparkles, Map, ArrowRight, Search, MoreVertical, Copy, 
  Edit2, LayoutGrid, List, SortDesc, X, Check, Activity, Info, Loader2 
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { EXISTING_BUILDINGS_PRESETS, loadExistingBuildingPreset, ExistingBuildingPreset } from '../../utils/buildingImporter';
import { toast } from 'sonner';

// Auto-updating relative time component
const RelativeTime = ({ timestamp }: { timestamp: any }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  
  if (!timestamp) return <span>Recently</span>;
  
  let timeMs = 0;
  if (typeof timestamp === 'number') timeMs = timestamp;
  else if (typeof timestamp === 'string') timeMs = new Date(timestamp).getTime();
  else if (typeof timestamp.toMillis === 'function') timeMs = timestamp.toMillis();
  else if (typeof timestamp.seconds === 'number') timeMs = timestamp.seconds * 1000;
  
  if (!timeMs || isNaN(timeMs)) return <span>Recently</span>;
  
  return <span>{formatDistanceToNow(new Date(timeMs))} ago</span>;
};

// Mini SVG Thumbnail based on rooms data
const DraftThumbnail = ({ draft }: { draft: any }) => {
  const floorData = draft.floorsData?.[0] || [];
  if (!floorData || floorData.length === 0) {
    return (
      <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-center text-zinc-300 dark:text-zinc-600 rounded-t-3xl transition-colors">
        <Map className="w-8 h-8 opacity-40 group-hover:opacity-70 transition-opacity group-hover:text-blue-500" />
      </div>
    );
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  floorData.forEach((room: any) => {
    if (room.points) {
      room.points.forEach((p: any) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    }
  });

  if (minX === Infinity) return (
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-center text-zinc-300 dark:text-zinc-600 rounded-t-3xl transition-colors">
      <Map className="w-8 h-8 opacity-40 group-hover:opacity-70 transition-opacity group-hover:text-blue-500" />
    </div>
  );

  const padding = 50;
  const width = maxX - minX;
  const height = maxY - minY;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="w-full h-full bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-center rounded-t-[1.8rem] p-4 transition-colors">
      <svg viewBox={viewBox} className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-sm pointer-events-none">
        {floorData.map((room: any, idx: number) => {
          if (!room.points || room.points.length === 0) return null;
          const pts = room.points.map((p: any) => `${p.x},${p.y}`).join(' ');
          return (
            <polygon 
              key={room.id || idx} 
              points={pts} 
              fill="currentColor" 
              className="text-blue-500/20 stroke-blue-500/80 transition-colors" 
              strokeWidth={Math.max(2, width * 0.015)} 
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Progress bar based on floor count vs populated rooms
const DraftProgress = ({ draft }: { draft: any }) => {
  const floorCount = draft.buildingMeta?.floorCount || 1;
  const floorsData = draft.floorsData || {};
  let populatedFloors = 0;
  
  for (let i = 0; i < floorCount; i++) {
    if (floorsData[i] && floorsData[i].length > 0) {
      populatedFloors++;
    }
  }
  
  let percent = 20; // Base 20% for having metadata
  if (populatedFloors > 0) {
    percent += 80 * (populatedFloors / floorCount);
  }
  
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        <span>Setup Progress</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
};

export const SetupModal = () => {
  const { completeSetup, unsavedChanges } = useBuilderStore();
  
  const [view, setView] = useState<'dashboard' | 'new'>('dashboard');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'floors'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Actions State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [overview, setOverview] = useState('');
  const [floorCount, setFloorCount] = useState<number>(3);
  const [theme, setTheme] = useState('');
  const [availableThemes, setAvailableThemes] = useState<string[]>(['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan']);
  const [importingPresetId, setImportingPresetId] = useState<string | null>(null);

  const handleImportPreset = async (preset: ExistingBuildingPreset) => {
    if (unsavedChanges) {
      if (!window.confirm(`You have unsaved changes. Discard them and load ${preset.name}?`)) {
        return;
      }
    }
    setImportingPresetId(preset.id);
    try {
      const floorsData = await loadExistingBuildingPreset(preset);
      completeSetup({
        name: preset.name,
        slug: preset.slug,
        overview: preset.overview,
        floorCount: preset.floorCount,
        theme: preset.theme
      }, floorsData, null);
      toast.success(`Imported ${preset.name} into Smart Builder!`);
    } catch (err) {
      console.error("Error importing preset:", err);
      toast.error(`Failed to import ${preset.name}.`);
    } finally {
      setImportingPresetId(null);
    }
  };

  useEffect(() => {
    const autoOpenSlug = localStorage.getItem('smart_nav_open_draft_slug');
    fetchDrafts().then(async (fetchedList?: any[]) => {
      fetchThemes();
      if (!autoOpenSlug || !fetchedList || fetchedList.length === 0) return;
      const match = fetchedList.find(
        (d: any) => (d.buildingSlug || d.buildingMeta?.slug) === autoOpenSlug
      );
      if (!match) return;
      localStorage.removeItem('smart_nav_open_draft_slug');
      // Auto-load inline (no confirm dialog) — same logic as handleLoadDraft
      try {
        const floorsRef = collection(db, `builder_drafts/${match.id}/floors`);
        const floorsSnapshot = await getDocs(floorsRef);
        const loadedFloorsData: Record<number, any> = {};
        floorsSnapshot.forEach(floorDoc => {
          loadedFloorsData[parseInt(floorDoc.id)] = floorDoc.data().rooms || [];
        });
        const mergedFloorsData = { ...(match.floorsData || {}), ...loadedFloorsData };
        completeSetup(match.buildingMeta, mergedFloorsData, match.id);
      } catch (e) {
        console.error('[Auto-load] Failed to load draft:', e);
      }
    });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setView('new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchDrafts = async () => {
    setIsLoadingDrafts(true);
    try {
      const q = query(collection(db, 'builder_drafts'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedDrafts: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedDrafts.push({ id: doc.id, ...doc.data() });
      });
      setDrafts(fetchedDrafts);
      return fetchedDrafts;
    } catch (e) {
      console.error("Error fetching drafts", e);
      return [];
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'buildings'));
      const usedThemes = new Set<string>();
      querySnapshot.forEach(doc => {
        if (doc.data().theme) usedThemes.add(doc.data().theme);
      });
      const allThemes = ['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan'];
      const unused = allThemes.filter(t => !usedThemes.has(t));
      const pool = unused.length > 0 ? unused : allThemes;
      setTheme(pool[Math.floor(Math.random() * pool.length)]);
      setAvailableThemes(pool);
    } catch (e) {
      console.error("Error fetching themes", e);
      setTheme('blue');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || floorCount < 1) return;
    completeSetup({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'new-building',
      overview,
      floorCount,
      theme: theme || 'blue'
    });
  };

  const handleLoadDraft = async (draft: any) => {
    if (unsavedChanges) {
      if (!window.confirm("You have unsaved changes in the current workspace. Discard them and load this draft?")) {
        return;
      }
    }
    try {
      const floorsRef = collection(db, `builder_drafts/${draft.id}/floors`);
      const floorsSnapshot = await getDocs(floorsRef);
      const loadedFloorsData: Record<number, any> = {};
      floorsSnapshot.forEach(floorDoc => {
        loadedFloorsData[parseInt(floorDoc.id)] = floorDoc.data().rooms || [];
      });
      const mergedFloorsData = { ...(draft.floorsData || {}), ...loadedFloorsData };
      completeSetup(draft.buildingMeta, mergedFloorsData, draft.id);
    } catch(e) {
      console.error("Failed to load draft floors", e);
      alert("Failed to load draft completely.");
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await deleteDoc(doc(db, 'builder_drafts', draftId));
      setDrafts(drafts.filter(d => d.id !== draftId));
      setDeleteConfirmId(null);
    } catch(err) {
      console.error("Error deleting draft", err);
      alert("Failed to delete draft.");
    }
  };

  const handleRenameDraft = async (draftId: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const newName = editName.trim();
      await updateDoc(doc(db, 'builder_drafts', draftId), {
        'buildingMeta.name': newName,
        'buildingName': newName,
        updatedAt: Date.now()
      });
      setDrafts(drafts.map(d => d.id === draftId ? { 
        ...d, 
        buildingName: newName, 
        buildingMeta: { ...d.buildingMeta, name: newName } 
      } : d));
      setEditingId(null);
    } catch (err) {
      console.error("Error renaming draft", err);
    }
  };

  const handleDuplicateDraft = async (draft: any) => {
    try {
      const newId = crypto.randomUUID();
      const newName = `${draft.buildingName || draft.buildingMeta?.name || 'Untitled Project'} (Copy)`;
      const newMeta = { ...draft.buildingMeta, name: newName };
      
      const newDraft = {
        ...draft,
        id: newId,
        buildingName: newName,
        buildingMeta: newMeta,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await setDoc(doc(db, 'builder_drafts', newId), newDraft);
      
      const floorsRef = collection(db, `builder_drafts/${draft.id}/floors`);
      const floorsSnapshot = await getDocs(floorsRef);
      for (const floorDoc of floorsSnapshot.docs) {
        await setDoc(doc(db, `builder_drafts/${newId}/floors`, floorDoc.id), floorDoc.data());
      }

      setDrafts([newDraft, ...drafts].sort((a,b) => b.updatedAt - a.updatedAt));
    } catch(err) {
      console.error("Error duplicating draft", err);
    }
    setMenuOpenId(null);
  };

  const startRename = (draft: any) => {
    setEditName(draft.buildingName || draft.buildingMeta?.name || 'Untitled Project');
    setEditingId(draft.id);
    setMenuOpenId(null);
  };

  const applyTemplate = (namePreset: string, count: number, templateOverview: string) => {
    setName(namePreset);
    setFloorCount(count);
    setOverview(templateOverview);
    setView('new');
  };

  // Filter and Sort Logic
  const filteredDrafts = drafts.filter(d => {
    const dName = (d.buildingName || d.buildingMeta?.name || 'Untitled Project').toLowerCase();
    return dName.includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    if (sortBy === 'recent') return (b.updatedAt || 0) - (a.updatedAt || 0);
    if (sortBy === 'name') {
      const nameA = (a.buildingName || a.buildingMeta?.name || '').toLowerCase();
      const nameB = (b.buildingName || b.buildingMeta?.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'floors') {
      return (b.buildingMeta?.floorCount || 0) - (a.buildingMeta?.floorCount || 0);
    }
    return 0;
  });

  const totalProjects = drafts.length;
  const totalFloors = drafts.reduce((sum, d) => sum + (d.buildingMeta?.floorCount || 1), 0);
  const lastActivity = drafts.length > 0 ? Math.max(...drafts.map(d => {
    if (!d.updatedAt) return 0;
    if (typeof d.updatedAt === 'number') return d.updatedAt;
    if (typeof d.updatedAt === 'string') return new Date(d.updatedAt).getTime();
    if (typeof d.updatedAt.toMillis === 'function') return d.updatedAt.toMillis();
    if (typeof d.updatedAt.seconds === 'number') return d.updatedAt.seconds * 1000;
    return 0;
  })) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-zinc-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-500/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full opacity-50 mix-blend-screen dark:mix-blend-lighten pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col p-6 lg:p-12 min-h-screen">
        {/* Bento Grid Header (Dashboard View) */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(140px,auto)] gap-4 sm:gap-6 mb-12 mt-2">
            
            {/* Main Hero Card */}
            <div className="md:col-span-8 md:row-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <Building2 className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
              
              <div className="relative z-10 mt-12">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-main)' }}>Smart Builder</h1>
                <p className="text-blue-100 text-lg max-w-xl font-medium leading-relaxed">
                  Design your campus building quickly in three simple steps. Create your layouts, assign rooms, and manage faculty effortlessly.
                </p>
              </div>
              
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-700">
                <Map className="w-64 h-64" />
              </div>
            </div>

            {/* Stats: Total Projects */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center group hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl group-hover:-translate-y-1 transition-transform duration-300 mb-3">
                 <FolderOpen className="w-7 h-7 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">{totalProjects}</div>
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Projects</div>
            </div>

            {/* Stats: Total Floors */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center group hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl group-hover:-translate-y-1 transition-transform duration-300 mb-3">
                 <Layers className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">{totalFloors}</div>
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Floors</div>
            </div>

            {/* Last Activity */}
            <div className="md:col-span-4 bg-zinc-900 dark:bg-black rounded-[2rem] p-6 sm:p-8 text-white shadow-xl flex flex-col justify-center border border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                <Activity className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-zinc-400 mb-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Last Activity</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {lastActivity ? <RelativeTime timestamp={lastActivity} /> : 'No recent activity'}
                </div>
                <div className="text-sm text-zinc-500 mt-2 font-medium">Keep building to update your progress</div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">1</div>
                <AlignLeft className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">Design Layout</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Draw the floor layout shape and drag & drop rooms onto the canvas to construct your building.</p>
            </div>

            {/* Step 2 */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">2</div>
                <Type className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">Room Details</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Select individual rooms to assign them custom names, categorize by types, and add descriptions.</p>
            </div>

            {/* Step 3 */}
            <div 
              className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => {
                alert("Please open a project from 'Recent Drafts' or create a new one to manage Faculty Details.");
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">3</div>
                <Tag className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">Faculty Details</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Assign faculty members to specific offices and classrooms to populate the directory.</p>
            </div>

          </div>
        )}

        {/* Minimal Header (New Project View) */}
        {view === 'new' && (
          <header className="flex items-center gap-4 mb-10 mt-2">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-900/20 border border-white/10">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight"
                style={{ fontFamily: 'var(--font-main)' }}
              >
                Smart Builder
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-medium">Design and manage campus building layouts</p>
            </div>
          </header>
        )}

        {view === 'dashboard' ? (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Sub-header Controls */}
            <div className="sticky top-0 z-30 flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl px-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search projects... (Press '/')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-400"
                />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-8 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium cursor-pointer"
                  >
                    <option value="recent">Recently Edited</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="floors">Floor Count</option>
                  </select>
                </div>
                
                <div className="flex items-center p-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className={`grid gap-6 pb-20 ${viewMode === 'grid' ? 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]' : 'grid-cols-1'}`}>
              
              {/* Ghost New Project Card */}
              {!isLoadingDrafts && (
                <button 
                  onClick={() => setView('new')}
                  className={`group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-500/5 cursor-pointer transition-all duration-300 overflow-hidden ${viewMode === 'list' ? 'h-32 flex-row gap-6' : 'h-[320px]'}`}
                >
                  <div className="w-14 h-14 bg-zinc-200/50 dark:bg-zinc-800/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-7 h-7 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New Project</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 font-medium">Press 'N' to quick start</p>
                  </div>
                </button>
              )}

              {isLoadingDrafts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl animate-pulse ${viewMode === 'list' ? 'h-32' : 'h-[320px]'}`}>
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl mb-4" />
                    <div className="w-3/4 h-6 bg-zinc-200 dark:bg-zinc-800/50 rounded mb-2" />
                    <div className="w-1/2 h-4 bg-zinc-200 dark:bg-zinc-800/50 rounded" />
                  </div>
                ))
              ) : (
                filteredDrafts.map(draft => (
                  <div 
                    key={draft.id}
                    className={`group relative flex ${viewMode === 'list' ? 'flex-row items-center gap-6 p-4 h-auto' : 'flex-col h-[320px] pt-0'} rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 hover:shadow-blue-500/10 transition-all duration-300`}
                  >
                    {/* Status Badge */}
                    <div className={`absolute ${viewMode === 'list' ? 'top-1/2 -translate-y-1/2 left-32 ml-4' : 'top-4 left-4'} z-20 flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Draft
                    </div>
                    
                    {/* Thumbnail Section */}
                    <div 
                      onClick={() => handleLoadDraft(draft)}
                      className={`relative cursor-pointer overflow-hidden ${viewMode === 'list' ? 'w-32 h-24 rounded-2xl shrink-0' : 'w-full h-36 rounded-t-[2rem]'}`}
                    >
                      <DraftThumbnail draft={draft} />
                      {/* Hover Overlay Action (Click to open) */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 dark:group-hover:bg-blue-500/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-all bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm">
                          <span>Open</span> <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className={`flex flex-col flex-1 ${viewMode === 'list' ? 'py-2 ml-20' : 'p-6'}`}>
                      <div className="flex items-start justify-between gap-4 mb-1">
                        {editingId === draft.id ? (
                          <div className="flex-1 flex items-center gap-2 relative z-30">
                            <input 
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleRenameDraft(draft.id)}
                              className="w-full bg-white dark:bg-zinc-950 border-2 border-blue-500 rounded-lg px-2 py-1 text-zinc-900 dark:text-white font-bold text-lg outline-none"
                            />
                            <button onClick={() => handleRenameDraft(draft.id)} className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 
                            onDoubleClick={() => startRename(draft)}
                            className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-text"
                            title="Double-click to rename"
                          >
                            {draft.buildingName || draft.buildingMeta?.name || 'Untitled Project'}
                          </h3>
                        )}
                        
                        {/* 3-Dot Menu */}
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === draft.id ? null : draft.id); }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {menuOpenId === draft.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                              <button onClick={() => startRename(draft)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <Edit2 className="w-4 h-4" /> Rename
                              </button>
                              <button onClick={() => handleDuplicateDraft(draft)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                              <button onClick={() => { setDeleteConfirmId(draft.id); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
                                <Trash2 className="w-4 h-4" /> Delete Draft
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {draft.buildingMeta?.overview || 'No overview provided.'}
                        </p>
                      </div>

                      {viewMode === 'grid' && <DraftProgress draft={draft} />}

                      <div className={`flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 ${viewMode === 'list' ? 'mt-0 pt-0 border-t-0 flex-1 justify-end' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{draft.buildingMeta?.floorCount || 1} Floors</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <RelativeTime timestamp={draft.updatedAt} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Delete Draft?</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-8">This action cannot be undone. This will permanently delete the building draft and all associated floor plans.</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 px-5 py-3 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDeleteDraft(deleteConfirmId)}
                      className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
            <button 
              onClick={() => setView('dashboard')} 
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors font-semibold group bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            {/* Existing Campus Buildings Row */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> Edit Existing Campus Building
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EXISTING_BUILDINGS_PRESETS.map((preset) => {
                  const isImporting = importingPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      disabled={isImporting}
                      onClick={() => handleImportPreset(preset)}
                      className="p-5 text-left border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group relative overflow-hidden disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                          {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Building2 className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {preset.floorCount} FLOORS
                        </span>
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {preset.overview}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        <span>{isImporting ? 'Importing...' : 'Edit in Builder'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Start Templates Row */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Start from Blank Template
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => applyTemplate('Single Floor Office', 1, 'A standard layout for a single-floor office space.')} className="p-5 text-left border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-3"><Layers className="w-5 h-5" /></div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">Single Floor</h4>
                  <p className="text-xs text-zinc-500 mt-1">1 Floor setup</p>
                </button>
                <button onClick={() => applyTemplate('Academic Block', 5, 'Multi-story academic block featuring classrooms and labs.')} className="p-5 text-left border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3"><Building2 className="w-5 h-5" /></div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">Multi-Floor Block</h4>
                  <p className="text-xs text-zinc-500 mt-1">5 Floors setup</p>
                </button>
                <button onClick={() => applyTemplate('Hostel Complex', 3, 'Residential hostel with repetitive floor layouts.')} className="p-5 text-left border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-3"><LayoutGrid className="w-5 h-5" /></div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-purple-500 transition-colors">Hostel Block</h4>
                  <p className="text-xs text-zinc-500 mt-1">3 Floors setup</p>
                </button>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-zinc-200/20 dark:shadow-black/50">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                Custom Blank Project
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-zinc-400" /> Building Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Science & Innovation Block"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-zinc-400 text-lg shadow-inner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-zinc-400" /> Building Overview
                    </label>
                    <textarea
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      placeholder="e.g. Hosting primary computer laboratories and core department rooms."
                      rows={3}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder:text-zinc-400 shadow-inner leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-zinc-400" /> Floors Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={floorCount}
                        onChange={(e) => setFloorCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-lg shadow-inner"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-zinc-400" /> Theme Color
                      </label>
                      <div className={`w-full border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all shadow-inner font-bold text-lg
                        ${theme === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 ring-1 ring-blue-500/20' : ''}
                        ${theme === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 ring-1 ring-emerald-500/20' : ''}
                        ${theme === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 ring-1 ring-purple-500/20' : ''}
                        ${theme === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 ring-1 ring-amber-500/20' : ''}
                        ${theme === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 ring-1 ring-rose-500/20' : ''}
                        ${theme === 'cyan' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 ring-1 ring-cyan-500/20' : ''}
                        ${!theme ? 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800' : ''}
                      `}>
                        <div className={`w-5 h-5 rounded-full shadow-inner ring-2 ring-white/50 dark:ring-black/20
                          ${theme === 'blue' ? 'bg-blue-500' : ''}
                          ${theme === 'emerald' ? 'bg-emerald-500' : ''}
                          ${theme === 'purple' ? 'bg-purple-500' : ''}
                          ${theme === 'amber' ? 'bg-amber-500' : ''}
                          ${theme === 'rose' ? 'bg-rose-500' : ''}
                          ${theme === 'cyan' ? 'bg-cyan-500' : ''}
                        `} />
                        <span className="capitalize">{theme || 'Loading...'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-3"
                  >
                    Initialize Builder <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
