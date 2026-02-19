/**
 * Onboarding layout — full-screen, no sidebar.
 * Clean minimal UI with TIP yellow accents for the quiz flow.
 */
import { Outlet } from 'react-router-dom'

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-brand-gray-warm flex flex-col">
      {/* Top bar */}
      <header className="bg-brand-black py-4 px-6 flex items-center justify-between">
        <span className="text-brand-yellow font-extrabold text-xl">PathFinder</span>
        <span className="text-brand-gray-mid text-sm">Setting up your career path...</span>
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
