import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import useRoadmapStore from '../../stores/roadmapStore'
import useGamificationStore from '../../stores/gamificationStore'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { roadmaps, currentRoadmap, fetchRoadmaps, fetchRoadmap } = useRoadmapStore()
  const { profile: gamProfile, fetchProfile } = useGamificationStore()

  useEffect(() => {
    fetchRoadmaps()
    fetchProfile()
  }, [fetchRoadmaps, fetchProfile])

  useEffect(() => {
    if (roadmaps.length > 0 && !currentRoadmap) {
      fetchRoadmap(roadmaps[0].id)
    }
  }, [roadmaps, currentRoadmap, fetchRoadmap])

  const roadmap = currentRoadmap
  const completionPct = roadmap?.completionPercentage ?? 0
  const xpTotal = gamProfile?.xpTotal ?? 0
  const streakCount = gamProfile?.streakCount ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-black mb-1">
        Welcome back, {user?.fullName?.split(' ')[0]}!
      </h1>
      <p className="text-brand-gray-mid mb-6">
        Ready to level up your skills today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Roadmap Progress Card */}
        <Link to="/app/roadmap" className="card border-l-4 border-l-brand-yellow hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-black mb-1">My Roadmap</h3>
          <p className="text-brand-gray-mid text-sm mb-3">
            {roadmap ? roadmap.title : 'No roadmap yet — generate one!'}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-brand-yellow h-2 rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-brand-gray-mid">{completionPct}% completed</p>
        </Link>

        {/* AI Chat Card */}
        <Link to="/app/ai-chat" className="card border-l-4 border-l-blue-400 hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-black mb-1">AI Career Assistant</h3>
          <p className="text-brand-gray-mid text-sm mb-3">
            Ask anything about your career path
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Online — Ready to help!</span>
          </div>
        </Link>

        {/* XP + Streak Card */}
        <Link to="/app/achievements" className="card border-l-4 border-l-orange-400 hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-black mb-1">Your Progress</h3>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-black text-brand-yellow">{xpTotal.toLocaleString()}</p>
              <p className="text-brand-gray-mid text-sm">XP points earned</p>
            </div>
            {streakCount > 0 && (
              <div className="pb-1">
                <p className="text-2xl font-black text-orange-500">{streakCount}</p>
                <p className="text-brand-gray-mid text-xs">day streak</p>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Next steps from roadmap */}
      {roadmap && roadmap.nodes?.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-black">Next Steps</h2>
            <Link to="/app/roadmap" className="text-sm text-brand-yellow font-medium hover:underline">
              View full roadmap →
            </Link>
          </div>
          <div className="space-y-2">
            {roadmap.nodes
              .filter((n) => n.status === 'available' || n.status === 'in_progress')
              .slice(0, 3)
              .map((node) => (
                <Link
                  key={node.id}
                  to="/app/roadmap"
                  className="flex items-center gap-3 p-3 bg-white border border-brand-yellow/30 rounded-lg hover:border-brand-yellow hover:shadow-sm transition-all"
                >
                  <div className="w-2 h-2 bg-brand-yellow rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-black text-sm truncate">{node.title}</p>
                    <p className="text-xs text-brand-gray-mid">
                      {node.nodeType} • {node.estimatedHours}h • {node.xpReward} XP
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand-yellow flex-shrink-0">Start →</span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="font-bold text-brand-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'View Roadmap', href: '/app/roadmap',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h6m6 0h6" />
                </svg>
              ),
            },
            {
              label: 'Chat with AI', href: '/app/ai-chat',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27A7.93 7.93 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
            },
            {
              label: 'Find Mentors', href: '/app/mentors',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.712M9 20H4v-2a4 4 0 015.356-3.712M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              label: 'Browse Jobs', href: '/app/jobs',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              ),
            },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="card flex flex-col items-center gap-2 hover:border-brand-yellow hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-brand-gray-mid">{item.icon}</div>
              <p className="text-sm font-medium text-brand-black">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
