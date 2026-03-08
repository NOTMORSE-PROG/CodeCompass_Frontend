/**
 * Auth store — manages user session, tokens, and role.
 * Tokens are stored in localStorage; role is decoded from JWT (no extra API call).
 * User state is initialized SYNCHRONOUSLY at module load to prevent flash redirects.
 */
import { create } from 'zustand'
import { authApi, decodeToken } from '../api/auth'
import toast from 'react-hot-toast'

/** Decode a token and return a user object, or null if invalid/expired. */
const _userFromToken = (token) => {
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload || payload.exp * 1000 <= Date.now()) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }
  return {
    id: payload.user_id,
    email: payload.email,
    fullName: payload.full_name || '',
    role: payload.role || null,
    isOnboarded: payload.is_onboarded ?? false,
  }
}

const useAuthStore = create((set, get) => ({
  // Synchronous init — no flash on page load
  user: _userFromToken(localStorage.getItem('access_token')),
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  isLoading: false,

  /** Register a new account. */
  register: async (formData) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.register(formData)
      get()._saveSession(data)
      toast.success(`Welcome to CodeCompass, ${data.user.firstName}!`)
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
        toast.success(`Welcome back, ${data.user.firstName}!`)
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
        fullName: payload?.full_name || (user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : ''),
        role: payload?.role || null,
        isOnboarded: payload?.is_onboarded ?? user?.isOnboarded ?? false,
      },
    })
  },
}))

/**
 * Called by client.js after a silent token refresh so Zustand stays in sync
 * with the new token's claims without requiring a page reload.
 */
export const decodeAndUpdateUser = (accessToken) => {
  const payload = decodeToken(accessToken)
  if (!payload) return
  useAuthStore.setState((state) => ({
    accessToken,
    user: state.user ? {
      ...state.user,
      role: payload.role ?? state.user.role,
      isOnboarded: payload.is_onboarded ?? state.user.isOnboarded,
    } : null,
  }))
}

export default useAuthStore
