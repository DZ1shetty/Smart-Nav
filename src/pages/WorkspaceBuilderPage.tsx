import React, { useEffect, useState } from 'react';
import { Toolbar } from '../components/builder/Toolbar';
import { CanvasSurface } from '../components/builder/CanvasSurface';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';
import { SetupModal } from '../components/builder/SetupModal';
import { RoomDetailsModal } from '../components/builder/RoomDetailsModal';
import { BuilderNavigation } from '../components/builder/BuilderNavigation';
import { useBuilderStore } from '../store/useBuilderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Save } from 'lucide-react';

export const WorkspaceBuilderPage = () => {
  const { isSetupComplete, mode, unsavedChanges } = useBuilderStore();
  const [showUnsavedBanner, setShowUnsavedBanner] = useState(false);

  // Show unsaved changes banner with a small debounce so it doesn't flash on every keystroke
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (unsavedChanges) {
      timer = setTimeout(() => setShowUnsavedBanner(true), 800);
    } else {
      setShowUnsavedBanner(false);
    }
    return () => clearTimeout(timer);
  }, [unsavedChanges]);

  // Prevent default pinch zoom and scrolling on the whole page while in builder
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);
    document.addEventListener('gestureend', preventDefault);

    return () => {
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
    };
  }, []);

  // Warn before tab close / refresh if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const unsaved = useBuilderStore.getState().unsavedChanges;
      if (unsaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Save before leaving?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-zinc-100 dark:bg-[#0a0a0c] select-none flex flex-col">
      {!isSetupComplete && <SetupModal />}
      <RoomDetailsModal />

      {isSetupComplete && (
        <>
          <BuilderNavigation />

          {/* Unsaved changes banner */}
          <AnimatePresence>
            {showUnsavedBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold z-20"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>You have unsaved changes — remember to save before closing or refreshing.</span>
                </div>
                <span className="text-amber-500/60 font-normal hidden sm:inline">Press the Save button above ↑</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-1 overflow-hidden relative w-full">
            <Toolbar />
            <div className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-black">
              <CanvasSurface />
            </div>
            <PropertiesPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceBuilderPage;
