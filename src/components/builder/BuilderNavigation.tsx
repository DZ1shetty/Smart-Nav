import React, { useState } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { db } from '../../firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Save, Share, ChevronDown, Check, Settings, X, AlertCircle, Plus } from 'lucide-react';
import { InteractiveHoverButton } from '../ui/interactive-hover-button';
import clsx from 'clsx';
import { toast } from 'sonner';

export const BuilderNavigation = () => {
  const { buildingMeta, currentFloorIndex, switchFloor, floorsData, rooms, updateBuildingMeta, draftId, setDraftId, setUnsavedChanges, unsavedChanges } = useBuilderStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOverview, setEditOverview] = useState('');
  
  // Initialize edit states when modal opens
  React.useEffect(() => {
    if (isSettingsOpen && buildingMeta) {
      setEditName(buildingMeta.name);
      setEditOverview(buildingMeta.overview || '');
    }
  }, [isSettingsOpen, buildingMeta]);

  if (!buildingMeta) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishSuccess(false);

    try {
      // Ensure the current floor's rooms are saved into floorsData before publishing
      const finalFloorsData = { ...floorsData, [currentFloorIndex]: rooms };

      const buildingDoc = {
        name: buildingMeta.name,
        slug: buildingMeta.slug,
        description: buildingMeta.overview,
        floorCount: buildingMeta.floorCount,
        theme: buildingMeta.theme,
        floors: finalFloorsData,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'buildings', buildingMeta.slug), buildingDoc);
      
      // Delete draft after successful publish
      if (draftId) {
        try {
          await deleteDoc(doc(db, 'builder_drafts', draftId));
          setDraftId(null);
        } catch (e) {
          console.error("Failed to delete draft", e);
        }
      }
      
      setUnsavedChanges(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (error) {
      console.error('Error publishing building:', error);
      toast.error('Failed to publish building. Check console for details.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSaving || !buildingMeta) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const finalFloorsData = { ...floorsData, [currentFloorIndex]: rooms };

      const draftData = {
        buildingMeta: buildingMeta,
        buildingName: buildingMeta.name,
        buildingSlug: buildingMeta.slug,
        floorsData: finalFloorsData,
        currentFloorIndex,
        updatedAt: new Date().toISOString(),
      };

      if (draftId) {
        // Update existing draft
        await setDoc(doc(db, 'builder_drafts', draftId), draftData, { merge: true });
        
        // Update current floor in subcollection for robustness
        const floorRef = doc(db, `builder_drafts/${draftId}/floors`, currentFloorIndex.toString());
        await setDoc(floorRef, { rooms });

      } else {
        // Create new draft
        const draftRef = await addDoc(collection(db, 'builder_drafts'), {
          ...draftData,
          createdAt: new Date().toISOString()
        });
        
        setDraftId(draftRef.id);
        
        // Save current floor in subcollection
        const floorRef = doc(db, `builder_drafts/${draftRef.id}/floors`, currentFloorIndex.toString());
        await setDoc(floorRef, { rooms });
      }

      setSaveSuccess(true);
      setUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    if (editName.trim()) {
      updateBuildingMeta({
        name: editName,
        slug: editName.toLowerCase().replace(/[^a-z0-9-]/g, '-') || buildingMeta.slug,
        overview: editOverview
      });
    }
    setIsSettingsOpen(false);
  };

  return (
    <>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 z-10 shadow-sm relative shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight">Smart Builder</h1>
          <div className="text-zinc-300 dark:text-zinc-700 font-light">/</div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{buildingMeta.name}</span>
          <div className="text-zinc-300 dark:text-zinc-700 font-light">/</div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{currentFloorIndex === 0 ? 'Ground Floor' : `Floor ${currentFloorIndex}`}</span>
          
          {/* Autosave Status */}
          <div className="ml-4 flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-100 dark:border-zinc-800/50">
             <div className={clsx("w-2 h-2 rounded-full", isSaving ? "bg-amber-400 animate-pulse" : unsavedChanges ? "bg-blue-400" : "bg-emerald-400")} />
             <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
               {isSaving ? 'Saving...' : unsavedChanges ? 'Unsaved changes' : 'All changes saved'}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
        {/* Settings Action */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Edit Building Details"
        >
          <Settings size={18} />
        </button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

      {/* Floor Selector (Pill Tabs) */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
        {Array.from({ length: buildingMeta.floorCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => switchFloor(i)}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
              currentFloorIndex === i
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
            )}
          >
            {i === 0 ? 'Ground' : `Floor ${i}`}
          </button>
        ))}
        <button
          onClick={() => {
            updateBuildingMeta({ floorCount: buildingMeta.floorCount + 1 });
            switchFloor(buildingMeta.floorCount);
          }}
          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
          title="Add Floor"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

      {/* Save Action */}
      <button
        onClick={handleSaveDraft}
        disabled={isSaving}
        title="Save as draft without updating the live building"
        className={clsx(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border border-zinc-200 dark:border-zinc-700",
          saveSuccess 
            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400"
            : "bg-white hover:bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 shadow-sm disabled:opacity-70"
        )}
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        ) : saveSuccess ? (
          <Check size={16} />
        ) : (
          <Save size={16} />
        )}
        <span className="hidden sm:inline">
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
        </span>
      </button>

      {/* Publish Action */}
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        title="Publish changes to the live building for all users"
        className={clsx(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
          publishSuccess 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-70"
        )}
      >
        {isPublishing ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : publishSuccess ? (
          <Check size={16} />
        ) : (
          <Share size={16} />
        )}
        {isPublishing ? 'Publishing...' : publishSuccess ? 'Published!' : 'Publish'}
      </button>
      </div>
    </div>

    {/* Settings Modal */}
    {isSettingsOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" /> Building Settings
            </h2>
            <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Building Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Building Overview</label>
              <textarea
                value={editOverview}
                onChange={(e) => setEditOverview(e.target.value)}
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
