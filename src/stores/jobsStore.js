import { create } from 'zustand'
import { jobsApi } from '../api/jobs'

const useJobsStore = create((set) => ({
  jobs: [],
  recommendedJobs: [],
  savedJobs: [],
  savedJobIds: new Set(),
  isLoading: false,
  isLoadingRecommended: false,
  pdfRecommendations: [],
  isPdfLoading: false,
  hasPdfRecommendations: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,

  fetchJobs: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await jobsApi.list(params)
      if (data.results !== undefined) {
        // Paginated response
        set({
          jobs: data.results,
          totalCount: data.count ?? 0,
          currentPage: params.page ?? 1,
        })
      } else {
        set({ jobs: data, totalCount: data.length, currentPage: 1 })
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Page out of range — reset to page 1
        set({ jobs: [], totalCount: 0, currentPage: 1 })
      } else {
        set({ error: err.response?.data?.detail ?? 'Failed to load jobs.' })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRecommended: async () => {
    set({ isLoadingRecommended: true })
    try {
      const { data } = await jobsApi.getRecommended()
      set({ recommendedJobs: data })
    } catch {
      /* silent — recommendations are bonus */
    } finally {
      set({ isLoadingRecommended: false })
    }
  },

  getRecommendationsFromResume: async (resumeText) => {
    set({ isPdfLoading: true })
    try {
      const { data } = await jobsApi.recommendFromResume(resumeText)
      set({ pdfRecommendations: data, hasPdfRecommendations: true })
    } catch {
      set({ pdfRecommendations: [], hasPdfRecommendations: false })
    } finally {
      set({ isPdfLoading: false })
    }
  },

  clearPdfRecommendations: () => {
    set({ pdfRecommendations: [], hasPdfRecommendations: false, isPdfLoading: false })
  },

  fetchSavedJobs: async () => {
    try {
      const { data } = await jobsApi.listSaved()
      const items = data.results ?? data
      set({
        savedJobs: items.map((s) => s.job),
        savedJobIds: new Set(items.map((s) => s.job.id)),
      })
    } catch {
      /* silent */
    }
  },

  saveJob: async (jobId) => {
    set((state) => ({ savedJobIds: new Set([...state.savedJobIds, jobId]) }))
    try {
      await jobsApi.saveJob(jobId)
    } catch {
      // Revert on failure
      set((state) => {
        const next = new Set(state.savedJobIds)
        next.delete(jobId)
        return { savedJobIds: next }
      })
    }
  },

  unsaveJob: async (jobId) => {
    set((state) => {
      const next = new Set(state.savedJobIds)
      next.delete(jobId)
      return { savedJobIds: next }
    })
    try {
      await jobsApi.unsaveJob(jobId)
    } catch {
      // Revert on failure
      set((state) => ({ savedJobIds: new Set([...state.savedJobIds, jobId]) }))
    }
  },
}))

export default useJobsStore
