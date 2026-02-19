/**
 * Mentors page — browse and connect with industry mentors.
 * Full mentor matching + request flow in Phase 5.
 */
import { useEffect } from 'react'
import { StarIcon, BriefcaseIcon } from '@heroicons/react/24/solid'
import useAuthStore from '../../stores/authStore'

const PLACEHOLDER_MENTORS = [
  {
    id: 1,
    name: 'Juan dela Cruz',
    headline: 'Senior Software Engineer @ Thinking Machines',
    mentorType: 'industry',
    expertiseAreas: ['Python', 'Machine Learning', 'Django', 'Cloud'],
    avgRating: 4.9,
    isAvailable: true,
    compatibilityScore: 87,
  },
  {
    id: 2,
    name: 'Maria Santos',
    headline: 'Full Stack Developer @ Sprout Solutions',
    mentorType: 'industry',
    expertiseAreas: ['React', 'Node.js', 'PostgreSQL', 'DevOps'],
    avgRating: 4.7,
    isAvailable: true,
    compatibilityScore: 74,
  },
  {
    id: 3,
    name: 'Prof. Ricardo Reyes',
    headline: 'Associate Professor, BSCS — TIP Manila',
    mentorType: 'professor',
    expertiseAreas: ['Algorithms', 'Data Structures', 'Research', 'Academic Writing'],
    avgRating: 4.8,
    isAvailable: false,
    compatibilityScore: 62,
  },
]

function MentorCard({ mentor }) {
  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
          <span className="text-brand-black font-bold text-lg">{mentor.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-black truncate">{mentor.name}</h3>
          <p className="text-brand-gray-mid text-xs mt-0.5 line-clamp-2">{mentor.headline}</p>
        </div>
        {/* Compatibility score */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-black text-brand-yellow">{mentor.compatibilityScore}%</div>
          <div className="text-xs text-brand-gray-mid">match</div>
        </div>
      </div>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {mentor.expertiseAreas.slice(0, 3).map((skill) => (
          <span key={skill} className="badge-yellow text-xs">{skill}</span>
        ))}
        {mentor.expertiseAreas.length > 3 && (
          <span className="text-xs text-brand-gray-mid">+{mentor.expertiseAreas.length - 3} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-brand-gray-mid">
          <span className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 text-brand-yellow" />
            {mentor.avgRating}
          </span>
          <span className="flex items-center gap-1">
            <BriefcaseIcon className="w-3.5 h-3.5" />
            {mentor.mentorType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mentor.isAvailable ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Available
            </span>
          ) : (
            <span className="text-xs text-brand-gray-mid">Busy</span>
          )}
          <button
            disabled={!mentor.isAvailable}
            className="bg-brand-yellow text-brand-black text-xs font-bold px-3 py-1.5 rounded-lg
                       hover:bg-brand-yellow-dark active:scale-95 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MentorsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Find a Mentor</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Kumonekta sa mga industry professionals at professors na makakatulong sa iyo.
          </p>
        </div>
        <div className="flex gap-2">
          {['All', 'Industry', 'Professor', 'Alumni'].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'All'
                  ? 'bg-brand-yellow text-brand-black'
                  : 'bg-white border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="bg-brand-yellow-pale border border-brand-yellow/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🤝</span>
        <div>
          <p className="font-semibold text-brand-black text-sm">Mentor Matching Coming in Phase 5</p>
          <p className="text-brand-gray-mid text-xs mt-0.5">
            Full AI-powered compatibility scoring, request management, and session scheduling.
          </p>
        </div>
      </div>

      {/* Mentor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLACEHOLDER_MENTORS.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  )
}
