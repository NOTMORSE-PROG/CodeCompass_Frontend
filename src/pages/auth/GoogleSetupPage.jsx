/**
 * Google OAuth Setup — shown to new users who signed in with Google.
 * Lets them pick their role before being redirected to onboarding.
 * Route: /auth/google-setup (requires auth, no onboarding check)
 * Light theme — white background, yellow accents.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

const ROLES = [
  {
    value: 'incoming_student',
    label: 'Incoming Student',
    desc: 'Pre-college / High school — exploring CCS programs and universities',
    emoji: '🎓',
  },
  {
    value: 'undergraduate',
    label: 'Undergraduate Student',
    desc: 'Currently enrolled in a CCS program — need career guidance',
    emoji: '💻',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    desc: 'IT professional or professor — willing to guide students',
    emoji: '🧑‍💼',
  },
]

export default function GoogleSetupPage() {
  const { user, setRole, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.isOnboarded) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) {
      setError('Please select your role before continuing.')
      return
    }
    setError('')
    const result = await setRole(selectedRole)
    if (result.success) {
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Brand */}
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

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 border-t-4 border-t-brand-yellow p-8">
        {/* Google avatar / greeting */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-brand-black">
            {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h2 className="text-xl font-bold text-brand-black">
            Welcome, {user?.fullName?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Signed in with Google as{' '}
            <span className="text-brand-black font-medium">{user?.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Who are you on CodeCompass? (Pick your role)
          </p>

          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                selectedRole === role.value
                  ? 'border-brand-yellow bg-brand-yellow/10 text-brand-black'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-yellow/50 hover:bg-yellow-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{role.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{role.label}</p>
                  <p className="text-xs text-gray-500">{role.desc}</p>
                </div>
                {selectedRole === role.value && (
                  <span className="ml-auto text-brand-yellow font-bold text-lg">✓</span>
                )}
              </div>
            </button>
          ))}

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !selectedRole}
            className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                       hover:bg-brand-yellow-dark active:scale-95 transition-all mt-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Continue to Onboarding'}
          </button>
        </form>
      </div>

      <p className="text-gray-400 text-xs mt-6">
        © 2026 CodeCompass — Built for CCS Students in the Philippines
      </p>
    </div>
  )
}
