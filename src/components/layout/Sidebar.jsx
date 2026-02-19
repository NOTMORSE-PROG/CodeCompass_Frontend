/**
 * Sidebar navigation — white background with yellow accents and black text.
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-black text-base">C</span>
          </div>
          <span className="text-brand-black font-extrabold text-xl tracking-tight">
            Code<span className="text-brand-yellow">Compass</span>
          </span>
        </div>
        <p className="text-gray-400 text-xs mt-1 ml-10 capitalize">
          {user?.role?.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-yellow text-brand-black shadow-sm'
                  : 'text-gray-600 hover:bg-yellow-50 hover:text-brand-black'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-bold text-sm">
              {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-brand-black text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-black text-sm w-full px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}
