/**
 * ProtectedRoute — redirects unauthenticated users to /auth/login.
 * If requireOnboarded=true, also redirects non-onboarded users to /onboarding.
 */
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function ProtectedRoute({ requireOnboarded = false }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (requireOnboarded && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
