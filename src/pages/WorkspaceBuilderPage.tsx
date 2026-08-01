import React, { useEffect } from 'react';
import { Toolbar } from '../components/builder/Toolbar';
import { CanvasSurface } from '../components/builder/CanvasSurface';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';
import { SetupModal } from '../components/builder/SetupModal';
import { RoomDetailsModal } from '../components/builder/RoomDetailsModal';
import { BuilderNavigation } from '../components/builder/BuilderNavigation';
import { useBuilderStore } from '../store/useBuilderStore';

export const WorkspaceBuilderPage = () => {
  const { isSetupComplete, mode } = useBuilderStore();

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Assuming unsavedChanges is accessible.
      // Wait, we need to grab unsavedChanges from useBuilderStore
      const unsaved = useBuilderStore.getState().unsavedChanges;
      if (unsaved) {
        e.preventDefault();
        e.returnValue = ''; // Prompt the user
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
          <div className="flex flex-1 overflow-hidden relative w-full">
            <Toolbar />
            <div className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-black">
              <CanvasSurface />
            </div>
            {mode !== 'room_details' && <PropertiesPanel />}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceBuilderPage;
