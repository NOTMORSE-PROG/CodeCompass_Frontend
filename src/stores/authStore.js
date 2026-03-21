/**
 * Auth store — manages user session, tokens, and role.
 * Tokens are stored in localStorage; role is decoded from JWT (no extra API call).
 * User state is initialized SYNCHRONOUSLY at module load to prevent flash redirects.
 */
import { create } from 'zustand'
import { authApi, decodeToken } from '../api/auth'
import toast from 'react-hot-toast'
// Imported here (not dynamically) so Vite can place them in the same chunk.
// Circular refs are safe with Zustand — stores are plain objects, not executed at import time.
import useChatStore from './chatStore'
import useRoadmapStore from './roadmapStore'

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
    emailVerified: payload.email_verified ?? false,
    hasPassword: payload.has_password ?? true,
    googleConnected: payload.google_connected ?? false,
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

  /** Log out — clear tokens and user state. Also resets roadmap/chat stores to prevent
   * data leakage when a different user logs in on the same device. */
  logout: async () => {
    const refreshToken = get().refreshToken
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Ignore errors on logout
      }
    }
    // Close active WebSocket before clearing chat state
    const { ws } = useChatStore.getState()
    if (ws) ws.close()

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, refreshToken: null })

    // Clear other stores so User B never sees User A's data
    useRoadmapStore.setState({ roadmaps: [], currentRoadmap: null, isLoading: false, isGenerating: false })
    useChatStore.setState({
      sessions: [], currentSession: null, messages: [],
      streamingContent: '', isStreaming: false, wsConnected: false,
      suggestions: [], ws: null, _sessionCreating: false,
    })
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
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Google sign-in failed.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Connect a Google account to an existing email-registered account. */
  connectGoogle: async (credential) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.connectGoogle(credential)
      get()._saveSession(data)
      toast.success('Google account connected!')
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to connect Google account.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      set({ isLoading: false })
    }
  },

  /** Permanently delete the authenticated user's account. */
  deleteAccount: async () => {
    set({ isLoading: true })
    try {
      const { refreshToken } = get()
      await authApi.deleteAccount(refreshToken)
      // Close active WebSocket before clearing state
      const { ws } = useChatStore.getState()
      if (ws) ws.close()
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, accessToken: null, refreshToken: null })
      useRoadmapStore.setState({ roadmaps: [], currentRoadmap: null, isLoading: false, isGenerating: false })
      useChatStore.setState({
        sessions: [], currentSession: null, messages: [],
        streamingContent: '', isStreaming: false, wsConnected: false,
        suggestions: [], ws: null, _sessionCreating: false,
      })
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to delete account.'
      toast.error(msg)
      return { success: false }
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
        emailVerified: payload?.email_verified ?? user?.emailVerified ?? false,
        hasPassword: payload?.has_password ?? true,
        googleConnected: payload?.google_connected ?? false,
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
      emailVerified: payload.email_verified ?? state.user.emailVerified,
      hasPassword: payload.has_password ?? state.user.hasPassword,
      googleConnected: payload.google_connected ?? state.user.googleConnected,
    } : null,
  }))
}

export default useAuthStore
