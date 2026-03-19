/**
 * Auth layout — white centered card with TIP yellow accent.
 * Used for Login and Register pages.
 */
import { Outlet, Navigate, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import useAuthStore from '../../stores/authStore'

export default function AuthLayout() {
  const { user } = useAuthStore()

  // Already logged in — redirect to app
  if (user) {
    return <Navigate to={user.isOnboarded ? '/app/dashboard' : '/onboarding'} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Back to home */}
      <div className="w-full max-w-md mb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="CodeCompass" className="w-12 h-12 object-contain" />
          <h1 className="text-3xl font-extrabold text-brand-black tracking-tight">
            Code<span className="text-brand-yellow">Compass</span>
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Your AI-powered career roadmap for CCS students
        </p>
      </div>

      {/* Card — white with yellow top accent border */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 border-t-4 border-t-brand-yellow p-8">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="text-gray-400 text-xs mt-6">
        © 2026 CodeCompass — Built for CCS Students in the Philippines
      </p>
    </div>
  )
}
