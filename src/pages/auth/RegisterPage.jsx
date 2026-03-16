/**
 * Register page — no role selection; all users start as students.
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
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match.',
  path: ['passwordConfirm'],
})

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      toast.error('Google sign-up failed. Please try again.')
      return
    }
    const result = await loginWithGoogle(credential)
    if (result.success) {
      const { user } = useAuthStore.getState()
      navigate(user?.isOnboarded ? '/app/dashboard' : '/onboarding', { replace: true })
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    const result = await registerUser({
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.email.split('@')[0] + Math.floor(Math.random() * 1000),
      email: data.email,
      password: data.password,
      password_confirm: data.passwordConfirm,
    })
    if (result.success) {
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Create an Account</h2>
      <p className="text-gray-500 text-sm mb-6">
        Join CodeCompass — your AI-powered IT career guide!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" placeholder="Juan" className="input text-sm" {...register('firstName')} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" placeholder="dela Cruz" className="input text-sm" {...register('lastName')} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" placeholder="juan@tip.edu.ph" className="input text-sm" {...register('email')} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input type="password" placeholder="Min. 8 chars" className="input text-sm" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" placeholder="Repeat password" className="input text-sm" {...register('passwordConfirm')} />
            {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-gray-400 text-xs">
            or sign up with
          </span>
        </div>
      </div>

      {/* Google Sign-Up */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google sign-up failed. Try again.')}
          theme="outline"
          size="large"
          width="368"
          text="signup_with"
          shape="rectangular"
          auto_select={false}
        />
      </div>

      <p className="text-gray-500 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-brand-black font-semibold hover:text-brand-yellow transition-colors">
          Sign in here
        </Link>
      </p>
    </div>
  )
}
