import { useEffect } from 'react'
import { BoltIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import useGamificationStore from '../../stores/gamificationStore'
import useAuthStore from '../../stores/authStore'

// XP needed per level (every 500 XP = 1 level)
const XP_PER_LEVEL = 500

function getLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}
function getXPInLevel(xp) {
  return xp % XP_PER_LEVEL
}

function BadgeCard({ badge, earned }) {
  return (
    <div className={`p-4 rounded-xl border-2 text-center transition-all ${
      earned ? 'border-brand-yellow bg-brand-yellow-pale' : 'border-gray-200 bg-gray-50 opacity-50'
    }`}>
      <div className="text-3xl mb-2">{badge.iconName || '🏅'}</div>
      <div className={`font-bold text-sm mb-1 ${earned ? 'text-brand-black' : 'text-brand-gray-mid'}`}>
        {badge.name}
      </div>
      <div className="text-xs text-brand-gray-mid leading-snug">{badge.description}</div>
      {!earned && <LockClosedIcon className="w-4 h-4 text-gray-300 mx-auto mt-2" />}
    </div>
  )
}

const PERIOD_LABELS = { weekly: 'This Week', monthly: 'This Month', all_time: 'All Time' }

export default function AchievementsPage() {
  const { user } = useAuthStore()
  const {
    profile,
    allBadges,
    earnedBadges,
    xpHistory,
    leaderboard,
    leaderboardPeriod,
    isLoading,
    fetchProfile,
    fetchAllBadges,
    fetchEarnedBadges,
    fetchXPHistory,
    fetchLeaderboard,
  } = useGamificationStore()

  useEffect(() => {
    fetchProfile()
    fetchAllBadges()
    fetchEarnedBadges()
    fetchXPHistory()
    fetchLeaderboard('weekly')
  }, [fetchProfile, fetchAllBadges, fetchEarnedBadges, fetchXPHistory, fetchLeaderboard])

  const xpTotal = profile?.xpTotal ?? 0
  const streakCount = profile?.streakCount ?? 0
  const earnedBadgeSlugs = new Set(earnedBadges.map((ub) => ub.badge?.slug || ub.badge))
  const level = getLevel(xpTotal)
  const xpInLevel = getXPInLevel(xpTotal)
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Achievements</h1>
        <p className="text-brand-gray-mid text-sm mt-0.5">
          Earn XP, collect badges, and compete with other students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: XP + Streak + Badges */}
        <div className="lg:col-span-2 space-y-4">
          {/* XP Card */}
          <div className="card">
            <h2 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-brand-yellow" />
              XP Progress
            </h2>
            <div className="flex items-end gap-4 mb-4">
              <div>
                <div className="text-5xl font-black text-brand-yellow">{xpTotal.toLocaleString()}</div>
                <div className="text-brand-gray-mid text-sm">Total XP</div>
              </div>
              <div className="text-brand-gray-mid text-sm pb-1">
                Level {level} → Next level at {(level * XP_PER_LEVEL).toLocaleString()} XP
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-brand-yellow h-3 rounded-full transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-brand-gray-mid mt-1">
              <span>Level {level}</span>
              <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="card">
            <h2 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-500" />
              Daily Streak
            </h2>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-5xl font-black text-orange-500">{streakCount}</div>
                <div className="text-brand-gray-mid text-sm">day streak</div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-brand-gray-mid mb-1">
                  {streakCount > 0
                    ? `Great job! Keep logging in every day to maintain your streak.`
                    : 'Log in and learn every day to keep your streak going!'}
                </p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="card">
            <h2 className="font-bold text-brand-black mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-brand-yellow" />
                Badges
              </span>
              <span className="text-sm text-brand-gray-mid font-normal">
                {earnedBadges.length} / {allBadges.length} earned
              </span>
            </h2>
            {allBadges.length === 0 ? (
              <p className="text-brand-gray-mid text-sm text-center py-8">Loading badges...</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {allBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedBadgeSlugs.has(badge.slug)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* XP Activity */}
          <div className="card">
            <h2 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-brand-yellow" />
              XP Activity
            </h2>
            {xpHistory.length === 0 ? (
              <p className="text-brand-gray-mid text-sm text-center py-6">
                No XP earned yet. Complete nodes and earn badges to see your history!
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {xpHistory.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-brand-gray-dark">{event.description}</span>
                    <span className="text-sm font-bold text-brand-yellow whitespace-nowrap ml-4">
                      +{event.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="card h-fit">
          <h2 className="font-bold text-brand-black mb-3 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-brand-yellow" />
            Leaderboard
          </h2>

          {/* Period selector */}
          <div className="flex gap-1.5 mb-4">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => fetchLeaderboard(key)}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                  leaderboardPeriod === key
                    ? 'bg-brand-yellow text-brand-black'
                    : 'bg-gray-100 text-brand-gray-mid hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-brand-gray-mid text-sm text-center py-6">
              No leaderboard data yet. Start earning XP!
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.user?.fullName === user?.fullName
                return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${
                    isCurrentUser
                      ? 'bg-brand-yellow-pale border border-brand-yellow/30'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    entry.rank === 1 ? 'bg-brand-yellow text-brand-black' :
                    entry.rank === 2 ? 'bg-gray-300 text-white' :
                    entry.rank === 3 ? 'bg-orange-300 text-white' :
                    'bg-gray-100 text-brand-gray-mid'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-black text-sm truncate">
                      {entry.user?.fullName || entry.user?.firstName || `User #${entry.rank}`}
                    </div>
                    <div className="text-xs text-brand-gray-mid">{entry.xpEarned?.toLocaleString()} XP</div>
                  </div>
                </div>
              )})}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-brand-yellow font-medium">Complete nodes to earn XP and climb the board!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
