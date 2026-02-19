/**
 * Sidebar navigation — TIP Black background with Yellow accents.
 * Nav items shown/hidden based on user role.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import useAuthStore from '../../stores/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['all'] },
  { to: '/app/roadmap', label: 'My Roadmap', icon: MapIcon, roles: ['all'] },
  { to: '/app/ai-chat', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon, roles: ['all'] },
  { to: '/app/mentors', label: 'Mentors', icon: UserGroupIcon, roles: ['all'] },
  { to: '/app/jobs', label: 'Jobs', icon: BriefcaseIcon, roles: ['all'] },
  { to: '/app/universities', label: 'Universities', icon: BuildingLibraryIcon, roles: ['incoming_student', 'admin'] },
  { to: '/app/certifications', label: 'Certifications', icon: AcademicCapIcon, roles: ['all'] },
  { to: '/app/achievements', label: 'Achievements', icon: TrophyIcon, roles: ['all'] },
  { to: '/app/profile', label: 'Profile', icon: UserCircleIcon, roles: ['all'] },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
    toast('Logged out successfully.')
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user?.role)
  )

  return (
    <aside className="w-64 bg-brand-black flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-black-border">
        <span className="text-brand-yellow font-extrabold text-2xl tracking-tight">CodeCompass</span>
        <p className="text-brand-gray-mid text-xs mt-0.5 capitalize">
          {user?.role?.replace('_', ' ')}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-brand-gray-mid hover:bg-brand-black-muted hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-brand-black-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center">
            <span className="text-brand-black font-bold text-sm">
              {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-brand-gray-mid text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-brand-gray-mid hover:text-white text-sm w-full px-2 py-1.5 rounded-lg hover:bg-brand-black-muted transition-all"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}
