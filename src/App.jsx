import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import AuthLayout from './components/layout/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import OnboardingLayout from './components/layout/OnboardingLayout'

// Landing page
import LandingPage from './pages/LandingPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPendingPage from './pages/auth/VerifyEmailPendingPage'
import VerifyEmailCallbackPage from './pages/auth/VerifyEmailCallbackPage'

// Onboarding pages
import OnboardingPage from './pages/onboarding/OnboardingPage'

// App pages
import DashboardPage from './pages/app/DashboardPage'
import RoadmapPage from './pages/app/RoadmapPage'
import AIChatPage from './pages/app/AIChatPage'
import ResumePage from './pages/app/ResumePage'
import JobsPage from './pages/app/JobsPage'
import UniversitiesPage from './pages/app/UniversitiesPage'
import CertificationsPage from './pages/app/CertificationsPage'
import AchievementsPage from './pages/app/AchievementsPage'
import ProfilePage from './pages/app/ProfilePage'
import QuizPage from './pages/app/QuizPage'

// Route guards
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleGuard from './components/layout/RoleGuard'

export default function App() {
  // User state is initialized synchronously in authStore — no useEffect needed
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Email verification — authenticated but not yet verified */}
        <Route element={<ProtectedRoute skipEmailCheck />}>
          <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailCallbackPage />} />
        </Route>

        {/* Onboarding — authenticated + email verified but not yet onboarded */}
        <Route element={<ProtectedRoute requireOnboarded={false} />}>
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
            <Route path="/app/resume" element={<ResumePage />} />
            <Route path="/app/jobs" element={<JobsPage />} />
            {/* University finder — incoming students + admins */}
            <Route
              path="/app/universities"
              element={
                <RoleGuard roles={['incoming_student', 'undergraduate', 'admin']}>
                  <UniversitiesPage />
                </RoleGuard>
              }
            />
            <Route path="/app/certifications" element={<CertificationsPage />} />
            <Route path="/app/achievements" element={<AchievementsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
          </Route>
          {/* Quiz page — no sidebar, full-screen focus */}
          <Route path="/app/quiz" element={<QuizPage />} />
        </Route>

        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
