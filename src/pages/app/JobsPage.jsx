/**
 * Jobs page — Philippines IT job board via Jooble API.
 * Full skill-based matching in Phase 6.
 */
import { MapPinIcon, BuildingOfficeIcon, ClockIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

const PLACEHOLDER_JOBS = [
  {
    id: 1,
    title: 'Junior Software Engineer',
    company: 'Accenture Philippines',
    location: 'Taguig, Metro Manila',
    type: 'Full-time',
    salary: '₱25,000 – ₱35,000/mo',
    tags: ['React', 'Java', 'Spring Boot'],
    postedDays: 2,
    matchScore: 92,
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'Sprout Solutions',
    location: 'Makati, Metro Manila',
    type: 'Full-time',
    salary: '₱30,000 – ₱45,000/mo',
    tags: ['React', 'TypeScript', 'Tailwind'],
    postedDays: 5,
    matchScore: 85,
  },
  {
    id: 3,
    title: 'Data Analyst (Fresh Grad OK)',
    company: 'Thinking Machines',
    location: 'Remote (Philippines)',
    type: 'Full-time',
    salary: '₱28,000 – ₱38,000/mo',
    tags: ['Python', 'SQL', 'Tableau'],
    postedDays: 1,
    matchScore: 71,
  },
  {
    id: 4,
    title: 'IT Support Specialist',
    company: 'Globe Telecom',
    location: 'Mandaluyong, Metro Manila',
    type: 'Full-time',
    salary: '₱18,000 – ₱25,000/mo',
    tags: ['Networking', 'Windows', 'Helpdesk'],
    postedDays: 7,
    matchScore: 58,
  },
]

function JobCard({ job }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-brand-black">{job.title}</h3>
            {job.matchScore >= 80 && (
              <span className="badge-yellow text-xs">{job.matchScore}% match</span>
            )}
          </div>
          <p className="text-brand-gray-mid text-sm font-medium mb-2">{job.company}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray-mid mb-3">
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-3.5 h-3.5" />
              {job.type}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {job.postedDays}d ago
            </span>
          </div>

          <p className="text-brand-black font-semibold text-sm mb-3">{job.salary}</p>

          <div className="flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-brand-gray-mid text-xs px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSaved(!saved)}
          className="flex-shrink-0 p-1.5 text-brand-gray-mid hover:text-brand-yellow transition-colors"
        >
          {saved
            ? <BookmarkSolidIcon className="w-5 h-5 text-brand-yellow" />
            : <BookmarkIcon className="w-5 h-5" />
          }
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button className="flex-1 bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                           hover:bg-brand-yellow-dark active:scale-95 transition-all">
          Apply Now
        </button>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-brand-gray-mid
                           hover:border-brand-yellow transition-colors">
          Details
        </button>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Job Board</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            IT jobs in the Philippines — filtered for your skills and career path.
          </p>
        </div>
        <span className="badge-yellow">Philippines Only</span>
      </div>

      {/* Coming soon notice */}
      <div className="bg-brand-yellow-pale border border-brand-yellow/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">💼</span>
        <div>
          <p className="font-semibold text-brand-black text-sm">Live Job Matching Coming in Phase 6</p>
          <p className="text-brand-gray-mid text-xs mt-0.5">
            Real-time Jooble API integration with skill-based filtering and save-to-profile feature.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search jobs... (e.g. React developer, data analyst)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-brand-black
                     placeholder:text-brand-gray-mid text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
        />
        <button className="bg-brand-yellow text-brand-black font-bold px-5 py-2.5 rounded-xl
                           hover:bg-brand-yellow-dark active:scale-95 transition-all text-sm">
          Search
        </button>
      </div>

      {/* Job list */}
      <div className="space-y-4">
        {PLACEHOLDER_JOBS.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
