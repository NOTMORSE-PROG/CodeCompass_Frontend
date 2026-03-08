import { create } from 'zustand'
import { gamificationApi } from '../api/gamification'

const useGamificationStore = create((set) => ({
  profile: null,
  allBadges: [],
  earnedBadges: [],
  xpHistory: [],
  leaderboard: [],
  leaderboardPeriod: 'weekly',
  isLoading: false,

  fetchProfile: async () => {
    try {
      const { data } = await gamificationApi.getProfile()
      set({ profile: data })
    } catch {
      /* silent */
    }
  },

  fetchAllBadges: async () => {
    try {
      const { data } = await gamificationApi.getAllBadges()
      set({ allBadges: data.results || data })
    } catch {
      /* silent */
    }
  },

  fetchEarnedBadges: async () => {
    try {
      const { data } = await gamificationApi.getEarnedBadges()
      set({ earnedBadges: data.results || data })
    } catch {
      /* silent */
    }
  },

  fetchXPHistory: async () => {
    try {
      const { data } = await gamificationApi.getXPHistory()
      set({ xpHistory: data.results || data })
    } catch {
      /* silent */
    }
  },

  fetchLeaderboard: async (period = 'weekly') => {
    set({ isLoading: true, leaderboardPeriod: period })
    try {
      const { data } = await gamificationApi.getLeaderboard(period)
      set({ leaderboard: data.results || data })
    } catch {
      /* silent */
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useGamificationStore
