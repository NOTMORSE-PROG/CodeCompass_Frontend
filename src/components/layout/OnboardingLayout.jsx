/**
 * Onboarding layout — full-screen, no sidebar.
 * White background with yellow accent bar for the quiz flow.
 */
import { Outlet } from 'react-router-dom'

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-yellow rounded-md flex items-center justify-center">
            <span className="text-brand-black font-black text-sm">C</span>
          </div>
          <span className="text-brand-black font-extrabold text-lg">
            Code<span className="text-brand-yellow">Compass</span>
          </span>
        </div>
        <span className="text-gray-500 text-sm">Setting up your career path...</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
