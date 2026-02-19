/**
 * Login page — email + password form with JWT auth + Google OAuth.
 * Light theme — white background, yellow accents.
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import useAuthStore from '../../stores/authStore'

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (result.success) {
      const { user } = useAuthStore.getState()
      navigate(user?.isOnboarded ? '/app/dashboard' : '/onboarding', { replace: true })
    }
  }

  const handleGoogleSuccess = async ({ credential }) => {
    const result = await loginWithGoogle(credential)
    if (result.success) {
      if (result.isNewUser) {
        navigate('/auth/google-setup', { replace: true })
      } else {
        const { user } = useAuthStore.getState()
        navigate(user?.isOnboarded ? '/app/dashboard' : '/onboarding', { replace: true })
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Sign In</h2>
      <p className="text-gray-500 text-sm mb-6">
        Welcome back! Enter your credentials to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            className="input"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="input"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-gray-400 text-xs">
            or sign in with
          </span>
        </div>
      </div>

      {/* Google Sign-In */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google sign-in failed. Try again.')}
          theme="outline"
          size="large"
          width="368"
          text="signin_with"
          shape="rectangular"
        />
      </div>

      {/* Register link */}
      <p className="text-gray-500 text-sm text-center mt-6">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-brand-black font-semibold hover:text-brand-yellow transition-colors">
          Register here
        </Link>
      </p>
    </div>
  )
}
