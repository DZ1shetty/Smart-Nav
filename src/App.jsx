import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
const HomePage = lazy(() => import('./components/home/HomePage'))
const FloorPlan = lazy(() => import('./components/map/FloorPlan'))
const WorkspaceBuilderPage = lazy(() => import('./pages/WorkspaceBuilderPage'))
const CustomBuildingPage = lazy(() => import('./pages/CustomBuildingPage'))
const CustomFloorPlanPage = lazy(() => import('./pages/CustomFloorPlanPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
import { AnimatePresence } from 'framer-motion'
import ChatbotWidget from './components/ui/ChatbotWidget'
import { Toaster } from 'sonner'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-[100dvh] pb-[env(safe-area-inset-bottom)] bg-[var(--bg-main)] text-[var(--text-main)] font-mono overflow-x-hidden transition-colors duration-300">
      {/* Global AI Chatbot Widget - Hidden in builder */}
      {!location.pathname.startsWith('/builder') && <ChatbotWidget />}

      <Toaster position="bottom-right" theme="light" />

      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[100dvh] bg-dark text-white">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <span className="text-xs font-black tracking-widest text-blue-400">
                  LOADING...
                </span>
              </div>
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            {/* ─── Custom Builder Buildings (fully isolated routing) ─── */}
            <Route path="/custom/:slug" element={<CustomBuildingPage />} />
            <Route path="/custom/:slug/floor/:floorIndex" element={<CustomFloorPlanPage />} />
            {/* ─── Standard Campus Buildings ─── */}
            <Route path="/floor/:floorId" element={<FloorPlan />} />
            <Route path="/:buildingSlug/:floorSlug" element={<FloorPlan />} />
            <Route path="/builder" element={<WorkspaceBuilderPage />} />
            <Route path="/:buildingId" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  )
}

export default App
