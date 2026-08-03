import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[var(--bg-main)] text-[var(--text-main)] p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl font-black mb-2">404</h1>
      <h2 className="text-xl font-bold mb-6">Page Not Found</h2>
      <p className="text-sm opacity-70 mb-8 max-w-md">
        The building, floor, or page you are looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
      >
        <Home className="w-5 h-5" />
        Go to Home
      </button>
    </div>
  )
}
