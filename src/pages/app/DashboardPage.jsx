import useAuthStore from '../../stores/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-black mb-1">
        Welcome back, {user?.fullName?.split(' ')[0]}! 👋
      </h1>
      <p className="text-brand-gray-mid mb-6">
        Ready to level up your skills today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Roadmap Progress Card */}
        <div className="card border-l-4 border-l-brand-yellow">
          <h3 className="font-semibold text-brand-black mb-1">My Roadmap</h3>
          <p className="text-brand-gray-mid text-sm mb-3">Track your learning progress</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-brand-yellow h-2 rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-xs text-brand-gray-mid">0% completed</p>
        </div>

        {/* AI Chat Card */}
        <div className="card border-l-4 border-l-blue-400">
          <h3 className="font-semibold text-brand-black mb-1">AI Career Assistant</h3>
          <p className="text-brand-gray-mid text-sm mb-3">
            Ask anything about your career path
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Online — Ready to help!</span>
          </div>
        </div>

        {/* XP Card */}
        <div className="card border-l-4 border-l-orange-400">
          <h3 className="font-semibold text-brand-black mb-1">Your Progress</h3>
          <p className="text-4xl font-black text-brand-yellow mb-1">0</p>
          <p className="text-brand-gray-mid text-sm">XP points earned</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="font-bold text-brand-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View Roadmap', href: '/app/roadmap', emoji: '🗺️' },
            { label: 'Chat with AI', href: '/app/ai-chat', emoji: '🤖' },
            { label: 'Find Mentors', href: '/app/mentors', emoji: '👥' },
            { label: 'Browse Jobs', href: '/app/jobs', emoji: '💼' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="card text-center hover:border-brand-yellow hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="text-sm font-medium text-brand-black">{item.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
