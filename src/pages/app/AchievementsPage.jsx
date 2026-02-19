/**
 * Achievements page — XP bar, streak calendar, badge showcase, leaderboard.
 * Full gamification engine in Phase 7.
 */
import { BoltIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/outline'

const BADGES = [
  { slug: 'pioneer', label: 'Pioneer', emoji: '🚀', description: 'First to join CodeCompass', earned: true },
  { slug: 'roadmap-ready', label: 'Roadmap Ready', emoji: '🗺️', description: 'Generated your first roadmap', earned: false },
  { slug: 'first-step', label: 'First Step', emoji: '👣', description: 'Completed your first roadmap node', earned: false },
  { slug: 'curious', label: 'Curious', emoji: '🔍', description: 'Asked 10 questions to CodeCompass AI', earned: false },
  { slug: 'connected', label: 'Connected', emoji: '🤝', description: 'Sent your first mentor request', earned: false },
  { slug: 'week-warrior', label: 'Week Warrior', emoji: '🔥', description: 'Maintained a 7-day streak', earned: false },
  { slug: 'month-master', label: 'Month Master', emoji: '📅', description: 'Maintained a 30-day streak', earned: false },
  { slug: 'skill-builder', label: 'Skill Builder', emoji: '⚙️', description: 'Completed 5 roadmap nodes', earned: false },
  { slug: 'halfway-there', label: 'Halfway There', emoji: '⚡', description: 'Reached 50% roadmap completion', earned: false },
  { slug: 'roadmap-complete', label: 'Roadmap Complete', emoji: '🏆', description: 'Completed your full roadmap', earned: false },
  { slug: 'google-scholar', label: 'Google Scholar', emoji: '🎓', description: 'Earned a Google certification', earned: false },
  { slug: 'aws-cadet', label: 'AWS Cloud Cadet', emoji: '☁️', description: 'Earned an AWS certification', earned: false },
  { slug: 'profile-complete', label: 'Profile Complete', emoji: '✅', description: 'Filled out your full profile', earned: false },
  { slug: 'social-butterfly', label: 'Social Butterfly', emoji: '🦋', description: 'Connected with 3 mentors', earned: false },
  { slug: 'top-learner', label: 'Top Learner', emoji: '🥇', description: 'Reached top 10 on the leaderboard', earned: false },
]

const LEADERBOARD = [
  { rank: 1, name: 'Ana Reyes', xp: 3420, streak: 21 },
  { rank: 2, name: 'Marco Santos', xp: 2890, streak: 14 },
  { rank: 3, name: 'Liza Cruz', xp: 2640, streak: 9 },
  { rank: 4, name: 'Paolo Bautista', xp: 2100, streak: 7 },
  { rank: 5, name: 'Carla Ramos', xp: 1850, streak: 5 },
]

function BadgeCard({ badge }) {
  return (
    <div className={`p-4 rounded-xl border-2 text-center transition-all ${
      badge.earned
        ? 'border-brand-yellow bg-brand-yellow-pale'
        : 'border-gray-200 bg-gray-50 opacity-50'
    }`}>
      <div className="text-3xl mb-2">{badge.emoji}</div>
      <div className={`font-bold text-sm mb-1 ${badge.earned ? 'text-brand-black' : 'text-brand-gray-mid'}`}>
        {badge.label}
      </div>
      <div className="text-xs text-brand-gray-mid leading-snug">{badge.description}</div>
      {!badge.earned && (
        <LockClosedIcon className="w-4 h-4 text-gray-300 mx-auto mt-2" />
      )}
    </div>
  )
}

export default function AchievementsPage() {
  const earnedCount = BADGES.filter((b) => b.earned).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Achievements</h1>
        <p className="text-brand-gray-mid text-sm mt-0.5">
          Kumita ng XP, badges, at makipaglaban sa iyong kapwa students.
        </p>
      </div>

      {/* Coming soon notice */}
      <div className="bg-brand-yellow-pale border border-brand-yellow/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🎮</span>
        <div>
          <p className="font-semibold text-brand-black text-sm">Full Gamification Coming in Phase 7</p>
          <p className="text-brand-gray-mid text-xs mt-0.5">
            Live XP tracking, streak detection, badge unlocks with toast notifications, and weekly leaderboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: XP + Streak */}
        <div className="lg:col-span-2 space-y-4">
          {/* XP Card */}
          <div className="card">
            <h2 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-brand-yellow" />
              XP Progress
            </h2>
            <div className="flex items-end gap-4 mb-4">
              <div>
                <div className="text-5xl font-black text-brand-yellow">0</div>
                <div className="text-brand-gray-mid text-sm">Total XP</div>
              </div>
              <div className="text-brand-gray-mid text-sm pb-1">→ Next level at 500 XP</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-brand-yellow h-3 rounded-full transition-all" style={{ width: '0%' }} />
            </div>
            <div className="flex justify-between text-xs text-brand-gray-mid mt-1">
              <span>Level 1</span>
              <span>0 / 500 XP</span>
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
                <div className="text-5xl font-black text-orange-500">0</div>
                <div className="text-brand-gray-mid text-sm">day streak</div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-brand-gray-mid mb-1">
                  Mag-login at matuto araw-araw para mapanatili ang iyong streak!
                </p>
                <p className="text-xs text-brand-gray-mid">Best streak: 0 days</p>
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
                {earnedCount} / {BADGES.length} earned
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {BADGES.map((badge) => (
                <BadgeCard key={badge.slug} badge={badge} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="card h-fit">
          <h2 className="font-bold text-brand-black mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-brand-yellow" />
            Weekly Leaderboard
          </h2>
          <div className="space-y-3">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-2.5 rounded-lg ${
                  entry.rank === 1 ? 'bg-brand-yellow-pale border border-brand-yellow/30' : 'bg-gray-50'
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
                  <div className="font-semibold text-brand-black text-sm truncate">{entry.name}</div>
                  <div className="text-xs text-brand-gray-mid">{entry.xp.toLocaleString()} XP</div>
                </div>
                <div className="text-xs text-orange-500 flex items-center gap-0.5">
                  <FireIcon className="w-3.5 h-3.5" />
                  {entry.streak}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-brand-gray-mid">Ikaw ay wala pa sa top 10.</p>
            <p className="text-xs text-brand-yellow font-medium mt-0.5">Kumita ng XP para pumasok!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
