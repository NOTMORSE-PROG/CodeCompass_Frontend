/**
 * Auth store — manages user session, tokens, and role.
 * Tokens are stored in localStorage; role is decoded from JWT (no extra API call).
 */
import { create } from 'zustand'
import { authApi, decodeToken } from '../api/auth'
import toast from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  isLoading: false,

  /** Hydrate user from stored token on page load. */
  hydrate: () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      const payload = decodeToken(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        set({
          accessToken: token,
          refreshToken: localStorage.getItem('refresh_token'),
          user: {
            id: payload.user_id,
            email: payload.email,
            fullName: payload.full_name,
            role: payload.role,
            isOnboarded: payload.is_onboarded,
          },
        })
      } else {
        // Token expired — clear
        get().logout()
      }
    }
  },

  /** Register a new account. */
  register: async (formData) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.register(formData)
      get()._saveSession(data)
      toast.success(`Welcome to CodeCompass, ${data.user.first_name}!`)
      return { success: true, user: data.user }
    } catch (error) {
      const msg = error.response?.data?.detail
        || Object.values(error.response?.data || {})[0]?.[0]
        || 'Registration failed.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Log in with email + password. */
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login({ email, password })
      get()._saveSession(data)
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid email or password.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Log out — clear tokens and user state. */
  logout: async () => {
    const refreshToken = get().refreshToken
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Ignore errors on logout
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, refreshToken: null })
  },

  /** Update user's onboarded status (called after completing onboarding). */
  setOnboarded: () => {
    set((state) => ({
      user: state.user ? { ...state.user, isOnboarded: true } : null,
    }))
  },

  /** Sign in with Google — verifies ID token on backend, creates account if needed. */
  loginWithGoogle: async (credential) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.googleAuth(credential)
      get()._saveSession(data)
      if (!data.isNewUser) {
        toast.success(`Welcome back, ${data.user.firstName || data.user.first_name}!`)
      }
      return { success: true, isNewUser: data.isNewUser }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Google sign-in failed.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Set role for new Google OAuth users (before onboarding). Returns fresh tokens. */
  setRole: async (role) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.setRole(role)
      get()._saveSession(data)
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to set role.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Internal: save tokens and decode user from JWT. */
  _saveSession: ({ access, refresh, user }) => {
    localStorage.setItem('access_token', access)
    if (refresh) localStorage.setItem('refresh_token', refresh)

    const payload = decodeToken(access)
    set({
      accessToken: access,
      refreshToken: refresh || localStorage.getItem('refresh_token'),
      user: {
        id: payload?.user_id || user?.id,
        email: payload?.email || user?.email,
        fullName: payload?.full_name || `${user?.first_name} ${user?.last_name}`,
        role: payload?.role || user?.role,
        isOnboarded: payload?.is_onboarded ?? user?.is_onboarded ?? false,
      },
    })
  },
}))

export default useAuthStore
