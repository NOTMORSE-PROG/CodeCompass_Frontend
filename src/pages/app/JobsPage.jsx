import {
  MapPinIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'
import useJobsStore from '../../stores/jobsStore'

const JOB_TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Remote', value: 'remote' },
]

function stripHtml(str) {
  if (!str) return ''
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function formatJobType(type) {
  return type ? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''
}

function timeSince(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1d ago'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

// ---------------------------------------------------------------------------
// Job Detail Modal
// ---------------------------------------------------------------------------
function JobModal({ job, onClose }) {
  const { savedJobIds, saveJob, unsaveJob } = useJobsStore()
  const isSaved = savedJobIds.has(job.id)
  const description = stripHtml(job.description)
  const posted = timeSince(job.fetchedAt)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-brand-black leading-snug">{job.title}</h2>
              <p className="text-brand-gray-mid font-medium text-sm mt-0.5">{job.company}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg text-brand-gray-mid hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-brand-gray-mid bg-gray-100 px-2.5 py-1 rounded-full">
                <MapPinIcon className="w-3.5 h-3.5" />{job.location}
              </span>
            )}
            {job.jobType && (
              <span className="text-xs bg-gray-100 text-brand-gray-mid px-2.5 py-1 rounded-full">
                {formatJobType(job.jobType)}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1 text-xs text-brand-black font-semibold bg-brand-yellow/20 px-2.5 py-1 rounded-full">
                <CurrencyDollarIcon className="w-3.5 h-3.5" />{job.salaryRange}
              </span>
            )}
            {posted && (
              <span className="flex items-center gap-1 text-xs text-brand-gray-mid bg-gray-100 px-2.5 py-1 rounded-full">
                <CalendarDaysIcon className="w-3.5 h-3.5" />Posted {posted}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {description ? (
            <p className="text-sm text-brand-gray-mid leading-relaxed whitespace-pre-line">
              {description}
            </p>
          ) : (
            <p className="text-sm text-brand-gray-mid italic">No description available.</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => isSaved ? unsaveJob(job.id) : saveJob(job.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border
              ${isSaved
                ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow'
                : 'border-gray-200 text-brand-gray-mid hover:border-brand-yellow hover:text-brand-yellow'
              }`}
          >
            {isSaved
              ? <BookmarkSolidIcon className="w-4 h-4" />
              : <BookmarkIcon className="w-4 h-4" />
            }
            {isSaved ? 'Saved' : 'Save Job'}
          </button>

          {job.applyUrl ? (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-brand-yellow text-brand-black
                         text-sm font-bold py-2 rounded-xl hover:bg-brand-yellow-dark active:scale-95 transition-all"
            >
              Apply Now
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          ) : (
            <span className="flex-1 text-center text-sm bg-gray-100 text-brand-gray-mid py-2 rounded-xl cursor-not-allowed">
              No Application Link
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Job Card (grid tile)
// ---------------------------------------------------------------------------
function JobCard({ job, isRecommended = false, onClick }) {
  const { savedJobIds, saveJob, unsaveJob } = useJobsStore()
  const isSaved = savedJobIds.has(job.id)
  const snippet = stripHtml(job.description)
  const posted = timeSince(job.fetchedAt)

  const handleSave = (e) => {
    e.stopPropagation()
    isSaved ? unsaveJob(job.id) : saveJob(job.id)
  }

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:border-brand-yellow hover:shadow-md transition-all flex flex-col h-full"
    >
      {/* Top: title + badge + save */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {isRecommended && (
            <span className="badge-yellow text-[10px] py-0 px-1.5 mb-1 inline-block">For You</span>
          )}
          <h3 className="font-semibold text-brand-black text-sm leading-snug line-clamp-2">{job.title}</h3>
        </div>
        <button
          onClick={handleSave}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
            isSaved ? 'text-brand-yellow' : 'text-gray-300 hover:text-brand-yellow'
          }`}
        >
          {isSaved
            ? <BookmarkSolidIcon className="w-4 h-4" />
            : <BookmarkIcon className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Company */}
      <p className="text-xs text-brand-gray-mid font-medium mb-2 truncate">{job.company}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.location && (
          <span className="flex items-center gap-0.5 text-[10px] text-brand-gray-mid bg-gray-50 px-1.5 py-0.5 rounded-md">
            <MapPinIcon className="w-2.5 h-2.5" />{job.location}
          </span>
        )}
        {job.jobType && (
          <span className="text-[10px] text-brand-gray-mid bg-gray-50 px-1.5 py-0.5 rounded-md">
            {formatJobType(job.jobType)}
          </span>
        )}
      </div>

      {/* Salary */}
      {job.salaryRange && (
        <p className="text-xs font-bold text-brand-black mb-2">{job.salaryRange}</p>
      )}

      {/* Snippet */}
      {snippet && (
        <p className="text-[11px] text-brand-gray-mid line-clamp-2 leading-relaxed flex-1">{snippet}</p>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
        {posted && (
          <span className="text-[10px] text-brand-gray-mid">{posted}</span>
        )}
        <span className="text-[10px] font-semibold text-brand-yellow ml-auto">View details →</span>
      </div>
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <div className="card animate-pulse flex flex-col h-40">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="flex gap-1.5 mb-3">
        <div className="h-4 w-16 bg-gray-200 rounded-md" />
        <div className="h-4 w-16 bg-gray-200 rounded-md" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mt-auto" />
      <div className="h-3 bg-gray-200 rounded w-5/6 mt-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function JobsPage() {
  const {
    jobs, recommendedJobs, savedJobs,
    isLoading, isLoadingRecommended, error,
    totalCount, currentPage, pageSize,
    fetchJobs, fetchRecommended, fetchSavedJobs,
  } = useJobsStore()

  const [activeTab, setActiveTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const debounceRef = useRef(null)

  const totalPages = Math.ceil(totalCount / pageSize)

  const buildParams = (page = 1) => {
    const params = { page }
    if (searchInput) params.search = searchInput
    if (activeFilter) params.job_type = activeFilter
    return params
  }

  useEffect(() => {
    fetchSavedJobs()
    fetchJobs({ page: 1 }).then(() => fetchRecommended())
  }, [fetchSavedJobs, fetchJobs, fetchRecommended])

  useEffect(() => {
    if (activeTab !== 'all') return
    clearTimeout(debounceRef.current)
    const params = { page: 1 }
    if (searchInput) params.search = searchInput
    if (activeFilter) params.job_type = activeFilter
    debounceRef.current = setTimeout(() => fetchJobs(params), 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput, activeFilter, activeTab, fetchJobs])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'saved') fetchSavedJobs()
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    fetchJobs(buildParams(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if ((i === 2 && currentPage > 3) || (i === totalPages - 1 && currentPage < totalPages - 2)) {
        pages.push('...')
      }
    }
    const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'))
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-brand-gray-mid">
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} jobs
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-brand-gray-mid hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          {deduped.map((p, i) => p === '...'
            ? <span key={`e${i}`} className="px-1 text-brand-gray-mid text-xs">…</span>
            : <button key={p} onClick={() => goToPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === currentPage ? 'bg-brand-yellow text-brand-black' : 'text-brand-gray-mid hover:bg-gray-100'}`}>
                {p}
              </button>
          )}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-brand-gray-mid hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Job Board</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            IT jobs in the Philippines — matched to your career path.
          </p>
        </div>
        <span className="badge-yellow">Philippines Only</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Jobs' },
          { id: 'saved', label: 'Saved', icon: true },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === id ? 'bg-white text-brand-black shadow-sm' : 'text-brand-gray-mid hover:text-brand-black'
            }`}>
            {icon && <BookmarkSolidIcon className="w-3.5 h-3.5 text-brand-yellow" />}
            {label}
            {id === 'saved' && savedJobs.length > 0 && (
              <span className="bg-brand-yellow text-brand-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {savedJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ALL JOBS ── */}
      {activeTab === 'all' && (
        <>
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-mid pointer-events-none" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jobs... (e.g. React developer, data analyst)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-brand-black
                           placeholder:text-brand-gray-mid text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent" />
            </div>
          </div>
          <div className="flex gap-2 mb-5 flex-wrap">
            {JOB_TYPE_FILTERS.map(({ label, value }) => (
              <button key={value} onClick={() => setActiveFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === value ? 'bg-brand-yellow text-brand-black' : 'bg-gray-100 text-brand-gray-mid hover:bg-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Recommended */}
          {!isLoadingRecommended && recommendedJobs.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-brand-black mb-3">Recommended for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} isRecommended onClick={() => setSelectedJob(job)} />
                ))}
              </div>
              <div className="mt-5 mb-3 border-t border-gray-100 pt-4">
                <h2 className="text-sm font-bold text-brand-black">All Jobs</h2>
              </div>
            </div>
          )}

          {error && <div className="text-center py-10 text-red-500 text-sm">{error}</div>}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map((n) => <JobCardSkeleton key={n} />)}
            </div>
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <div className="text-center py-16">
              <BriefcaseIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-brand-gray-mid font-medium text-sm">No jobs found</p>
              <p className="text-brand-gray-mid text-xs mt-1">Try a different search or filter.</p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
              ))}
            </div>
          )}

          {!isLoading && renderPagination()}
        </>
      )}

      {/* ── SAVED JOBS ── */}
      {activeTab === 'saved' && (
        savedJobs.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-brand-gray-mid font-medium text-sm">No saved jobs yet</p>
            <p className="text-brand-gray-mid text-xs mt-1">Bookmark jobs from the All Jobs tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
