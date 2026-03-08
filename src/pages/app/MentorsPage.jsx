import { useEffect, useState } from 'react'
import { StarIcon, BriefcaseIcon } from '@heroicons/react/24/solid'
import { mentorsApi } from '../../api/mentors'
import toast from 'react-hot-toast'

const FILTER_TYPES = ['All', 'industry', 'professor', 'alumni']
const FILTER_LABELS = { All: 'All', industry: 'Industry', professor: 'Professor', alumni: 'Alumni' }

function RequestModal({ mentor, onClose, onSubmit }) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      await onSubmit(mentor.user?.id, message)
      onClose()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-brand-black mb-1">Connect with {mentor.user?.fullName || mentor.user?.firstName}</h3>
        <p className="text-brand-gray-mid text-sm mb-4">{mentor.headline}</p>
        <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain what you'd like guidance on..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-brand-gray-mid text-sm
                       hover:border-brand-yellow transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex-1 bg-brand-yellow text-brand-black font-bold px-4 py-2.5 rounded-lg text-sm
                       hover:bg-brand-yellow-dark active:scale-95 transition-all disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MentorCard({ mentor, onConnect }) {
  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
          <span className="text-brand-black font-bold text-lg">
            {(mentor.user?.fullName || mentor.user?.firstName || '?')[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-black truncate">
            {mentor.user?.fullName || `${mentor.user?.firstName} ${mentor.user?.lastName}`}
          </h3>
          <p className="text-brand-gray-mid text-xs mt-0.5 line-clamp-2">{mentor.headline}</p>
        </div>
        {mentor.compatibilityScore > 0 && (
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-black text-brand-yellow">{Math.round(mentor.compatibilityScore)}%</div>
            <div className="text-xs text-brand-gray-mid">match</div>
          </div>
        )}
      </div>

      {/* Expertise tags */}
      {mentor.expertiseAreas?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {mentor.expertiseAreas.slice(0, 3).map((skill) => (
            <span key={skill} className="badge-yellow text-xs">{skill}</span>
          ))}
          {mentor.expertiseAreas.length > 3 && (
            <span className="text-xs text-brand-gray-mid">+{mentor.expertiseAreas.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-brand-gray-mid">
          {mentor.avgRating > 0 && (
            <span className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5 text-brand-yellow" />
              {Number(mentor.avgRating).toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <BriefcaseIcon className="w-3.5 h-3.5" />
            {FILTER_LABELS[mentor.mentorType] || mentor.mentorType}
          </span>
          {mentor.yearsExperience > 0 && (
            <span>{mentor.yearsExperience}y exp</span>
          )}
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
            onClick={() => onConnect(mentor)}
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
  const [mentors, setMentors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selectedMentor, setSelectedMentor] = useState(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const params = filter !== 'All' ? { mentor_type: filter } : {}
        const { data } = await mentorsApi.list(params)
        setMentors(data.results || data)
      } catch {
        /* silent */
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [filter])

  const handleSendRequest = async (mentorUserId, message) => {
    try {
      await mentorsApi.sendRequest(mentorUserId, message)
      toast.success('Mentorship request sent!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send request.'
      toast.error(msg)
      throw err
    }
  }

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
          {FILTER_TYPES.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-brand-yellow text-brand-black'
                  : 'bg-white border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">👥</div>
          <h2 className="text-xl font-bold text-brand-black mb-2">No mentors found</h2>
          <p className="text-brand-gray-mid text-sm max-w-sm mx-auto">
            {filter !== 'All'
              ? `No ${FILTER_LABELS[filter].toLowerCase()} mentors available right now. Try a different filter.`
              : 'No verified mentors are available yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onConnect={setSelectedMentor}
            />
          ))}
        </div>
      )}

      {selectedMentor && (
        <RequestModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSubmit={handleSendRequest}
        />
      )}
    </div>
  )
}
