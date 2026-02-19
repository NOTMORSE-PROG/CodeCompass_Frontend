import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'

// Layouts
import AuthLayout from './components/layout/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import OnboardingLayout from './components/layout/OnboardingLayout'

// Landing page
import LandingPage from './pages/LandingPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import GoogleSetupPage from './pages/auth/GoogleSetupPage'

// Onboarding pages
import OnboardingPage from './pages/onboarding/OnboardingPage'

// App pages
import DashboardPage from './pages/app/DashboardPage'
import RoadmapPage from './pages/app/RoadmapPage'
import AIChatPage from './pages/app/AIChatPage'
import MentorsPage from './pages/app/MentorsPage'
import JobsPage from './pages/app/JobsPage'
import UniversitiesPage from './pages/app/UniversitiesPage'
import CertificationsPage from './pages/app/CertificationsPage'
import AchievementsPage from './pages/app/AchievementsPage'
import ProfilePage from './pages/app/ProfilePage'

// Route guards
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleGuard from './components/layout/RoleGuard'

export default function App() {
  const { hydrate } = useAuthStore()

  useEffect(() => {
    // Restore user session from stored tokens on app load
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        {/* Google OAuth role setup — authenticated, no onboarding check */}
        <Route element={<ProtectedRoute />}>
          <Route path="/auth/google-setup" element={<GoogleSetupPage />} />
        </Route>

        {/* Onboarding — authenticated but not onboarded */}
        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
        </Route>

        {/* Main app — authenticated + onboarded */}
        <Route element={<ProtectedRoute requireOnboarded />}>
          <Route element={<AppLayout />}>
            <Route path="/app/dashboard" element={<DashboardPage />} />
            <Route path="/app/roadmap" element={<RoadmapPage />} />
            <Route path="/app/ai-chat" element={<AIChatPage />} />
            <Route path="/app/mentors" element={<MentorsPage />} />
            <Route path="/app/jobs" element={<JobsPage />} />
            {/* University finder — incoming students + admins */}
            <Route
              path="/app/universities"
              element={
                <RoleGuard roles={['incoming_student', 'admin']}>
                  <UniversitiesPage />
                </RoleGuard>
              }
            />
            <Route path="/app/certifications" element={<CertificationsPage />} />
            <Route path="/app/achievements" element={<AchievementsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
