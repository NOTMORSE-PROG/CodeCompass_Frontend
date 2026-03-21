import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { authApi } from '../../api/auth'

export default function VerifyEmailPendingPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleResend() {
    if (!user?.email) return
    setStatus('sending')
    try {
      await authApi.resendVerification(user.email)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
        <p className="text-gray-500 mb-1">
          We sent a verification link to
        </p>
        <p className="font-semibold text-gray-800 mb-6">{user?.email ?? 'your email'}</p>

        <p className="text-sm text-gray-400 mb-8">
          Click the link in the email to verify your account and continue to onboarding.
          The link expires in 24 hours.
        </p>

        {/* Resend button */}
        {status === 'sent' ? (
          <p className="text-sm text-green-600 font-medium mb-4">
            Verification email resent! Check your inbox.
          </p>
        ) : status === 'error' ? (
          <p className="text-sm text-red-500 mb-4">
            Failed to resend. Please try again in a moment.
          </p>
        ) : null}

        <button
          onClick={handleResend}
          disabled={status === 'sending' || status === 'sent'}
          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
        >
          {status === 'sending' ? 'Sending…' : 'Resend verification email'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded-lg border border-gray-200 text-gray-600 font-medium
            hover:bg-gray-50 transition-colors text-sm"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
