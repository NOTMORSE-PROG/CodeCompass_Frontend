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

  updateNodeStatus: async (roadmapId, nodeId, newStatus) => {
    try {
      const { data } = await roadmapApi.updateNodeStatus(roadmapId, nodeId, newStatus)
      // data = { node, completionPercentage }
      const updatedNode = data.node

      if (newStatus === 'completed') {
        // Re-fetch full roadmap to sync unlocked nodes
        toast.success(`+${updatedNode.xpReward} XP! Node completed!`)
        get().fetchRoadmap(roadmapId)
      } else {
        // Optimistic update for in_progress
        set((state) => {
          if (!state.currentRoadmap) return state
          return {
            currentRoadmap: {
              ...state.currentRoadmap,
              completionPercentage: data.completionPercentage,
              nodes: state.currentRoadmap.nodes.map((n) =>
                n.id === nodeId
                  ? { ...n, status: updatedNode.status, completedAt: updatedNode.completedAt }
                  : n
              ),
            },
          }
        })
      }
      return data
    } catch {
      toast.error('Failed to update node status.')
      return null
    }
  },
}))

export default useRoadmapStore
