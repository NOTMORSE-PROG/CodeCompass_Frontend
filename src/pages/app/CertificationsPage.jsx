import { useEffect, useState } from 'react'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { certApi } from '../../api/certifications'
import toast from 'react-hot-toast'

const CERT_CATEGORIES = ['All', 'TESDA', 'Google', 'AWS', 'CompTIA', 'Microsoft', 'Cisco', 'Meta', 'Oracle']

const PROVIDER_COLORS = {
  tesda: '#0066CC',
  google: '#4285F4',
  aws: '#FF9900',
  comptia: '#C8202F',
  microsoft: '#00A4EF',
  cisco: '#1BA0D7',
  meta: '#0081FB',
  oracle: '#F80000',
  other: '#6B7280',
}

function CertCard({ cert, tracking, onTrack, onUntrack }) {
  const isTracked = !!tracking
  const trackedStatus = tracking?.status

  const statusBadge = {
    interested: { label: 'Interested', className: 'bg-blue-100 text-blue-700' },
    studying: { label: 'Studying', className: 'bg-brand-yellow text-brand-black' },
    passed: { label: 'Earned ✓', className: 'bg-brand-black text-brand-yellow' },
    expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
  }

  const currentBadge = isTracked
    ? (statusBadge[trackedStatus] || statusBadge.interested)
    : { label: 'Available', className: 'bg-green-100 text-green-700' }

  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
            style={{ backgroundColor: PROVIDER_COLORS[cert.provider] || '#6B7280' }}
          >
            {cert.abbreviation?.[0] || cert.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-brand-black text-sm leading-snug">{cert.name}</h3>
            <p className="text-brand-gray-mid text-xs capitalize">{cert.provider}</p>
          </div>
        </div>
        <span className={`badge text-xs flex-shrink-0 ${currentBadge.className}`}>
          {currentBadge.label}
        </span>
      </div>

      {/* Relevant skills tags */}
      {cert.relevantSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cert.relevantSkills.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-gray-100 text-brand-gray-mid text-xs px-2 py-0.5 rounded-md">{tag}</span>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div>
          <span className="text-brand-gray-mid">Level: </span>
          <span className="font-medium text-brand-black capitalize">{cert.level}</span>
        </div>
        <div>
          <span className="text-brand-gray-mid">Study: </span>
          <span className="font-medium text-brand-black">
            {cert.estimatedStudyHours ? `~${cert.estimatedStudyHours}h` : 'Varies'}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-brand-gray-mid">Cost: </span>
          <span className="font-medium text-brand-black">
            {cert.isFree ? 'Free' : cert.estimatedCostPhp ? `₱${cert.estimatedCostPhp.toLocaleString()}` : 'Paid'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {trackedStatus === 'passed' ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 text-brand-yellow font-bold text-sm">
            <CheckBadgeIcon className="w-5 h-5" />
            <span>Certificate Earned!</span>
          </div>
        ) : isTracked ? (
          <div className="flex flex-1 gap-2">
            <select
              value={trackedStatus}
              onChange={(e) => onTrack(cert.id, tracking.id, e.target.value)}
              className="flex-1 px-2 py-2 rounded-lg border border-gray-200 text-brand-black text-xs
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
            >
              <option value="interested">Interested</option>
              <option value="studying">Studying</option>
              <option value="passed">Passed / Earned</option>
            </select>
            <button
              onClick={() => onUntrack(tracking.id)}
              className="px-3 py-2 border border-red-200 rounded-lg text-red-400 hover:bg-red-50 text-xs transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onTrack(cert.id, null, 'interested')}
              className="flex-1 bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                         hover:bg-brand-yellow-dark active:scale-95 transition-all"
            >
              Track This
            </button>
            {cert.examUrl && (
              <a
                href={cert.examUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-200 rounded-lg text-brand-gray-mid
                           hover:border-brand-yellow transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function CertificationsPage() {
  const [certs, setCerts] = useState([])
  const [myTracking, setMyTracking] = useState([]) // UserCertification records
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [certsRes, myRes] = await Promise.all([
          certApi.listAll(),
          certApi.listMy(),
        ])
        setCerts(certsRes.data.results || certsRes.data)
        setMyTracking(myRes.data.results || myRes.data)
      } catch {
        /* silent — will show empty state */
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleTrack = async (certId, trackingId, newStatus) => {
    try {
      if (trackingId) {
        // Update existing
        const { data } = await certApi.updateTracking(trackingId, { status: newStatus })
        setMyTracking((prev) => prev.map((t) => (t.id === trackingId ? data : t)))
        toast.success('Status updated!')
      } else {
        // Create new
        const { data } = await certApi.trackCert(certId, newStatus)
        setMyTracking((prev) => [...prev, data])
        toast.success('Added to your tracker!')
      }
    } catch {
      toast.error('Failed to update certification tracker.')
    }
  }

  const handleUntrack = async (trackingId) => {
    try {
      await certApi.removeTracking(trackingId)
      setMyTracking((prev) => prev.filter((t) => t.id !== trackingId))
      toast.success('Removed from tracker.')
    } catch {
      toast.error('Failed to remove.')
    }
  }

  const trackingMap = Object.fromEntries(
    myTracking.map((t) => [t.certification?.id || t.certification, t])
  )

  const filtered = selectedCategory === 'All'
    ? certs
    : certs.filter((c) => c.provider?.toLowerCase() === selectedCategory.toLowerCase())

  const earnedCount = myTracking.filter((t) => t.status === 'passed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Certifications</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Track and earn certifications that strengthen your resume.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-brand-yellow">{earnedCount}</div>
          <div className="text-xs text-brand-gray-mid">certs earned</div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CERT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-brand-yellow text-brand-black'
                : 'bg-white border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🏅</div>
          <p className="text-brand-gray-mid">
            {certs.length === 0
              ? 'No certifications in the database yet. Ask an admin to seed some!'
              : `No certifications found for "${selectedCategory}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cert) => (
            <CertCard
              key={cert.id}
              cert={cert}
              tracking={trackingMap[cert.id]}
              onTrack={handleTrack}
              onUntrack={handleUntrack}
            />
          ))}
        </div>
      )}
    </div>
  )
}
