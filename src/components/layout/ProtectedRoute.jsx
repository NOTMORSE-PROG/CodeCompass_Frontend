/**
 * ProtectedRoute — redirects unauthenticated users to /auth/login.
 * If requireRole=true, redirects users without a role to /auth/google-setup.
 * If requireOnboarded=true, also redirects non-onboarded users to /onboarding.
 */
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function ProtectedRoute({ requireRole = false, requireOnboarded = false }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (requireRole && !user.role) {
    return <Navigate to="/auth/google-setup" replace />
  }

  if (requireOnboarded && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
