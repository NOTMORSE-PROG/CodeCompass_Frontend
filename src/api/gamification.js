import apiClient from './client'

export const gamificationApi = {
  getProfile: () => apiClient.get('/gamification/profile/'),
  getAllBadges: () => apiClient.get('/gamification/badges/'),
  getEarnedBadges: () => apiClient.get('/gamification/badges/earned/'),
  getXPHistory: () => apiClient.get('/gamification/xp-history/'),
  getLeaderboard: (period = 'weekly') => apiClient.get(`/gamification/leaderboard/?period=${period}`),
}
