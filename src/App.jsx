import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
const HomePage = lazy(() => import('./components/HomePage'))
const FloorPlan = lazy(() => import('./components/FloorPlan'))
import { AnimatePresence } from 'framer-motion'
import ChatbotWidget from './components/ChatbotWidget'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-mono overflow-hidden transition-colors duration-300">
      {/* Global AI Chatbot Widget */}
      <ChatbotWidget />

      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-dark text-white">
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
            <Route path="/floor/:floorId" element={<FloorPlan />} />
            <Route path="/:buildingSlug/:floorSlug" element={<FloorPlan />} />
            <Route path="/:buildingId" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  )
}

export default App
