/**
 * Register page — includes role selector (Incoming Student / Undergraduate / Mentor).
 * Role determines which onboarding flow the user gets.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
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
    desc: 'Pre-college / High school — exploring CCS programs and universities',
    emoji: '🎓',
  },
  {
    value: 'undergraduate',
    label: 'Undergraduate Student',
    desc: 'Currently enrolled in a CCS program — need career guidance',
    emoji: '💻',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    desc: 'IT professional or professor — willing to guide students',
    emoji: '🧑‍💼',
  },
]

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')

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
      <h2 className="text-2xl font-bold text-white mb-1">Gumawa ng Account</h2>
      <p className="text-brand-gray-mid text-sm mb-6">
        Sumali sa PathFinder — ang career mentor mo sa IT!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-brand-gray-mid mb-2">
            Sino ka? (Select your role)
          </label>
          <div className="space-y-2">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleSelect(role.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                  selectedRole === role.value
                    ? 'border-brand-yellow bg-brand-yellow/10 text-white'
                    : 'border-brand-black-border bg-brand-black-muted text-brand-gray-mid hover:border-brand-yellow/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{role.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{role.label}</p>
                    <p className="text-xs opacity-70">{role.desc}</p>
                  </div>
                  {selectedRole === role.value && (
                    <span className="ml-auto text-brand-yellow font-bold">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <input type="hidden" {...register('role')} />
          {errors.role && (
            <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-gray-mid mb-1">First Name</label>
            <input
              type="text"
              placeholder="Juan"
              className="w-full px-3 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                         text-white placeholder:text-brand-gray-mid
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
              {...register('firstName')}
            />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-gray-mid mb-1">Last Name</label>
            <input
              type="text"
              placeholder="dela Cruz"
              className="w-full px-3 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                         text-white placeholder:text-brand-gray-mid
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
              {...register('lastName')}
            />
            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-brand-gray-mid mb-1">Email Address</label>
          <input
            type="email"
            placeholder="juan@tip.edu.ph"
            className="w-full px-4 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                       text-white placeholder:text-brand-gray-mid
                       focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
            {...register('email')}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-gray-mid mb-1">Password</label>
            <input
              type="password"
              placeholder="Min. 8 chars"
              className="w-full px-3 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                         text-white placeholder:text-brand-gray-mid
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
              {...register('password')}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-gray-mid mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              className="w-full px-3 py-2.5 rounded-lg bg-brand-black-muted border border-brand-black-border
                         text-white placeholder:text-brand-gray-mid
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
              {...register('passwordConfirm')}
            />
            {errors.passwordConfirm && <p className="text-red-400 text-xs mt-1">{errors.passwordConfirm.message}</p>}
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

      <p className="text-brand-gray-mid text-sm text-center mt-6">
        May account na?{' '}
        <Link to="/auth/login" className="text-brand-yellow hover:underline font-medium">
          Mag-login dito
        </Link>
      </p>
    </div>
  )
}
