/**
 * Onboarding layout — passthrough wrapper.
 * The onboarding page manages its own full-screen layout.
 */
import { Outlet } from 'react-router-dom'

export default function OnboardingLayout() {
  return <Outlet />
}
