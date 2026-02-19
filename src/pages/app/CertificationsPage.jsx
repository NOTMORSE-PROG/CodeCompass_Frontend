/**
 * Certifications page — TESDA, Google, AWS, CompTIA tracker.
 * Full cert recommendation + progress tracking in Phase 6.
 */
import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const CERT_CATEGORIES = ['All', 'TESDA', 'Google', 'AWS', 'CompTIA', 'Microsoft', 'Cisco']

const PLACEHOLDER_CERTS = [
  {
    id: 1,
    name: 'Google IT Support Certificate',
    provider: 'Google',
    category: 'Google',
    level: 'Beginner',
    cost: 'Free (via Coursera financial aid)',
    duration: '6 months (6 hrs/week)',
    tags: ['IT Support', 'Networking', 'Linux', 'Security'],
    status: 'recommended',
    isEarned: false,
    providerColor: '#4285F4',
  },
  {
    id: 2,
    name: 'AWS Cloud Practitioner (CLF-C02)',
    provider: 'Amazon Web Services',
    category: 'AWS',
    level: 'Beginner',
    cost: '$100 USD (~₱5,700)',
    duration: '2–3 months prep',
    tags: ['Cloud', 'AWS', 'Architecture', 'Billing'],
    status: 'recommended',
    isEarned: false,
    providerColor: '#FF9900',
  },
  {
    id: 3,
    name: 'TESDA NC II — Computer Systems Servicing',
    provider: 'TESDA',
    category: 'TESDA',
    level: 'NC II',
    cost: 'Free (government program)',
    duration: '80–160 training hours',
    tags: ['Hardware', 'Networking', 'OS Installation', 'Troubleshooting'],
    status: 'available',
    isEarned: false,
    providerColor: '#0066CC',
  },
  {
    id: 4,
    name: 'CompTIA A+',
    provider: 'CompTIA',
    category: 'CompTIA',
    level: 'Entry Level',
    cost: '$246 USD per exam (~₱14,000)',
    duration: '3–4 months prep',
    tags: ['Hardware', 'OS', 'Networking', 'Troubleshooting'],
    status: 'locked',
    isEarned: false,
    providerColor: '#C8202F',
  },
  {
    id: 5,
    name: 'Google Data Analytics Certificate',
    provider: 'Google',
    category: 'Google',
    level: 'Beginner',
    cost: 'Free (via Coursera financial aid)',
    duration: '6 months (10 hrs/week)',
    tags: ['SQL', 'R', 'Tableau', 'Data Visualization'],
    status: 'available',
    isEarned: false,
    providerColor: '#4285F4',
  },
]

const statusConfig = {
  recommended: { label: 'Recommended', className: 'bg-brand-yellow text-brand-black' },
  available: { label: 'Available', className: 'bg-green-100 text-green-700' },
  locked: { label: 'Locked', className: 'bg-gray-100 text-gray-500' },
  earned: { label: 'Earned ✓', className: 'bg-brand-black text-brand-yellow' },
}

function CertCard({ cert }) {
  const status = cert.isEarned ? 'earned' : cert.status
  const { label, className } = statusConfig[status]

  return (
    <div className={`card transition-all ${
      status === 'locked'
        ? 'opacity-60'
        : 'hover:border-brand-yellow hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
            style={{ backgroundColor: cert.providerColor }}
          >
            {cert.provider[0]}
          </div>
          <div>
            <h3 className="font-bold text-brand-black text-sm leading-snug">{cert.name}</h3>
            <p className="text-brand-gray-mid text-xs">{cert.provider}</p>
          </div>
        </div>
        <span className={`badge text-xs flex-shrink-0 ${className}`}>{label}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cert.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-gray-100 text-brand-gray-mid text-xs px-2 py-0.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div>
          <span className="text-brand-gray-mid">Level: </span>
          <span className="font-medium text-brand-black">{cert.level}</span>
        </div>
        <div>
          <span className="text-brand-gray-mid">Duration: </span>
          <span className="font-medium text-brand-black">{cert.duration}</span>
        </div>
        <div className="col-span-2">
          <span className="text-brand-gray-mid">Cost: </span>
          <span className="font-medium text-brand-black">{cert.cost}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {status === 'locked' ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 text-brand-gray-mid text-sm">
            <LockClosedIcon className="w-4 h-4" />
            <span>Complete prerequisites first</span>
          </div>
        ) : status === 'earned' ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 text-brand-yellow font-bold text-sm">
            <CheckBadgeIcon className="w-5 h-5" />
            <span>Certificate Earned!</span>
          </div>
        ) : (
          <>
            <button className="flex-1 bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                               hover:bg-brand-yellow-dark active:scale-95 transition-all">
              Start Tracking
            </button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-brand-gray-mid
                               hover:border-brand-yellow transition-colors">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function CertificationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Certifications</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Track at i-earn ang mga certifications na magpapalakas ng iyong resume.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-brand-yellow">0</div>
          <div className="text-xs text-brand-gray-mid">certs earned</div>
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="bg-brand-yellow-pale border border-brand-yellow/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🏅</span>
        <div>
          <p className="font-semibold text-brand-black text-sm">AI Cert Recommendations Coming in Phase 6</p>
          <p className="text-brand-gray-mid text-xs mt-0.5">
            Personalized certification roadmap based on your target career and current skills.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CERT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              cat === 'All'
                ? 'bg-brand-yellow text-brand-black'
                : 'bg-white border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cert grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLACEHOLDER_CERTS.map((cert) => (
          <CertCard key={cert.id} cert={cert} />
        ))}
      </div>
    </div>
  )
}
