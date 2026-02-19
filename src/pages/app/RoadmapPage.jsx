/**
 * Roadmap page — React Flow canvas with TIP yellow/black themed nodes.
 * Phase 2 will add full AI-generated content.
 */
import { useEffect, useState } from 'react'
import useRoadmapStore from '../../stores/roadmapStore'

export default function RoadmapPage() {
  const { roadmaps, currentRoadmap, fetchRoadmaps, fetchRoadmap, generateRoadmap, isLoading, isGenerating } = useRoadmapStore()

  useEffect(() => {
    fetchRoadmaps()
  }, [fetchRoadmaps])

  useEffect(() => {
    if (roadmaps.length > 0 && !currentRoadmap) {
      fetchRoadmap(roadmaps[0].id)
    }
  }, [roadmaps, currentRoadmap, fetchRoadmap])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-brand-black mb-2">Wala pang Roadmap</h2>
        <p className="text-brand-gray-mid mb-6 max-w-md">
          I-complete muna ang onboarding quiz para ma-generate ang iyong personalized learning roadmap.
        </p>
        <button
          onClick={generateRoadmap}
          disabled={isGenerating}
          className="bg-brand-yellow text-brand-black font-bold px-8 py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all
                     disabled:opacity-50"
        >
          {isGenerating ? 'Gumagawa...' : 'Generate My Roadmap'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {currentRoadmap?.title || 'My Roadmap'}
          </h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            {currentRoadmap?.completionPercentage || 0}% completed •{' '}
            {currentRoadmap?.estimatedWeeks || 0} weeks estimated
          </p>
        </div>
        <span className="badge-yellow">
          {currentRoadmap?.status || 'active'}
        </span>
      </div>

      {/* Roadmap nodes — React Flow will be integrated in Phase 2 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-96">
        {currentRoadmap?.nodes?.length > 0 ? (
          <div className="space-y-3">
            {currentRoadmap.nodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  node.status === 'completed'
                    ? 'bg-brand-yellow border-brand-yellow'
                    : node.status === 'available'
                    ? 'bg-white border-brand-yellow hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  node.status === 'completed' ? 'bg-brand-black text-brand-yellow' : 'bg-gray-200 text-gray-500'
                }`}>
                  {node.status === 'completed' ? '✓' : node.nodeOrder + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-black truncate">{node.title}</p>
                  <p className="text-sm text-brand-gray-mid">{node.nodeType} • {node.estimatedHours}h • {node.xpReward} XP</p>
                </div>
                <span className={`badge text-xs ${
                  node.status === 'completed' ? 'bg-brand-black text-brand-yellow' :
                  node.status === 'available' ? 'bg-brand-yellow text-brand-black' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
