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
    value: 'undergraduate',
    label: 'Student',
    desc: 'Get a personalized skill roadmap, certifications, and job matches',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    desc: 'IT professional or professor — guide the next generation of CCS students',
  },
]

export default function GoogleSetupPage() {
  const { user, setRole, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.isOnboarded) navigate('/app/dashboard', { replace: true })
    else if (user.role) navigate('/onboarding', { replace: true })
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
      navigate(selectedRole === 'mentor' ? '/app/dashboard' : '/onboarding', { replace: true })
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
            {user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h2 className="text-xl font-bold text-brand-black">
            Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {user?.email ? <>Signed in as <span className="text-brand-black font-medium">{user.email}</span></> : 'Complete your setup below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">
            How are you using CodeCompass?
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{role.label}</p>
                  <p className="text-xs text-gray-500">{role.desc}</p>
                </div>
                {selectedRole === role.value && (
                  <div className="w-4 h-4 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0 ml-3">
                    <svg className="w-2.5 h-2.5 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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
            {isLoading ? 'Setting up...' : selectedRole === 'mentor' ? 'Continue to Dashboard' : 'Continue to Onboarding'}
          </button>
        </form>
      </div>

      <p className="text-gray-400 text-xs mt-6">
        © 2026 CodeCompass — Built for CCS Students in the Philippines
      </p>
    </div>
  )
}
