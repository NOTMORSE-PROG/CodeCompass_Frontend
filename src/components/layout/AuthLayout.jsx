/**
 * Auth layout — white centered card with TIP yellow accent.
 * Used for Login and Register pages.
 */
import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function AuthLayout() {
  const { user } = useAuthStore()

  // Already logged in — redirect to app
  if (user) {
    return <Navigate to={user.isOnboarded ? '/app/dashboard' : '/onboarding'} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 bg-brand-yellow rounded-lg flex items-center justify-center">
            <span className="text-brand-black font-black text-lg">C</span>
          </div>
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
