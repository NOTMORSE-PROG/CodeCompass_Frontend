/**
 * Auth layout — centered card with TIP yellow/black branding.
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
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-brand-yellow tracking-tight">
          PathFinder
        </h1>
        <p className="text-brand-gray-mid text-sm mt-1">
          Your AI-powered career roadmap — para sa mga CCS students
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-brand-black-soft border border-brand-black-border rounded-2xl p-8 shadow-2xl">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="text-brand-gray-mid text-xs mt-6">
        © 2026 PathFinder — Built for CCS Students in the Philippines
      </p>
    </div>
  )
}
