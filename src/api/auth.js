/**
 * Auth API functions.
 * JWT role is decoded client-side from the token payload — no extra API call needed.
 */
import apiClient from './client'

export const authApi = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  logout: (refreshToken) => apiClient.post('/auth/logout/', { refresh: refreshToken }),
  me: () => apiClient.get('/auth/me/'),
  changePassword: (data) => apiClient.post('/auth/change-password/', data),
  // Google OAuth
  googleAuth: (credential) => apiClient.post('/auth/google/', { credential }),
  setRole: (role) => apiClient.post('/auth/set-role/', { role }),
}

/**
 * Decode the role from the JWT access token without an API call.
 * The token payload contains: role, email, full_name, is_onboarded
 */
export function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}
