/**
 * Register page — includes role selector (Incoming Student / Undergraduate / Mentor).
 * Light theme — white background, yellow accents.
 */
import { useState } from 'react'
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
  role: z.enum(['incoming_student', 'undergraduate', 'mentor'], {
    errorMap: () => ({ message: 'Please select your role.' }),
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match.',
  path: ['passwordConfirm'],
})

const ROLES = [
  {
    value: 'incoming_student',
    label: 'Incoming Student',
    desc: 'Pre-college / High school — exploring CCS programs and career paths',
    emoji: '🎓',
  },
  {
    value: 'undergraduate',
    label: 'Undergraduate / Shifter',
    desc: 'Enrolled in CCS or shifting to CCS — get a skill roadmap, certifications, and job matches',
    emoji: '💻',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    desc: 'IT professional or professor — guide the next generation of CCS students',
    emoji: '🧑‍💼',
  },
]

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')

  const handleGoogleSuccess = async ({ credential }) => {
    const result = await loginWithGoogle(credential)
    if (result.success) {
      navigate('/auth/google-setup', { replace: true })
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    const result = await registerUser({
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.email.split('@')[0] + Math.floor(Math.random() * 1000),
      email: data.email,
      role: data.role,
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
        Join CodeCompass — your AI-powered IT career mentor!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who are you? (Select your role)
          </label>
          <div className="space-y-2">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleSelect(role.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                  selectedRole === role.value
                    ? 'border-brand-yellow bg-brand-yellow/10 text-brand-black'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-yellow/50 hover:bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{role.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.desc}</p>
                  </div>
                  {selectedRole === role.value && (
                    <span className="ml-auto text-brand-yellow font-bold text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <input type="hidden" {...register('role')} />
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>

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
