/**
 * Login page — email + password form with JWT auth.
 * TIP yellow/black auth layout.
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Mag-login</h2>
      <p className="text-brand-gray-mid text-sm mb-6">
        Welcome back! Ipasok ang iyong credentials.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-brand-gray-mid mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full px-4 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                       text-white placeholder:text-brand-gray-mid
                       focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-brand-gray-mid mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                       text-white placeholder:text-brand-gray-mid
                       focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
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

      {/* Register link */}
      <p className="text-brand-gray-mid text-sm text-center mt-6">
        Wala pang account?{' '}
        <Link to="/auth/register" className="text-brand-yellow hover:underline font-medium">
          Mag-register dito
        </Link>
      </p>
    </div>
  )
}
