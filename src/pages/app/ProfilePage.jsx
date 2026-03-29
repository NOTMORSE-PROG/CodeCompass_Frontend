import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { profileApi } from '../../api/profile'
import { authApi } from '../../api/auth'
import { GoogleLogin } from '@react-oauth/google'
import { PencilIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'


export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, connectGoogle, refreshToken, _saveSession, deleteAccount } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Student fields
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // Mentor fields
  const [headline, setHeadline] = useState('')
  const [mentorType, setMentorType] = useState('industry')
  const [isVerified, setIsVerified] = useState(false)

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwStep, setPwStep] = useState('send')   // 'send' | 'verify'
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isStudent = user?.role === 'incoming_student' || user?.role === 'undergraduate'
  const isMentor = user?.role === 'mentor'

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (isStudent) {
          const { data } = await profileApi.getStudentProfile()
          setBio(data.bio || '')
          setLinkedinUrl(data.linkedinUrl || '')
          setGithubUrl(data.githubUrl || '')
        } else if (isMentor) {
          const { data } = await profileApi.getOwnMentorProfile()
          setHeadline(data.headline || '')
          setMentorType(data.mentorType || 'industry')
          setIsVerified(data.isVerified || false)
        }
      } catch {
        /* profile may not exist yet */
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isStudent, isMentor])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isStudent) {
        await profileApi.updateStudentProfile({
          bio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
        })
      } else if (isMentor) {
        await profileApi.updateOwnMentorProfile({ headline, mentor_type: mentorType })
      }
      toast.success('Profile saved!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendOtp = async () => {
    setIsSendingOtp(true)
    try {
      await authApi.sendChangePasswordOtp()
      setPwStep('verify')
      toast.success('Code sent to your email.')
    } catch {
      toast.error('Failed to send code. Try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (isSavingPassword) return
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setIsSavingPassword(true)
    try {
      const { data } = await authApi.changePassword({
        otp,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
        refresh: refreshToken,
      })
      if (data?.access) _saveSession(data)
      handleClosePasswordModal()
      toast.success('Password changed successfully.')
    } catch (err) {
      const d = err.response?.data
      const first = (arr) => (Array.isArray(arr) ? arr[0] : arr)
      const msg =
        first(d?.otp) ||
        first(d?.newPassword) ||
        first(d?.newPasswordConfirm) ||
        d?.detail ||
        'Failed to change password.'
      toast.error(msg)
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPwStep('send')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleGoogleConnect = async (credentialResponse) => {
    await connectGoogle(credentialResponse.credential)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setIsDeleting(true)
    const result = await deleteAccount()
    setIsDeleting(false)
    if (result.success) {
      navigate('/login', { replace: true })
    }
  }

  const roleLabel = {
    incoming_student: 'Incoming Student',
    undergraduate: 'Undergraduate Student',
    mentor: 'Mentor',
    admin: 'Admin',
  }[user?.role] || 'User'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-black">My Profile</h1>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
            editing
              ? 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark'
              : 'border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
          }`}
        >
          {editing ? (
            <><CheckIcon className="w-4 h-4" />{isSaving ? 'Saving...' : 'Save Changes'}</>
          ) : (
            <><PencilIcon className="w-4 h-4" />Edit Profile</>
          )}
        </button>
      </div>

      {/* Avatar + basic info */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-black text-2xl">{user?.fullName?.[0] || '?'}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-black">{user?.fullName || 'Student'}</h2>
            <p className="text-brand-gray-mid text-sm">{user?.email}</p>
            <span className="badge-yellow text-xs mt-1 inline-block">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Student profile */}
      {isStudent && (
        <div className="card mb-4">
          <h3 className="font-bold text-brand-black mb-4">About</h3>
          <div>
            <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Bio</label>
            <textarea
              disabled={!editing}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none
                         disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                disabled={!editing}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow
                           disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">GitHub URL</label>
              <input
                type="url"
                disabled={!editing}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow
                           disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mentor profile */}
      {isMentor && (
        <div className="card mb-4">
          <h3 className="font-bold text-brand-black mb-4">Mentor Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Headline</label>
              <input
                type="text"
                disabled={!editing}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Engineer @ Accenture PH | 5 years experience"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow
                           disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Mentor Type</label>
              <select
                disabled={!editing}
                value={mentorType}
                onChange={(e) => setMentorType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="industry">Industry Professional</option>
                <option value="professor">Professor / Academic</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg border ${
            isVerified ? 'bg-green-50 border-green-200' : 'bg-brand-yellow-pale border-brand-yellow/30'
          }`}>
            <p className="text-sm font-medium text-brand-black">
              Verification Status: {isVerified ? '✅ Verified' : '⏳ Pending Approval'}
            </p>
            <p className="text-xs text-brand-gray-mid mt-0.5">
              {isVerified
                ? 'Your mentor profile is verified. Students can now find and connect with you.'
                : 'Awaiting admin verification. You will be notified via email once approved.'}
            </p>
          </div>
        </div>
      )}

      {/* Account settings */}
      <div className="card">
        <h3 className="font-bold text-brand-black mb-4">Account Settings</h3>
        <div className="space-y-3">
          {/* Change Password — only for email users */}
          {user?.hasPassword && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200
                         hover:border-brand-yellow transition-colors text-sm text-brand-black"
            >
              Change Password
            </button>
          )}

          {/* Connect Google — only for email users who haven't connected yet */}
          {user?.hasPassword && !user?.googleConnected && (
            <div className="rounded-lg border border-gray-200 px-4 py-3">
              <p className="text-sm text-brand-black mb-2">Connect Google Account</p>
              <p className="text-xs text-brand-gray-mid mb-3">
                Link your Google account to sign in faster. Your email must match your Google account.
              </p>
              <GoogleLogin
                onSuccess={handleGoogleConnect}
                onError={() => toast.error('Google connection failed.')}
                text="continue_with"
                shape="rectangular"
                size="medium"
              />
            </div>
          )}

          {/* Google Connected badge */}
          {user?.googleConnected && (
            <div className="px-4 py-3 rounded-lg border border-green-200 bg-green-50 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm text-green-700 font-medium">Google account connected</span>
            </div>
          )}

          {/* Google-only users: informational note */}
          {!user?.hasPassword && (
            <div className="px-4 py-3 rounded-lg border border-gray-100 bg-gray-50">
              <p className="text-xs text-brand-gray-mid">
                You signed up with Google. Password-based login is not available for your account.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-red-200
                       hover:bg-red-50 transition-colors text-sm text-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-brand-black text-lg">Delete Account</h3>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-brand-gray-mid" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-1">This action is permanent.</p>
                <p className="text-xs text-red-600">
                  Your account, roadmaps, resumes, XP, badges, and all data will be permanently deleted.
                  This cannot be undone.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">
                  Type <span className="font-bold text-brand-black">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium
                             text-brand-gray-mid hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium
                             hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={handleClosePasswordModal}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-brand-black text-lg">Change Password</h3>
              <button onClick={handleClosePasswordModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5 text-brand-gray-mid" />
              </button>
            </div>

            {/* Step 1 — Send OTP */}
            {pwStep === 'send' && (
              <div className="px-6 py-5">
                <p className="text-sm text-brand-gray-mid mb-5">
                  We'll send a 6-digit verification code to{' '}
                  <span className="font-semibold text-brand-black">{user?.email}</span>.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium
                               text-brand-gray-mid hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-brand-yellow text-brand-black text-sm font-medium
                               hover:bg-brand-yellow-dark transition-colors disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending…' : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Enter OTP + new password */}
            {pwStep === 'verify' && (
              <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
                <p className="text-xs text-brand-gray-mid">
                  Enter the 6-digit code sent to your email and choose a new password.
                </p>

                {/* OTP */}
                <div>
                  <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-yellow tracking-widest text-center"
                  />
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-brand-black text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                    <button type="button" onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-mid hover:text-brand-black">
                      {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-brand-black text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-mid hover:text-brand-black">
                      {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setPwStep('send')}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium
                               text-brand-gray-mid hover:border-gray-300 transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={isSavingPassword || otp.length < 6}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-brand-yellow text-brand-black text-sm font-medium
                               hover:bg-brand-yellow-dark transition-colors disabled:opacity-50">
                    {isSavingPassword ? 'Saving…' : 'Update Password'}
                  </button>
                </div>

                <button type="button" onClick={handleSendOtp} disabled={isSendingOtp}
                  className="w-full text-center text-xs text-brand-gray-mid hover:text-brand-black transition-colors pt-1">
                  {isSendingOtp ? 'Resending…' : 'Resend code'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
