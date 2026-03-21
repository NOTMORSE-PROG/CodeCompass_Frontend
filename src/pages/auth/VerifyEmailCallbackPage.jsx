import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { authApi } from '../../api/auth'

export default function VerifyEmailCallbackPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const _saveSession = useAuthStore((s) => s._saveSession)
  const [status, setStatus] = useState('verifying') // verifying | success | error

  useEffect(() => {
    let cancelled = false

    async function verify() {
      try {
        const res = await authApi.verifyEmail(token)
        if (cancelled) return

        const { access, refresh } = res.data
        // Persist tokens and update user state (email_verified=true is now in the JWT)
        _saveSession({ access, refresh })

        setStatus('success')
        // Brief pause so user sees the success state, then go to onboarding
        setTimeout(() => {
          navigate('/onboarding', { replace: true })
        }, 1500)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    verify()
    return () => { cancelled = true }
  }, [token])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h1>
            <p className="text-gray-500">Redirecting you to onboarding…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link invalid or expired</h1>
            <p className="text-gray-500 mb-6">
              This verification link has expired or already been used.
              Request a new one from the verification page.
            </p>
            <button
              onClick={() => navigate('/verify-email-pending', { replace: true })}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium
                hover:bg-indigo-700 transition-colors"
            >
              Resend verification email
            </button>
          </>
        )}
      </div>
    </div>
  )
}
