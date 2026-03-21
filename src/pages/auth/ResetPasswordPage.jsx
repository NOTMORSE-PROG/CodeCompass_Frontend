import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkError, setLinkError] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setIsSubmitting(true)
    try {
      await authApi.resetPassword({
        uidb64,
        token,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      })
      toast.success('Password reset successfully. Please log in.')
      navigate('/auth/login', { replace: true })
    } catch (err) {
      const d = err.response?.data
      const first = (arr) => (Array.isArray(arr) ? arr[0] : arr)
      const msg =
        first(d?.newPassword) ||
        first(d?.newPasswordConfirm) ||
        d?.detail ||
        null

      if (!msg || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setLinkError(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (linkError) {
    return (
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-black mb-2">Link expired</h2>
        <p className="text-gray-500 text-sm mb-6">
          This password reset link is invalid or has already been used.
          Request a new one below.
        </p>
        <Link
          to="/auth/forgot-password"
          className="inline-block px-6 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg
                     hover:bg-brand-yellow-dark transition-colors"
        >
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Set new password</h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !newPassword || !confirmPassword}
          className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
