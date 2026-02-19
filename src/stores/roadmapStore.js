/**
 * Roadmap store — manages the user's current roadmap and node states.
 */
import { create } from 'zustand'
import { roadmapApi } from '../api/roadmaps'
import toast from 'react-hot-toast'

const useRoadmapStore = create((set, get) => ({
  roadmaps: [],
  currentRoadmap: null,
  isLoading: false,
  isGenerating: false,

  fetchRoadmaps: async () => {
    set({ isLoading: true })
    try {
      const { data } = await roadmapApi.list()
      set({ roadmaps: data.results || data })
    } catch {
      // Silently fail — user will see empty state
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRoadmap: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await roadmapApi.detail(id)
      set({ currentRoadmap: data })
      return data
    } catch {
      toast.error('Failed to load roadmap.')
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  generateRoadmap: async () => {
    set({ isGenerating: true })
    try {
      const { data } = await roadmapApi.generate()
      set((state) => ({
        roadmaps: [data, ...state.roadmaps],
        currentRoadmap: data,
        isGenerating: false,
      }))
      toast.success('Your personalized roadmap is ready!')
      return data
    } catch (error) {
      const msg = error.response?.data?.detail || 'Roadmap generation failed.'
      toast.error(msg)
      set({ isGenerating: false })
      return null
    }
  },

  updateNodeStatus: async (roadmapId, nodeId, status) => {
    try {
      const { data } = await roadmapApi.updateNodeStatus(roadmapId, nodeId, status)
      // Update node in current roadmap
      set((state) => {
        if (!state.currentRoadmap) return state
        const updatedNodes = state.currentRoadmap.nodes.map((n) =>
          n.id === nodeId ? { ...n, status: data.status, completedAt: data.completedAt } : n
        )
        return {
          currentRoadmap: {
            ...state.currentRoadmap,
            nodes: updatedNodes,
          },
        }
      })
      if (status === 'completed') {
        toast.success(`+${data.xpReward} XP! Node completed!`)
      }
      return data
    } catch {
      toast.error('Failed to update node status.')
      return null
    }
  },
}))

export default useRoadmapStore
