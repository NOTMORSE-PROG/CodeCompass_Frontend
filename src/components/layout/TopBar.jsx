/**
 * Top bar — shows XP indicator, streak, and notification bell.
 * On mobile shows a hamburger menu button to open the sidebar.
 */
import { Bars3Icon } from '@heroicons/react/24/outline'
import { BoltIcon, FireIcon } from '@heroicons/react/24/solid'
import useAuthStore from '../../stores/authStore'

export default function TopBar({ onMenuClick }) {
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Left — hamburger on mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Desktop left spacer */}
      <div className="hidden md:block" />

      {/* Right section — XP + Streak */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* XP Indicator */}
        <div className="flex items-center gap-1.5 bg-brand-yellow-pale px-2.5 md:px-3 py-1.5 rounded-full border border-brand-yellow/30">
          <BoltIcon className="w-4 h-4 text-brand-yellow" />
          <span className="text-brand-black font-bold text-sm">0 XP</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 md:px-3 py-1.5 rounded-full border border-orange-200">
          <FireIcon className="w-4 h-4 text-orange-500" />
          <span className="text-orange-700 font-bold text-sm">0</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-brand-yellow-dark transition-all">
          <span className="text-brand-black font-bold text-sm">
            {user?.fullName?.[0] || '?'}
          </span>
        </div>
      </div>
    </header>
  )
}
