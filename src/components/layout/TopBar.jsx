/**
 * Top bar — shows XP indicator, streak, and notification bell.
 */
import { BoltIcon, FireIcon } from '@heroicons/react/24/solid'
import useAuthStore from '../../stores/authStore'

export default function TopBar() {
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title placeholder — pages will set this via document.title */}
      <div />

      {/* Right section — XP + Streak */}
      <div className="flex items-center gap-4">
        {/* XP Indicator */}
        <div className="flex items-center gap-1.5 bg-brand-yellow-pale px-3 py-1.5 rounded-full border border-brand-yellow/30">
          <BoltIcon className="w-4 h-4 text-brand-yellow" />
          <span className="text-brand-black font-bold text-sm">0 XP</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
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
