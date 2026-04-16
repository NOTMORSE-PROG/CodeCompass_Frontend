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

  applyEditProposals: async (proposals, { sessionId, contextType } = {}) => {
    // Scope guard — mirror the backend's FromRoadmapScopedSession permission
    // so users in non-roadmap chat tabs don't get to apply roadmap mutations.
    // Caller (AIChatPage) passes contextType from the session that produced
    // the proposal; if omitted, we fall through (legacy / non-chat callers).
    if (contextType && contextType !== 'roadmap') {
      toast.error('Roadmap changes only apply from the Roadmap tab.')
      return false
    }

    const list = Array.isArray(proposals) ? proposals : [proposals]
    const isPlaceholder = (v) => v == null || String(v).trim() === '' || String(v).trim() === '?'
    const VALID_ACTIONS = ['edit_node', 'edit_roadmap', 'replace_node']

    // Validate all proposals before executing any
    for (const p of list) {
      const { action, roadmap_id, node_id, changes } = p
      if (!VALID_ACTIONS.includes(action) || isPlaceholder(roadmap_id)) {
        toast.error('This proposal is incomplete — ask the AI to clarify.')
        return false
      }
      if (['edit_node', 'replace_node'].includes(action) && isPlaceholder(node_id)) {
        toast.error('This proposal is incomplete — ask the AI to clarify.')
        return false
      }
      if (['edit_node', 'edit_roadmap', 'replace_node'].includes(action)) {
        if (!changes || typeof changes !== 'object' || Object.keys(changes).length === 0
            || Object.values(changes).some(isPlaceholder)) {
          toast.error('This proposal is incomplete — ask the AI to clarify.')
          return false
        }
      }
    }

    try {
      // Execute all actions sequentially
      for (const p of list) {
        const { action, roadmap_id, node_id, changes } = p
        if (action === 'edit_roadmap') {
          await roadmapApi.editRoadmapMeta(roadmap_id, changes, { sessionId })
        } else if (action === 'edit_node') {
          await roadmapApi.editNodeContent(roadmap_id, node_id, changes, { sessionId })
        } else if (action === 'replace_node') {
          await roadmapApi.replaceNode(roadmap_id, node_id, changes, { sessionId })
        }
      }
      // Single re-fetch after all actions complete
      await get().fetchRoadmap(list[0].roadmap_id)
      toast.success(list.length > 1 ? `${list.length} changes applied!` : 'Roadmap updated!')
      return true
    } catch (error) {
      const detail = error?.response?.data?.detail
      if (detail) {
        toast.error(detail)
      } else {
        toast.error('Could not apply that change.')
      }
      return false
    }
  },

  upskillRoadmap: async (upskillProposal, { sessionId, contextType } = {}) => {
    if (contextType && contextType !== 'roadmap') {
      toast.error('Roadmap changes only apply from the Roadmap tab.')
      return false
    }
    set({ isGenerating: true })
    try {
      const { data } = await roadmapApi.upskillRoadmap(
        { roadmap_id: upskillProposal.roadmap_id },
        { sessionId },
      )
      set((state) => ({
        roadmaps: [data, ...state.roadmaps.filter(r => r.id !== upskillProposal.roadmap_id)],
        currentRoadmap: data,
        isGenerating: false,
      }))
      toast.success('Your advanced roadmap is ready!')
      return true
    } catch (error) {
      const msg = error.response?.data?.detail || 'Roadmap upskill failed. Please try again.'
      toast.error(msg)
      set({ isGenerating: false })
      return false
    }
  },

  switchRoadmap: async (switchProposal, { sessionId, contextType } = {}) => {
    if (contextType && contextType !== 'roadmap') {
      toast.error('Roadmap changes only apply from the Roadmap tab.')
      return false
    }
    set({ isGenerating: true })
    try {
      const { data } = await roadmapApi.switchRoadmap(
        {
          roadmap_id: switchProposal.roadmap_id,
          new_path: switchProposal.new_path,
          career_goal: switchProposal.career_goal,
        },
        { sessionId },
      )
      set((state) => ({
        roadmaps: [data, ...state.roadmaps.filter(r => r.id !== switchProposal.roadmap_id)],
        currentRoadmap: data,
        isGenerating: false,
      }))
      toast.success('Your new roadmap is ready!')
      return true
    } catch (error) {
      const msg = error.response?.data?.detail || 'Roadmap switch failed. Please try again.'
      toast.error(msg)
      set({ isGenerating: false })
      return false
    }
  },

  updateNodeStatus: async (roadmapId, nodeId, newStatus) => {
    try {
      const { data } = await roadmapApi.updateNodeStatus(roadmapId, nodeId, newStatus)
      // data = { node, completionPercentage }
      const updatedNode = data.node

      if (newStatus === 'completed') {
        // Snapshot statuses before re-fetch to detect newly unlocked nodes
        const prevStatuses = Object.fromEntries(
          (get().currentRoadmap?.nodes ?? []).map((n) => [n.id, n.status])
        )
        if (data.xpAwarded) {
          toast.success(`+${updatedNode.xpReward} XP! Node completed!`)
        }
        const refreshed = await get().fetchRoadmap(roadmapId)
        const newlyUnlocked = refreshed?.nodes?.filter(
          (n) => prevStatuses[n.id] === 'locked' && n.status === 'available'
        ) ?? []
        return { ...data, newlyUnlocked }
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
