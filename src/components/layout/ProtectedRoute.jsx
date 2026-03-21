/**
 * ProtectedRoute — redirects unauthenticated users to /auth/login.
 * If requireOnboarded=true, also redirects non-onboarded users to /onboarding.
 * Email verification is required before onboarding unless skipEmailCheck=true.
 */
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function ProtectedRoute({ requireOnboarded = false, skipEmailCheck = false }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!skipEmailCheck && !user.emailVerified) {
    return <Navigate to="/verify-email-pending" replace />
  }

  if (requireOnboarded && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
