/**
 * RoleGuard — only renders children if user has one of the allowed roles.
 * Otherwise redirects to dashboard.
 */
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function RoleGuard({ roles, children }) {
  const { user } = useAuthStore()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}
