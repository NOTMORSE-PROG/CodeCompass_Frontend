import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    try {
      await authApi.forgotPassword(email)
      setStatus('sent')
    } catch {
      // Always show "sent" to avoid leaking which emails are registered
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-brand-yellow/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-brand-yellow-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-black mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-6">
          If an account exists for <span className="font-semibold text-brand-black">{email}</span>,
          we've sent a password reset link. It expires in 1 hour.
        </p>
        <Link
          to="/auth/login"
          className="text-sm font-semibold text-brand-black hover:text-brand-yellow transition-colors"
        >
          ← Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Forgot password?</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending' || !email}
          className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-gray-500 text-sm text-center mt-6">
        Remember your password?{' '}
        <Link to="/auth/login" className="text-brand-black font-semibold hover:text-brand-yellow transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
