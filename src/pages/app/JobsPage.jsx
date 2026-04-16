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
  ArrowUpTrayIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import useJobsStore from '../../stores/jobsStore'
import { resumesApi } from '../../api/resumes'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

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
    .replace(/^\.{2,}\s*/, '')
    .replace(/\s*\.{2,}$/, '')
    .replace(/^…\s*/, '')
    .replace(/\s*…$/, '')
    .replace(/\.\.\.\s+\.\.\./g, '—')
    .trim()
}

function isTruncated(str) {
  if (!str) return false
  const t = str.trim()
  if (t.startsWith('...') || t.endsWith('...') || t.startsWith('…') || t.endsWith('…')) return true
  if (/^[a-z]/.test(t)) return true
  if (t.length < 400) return true
  return false
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
// Description renderer
// ---------------------------------------------------------------------------
const FILLER_STARTS = new Set([
  'to', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'been',
  'and', 'or', 'but', 'if', 'that', 'this', 'for', 'of', 'as', 'so',
  'not', 'no', 'by', 'from', 'with', 'the', 'a', 'an',
  'we', 'our', 'you', 'your', 'it', 'its',
])

function preprocessText(text) {
  let result = text
    .replace(/\s*•\s*/g, '\n• ')
    .replace(/(^|[.!?])\s*([A-Z][a-zA-Z\s\-/]{2,50})\s+·\s*/g, (m, prefix, name) => {
      const words = name.trim().split(/\s+/)
      if (words.length <= 6) return `${prefix || ''}\n${name}\n• `
      return m
    })
    .replace(/\s*·\s*/g, '\n• ')
    .replace(/(^|[.!?\n])\s*([A-Z][A-Z ]{5,49}[A-Z])\s+(?=[A-Z][a-z])/g, (m, prefix, name) => {
      const words = name.trim().split(/\s+/)
      if (words.length <= 5) return `${prefix || ''}\n${name}\n`
      return m
    })
    .replace(/([^\n])[ \t]*([IVX]{1,4}\.\s[A-Z])/g, '$1\n$2')
    .replace(/([.!?])\s+([A-Z][a-zA-Z''\-/ ]{3,40}:)\s+/g, (m, punct, header) => {
      const words = header.replace(/:$/, '').trim().split(/\s+/)
      const firstWord = words[0].toLowerCase()
      if (words.length >= 2 && words.length <= 7 && !FILLER_STARTS.has(firstWord)) {
        return `${punct}\n${header}\n`
      }
      return m
    })

  const nonEmpty = result.split('\n').filter((l) => l.trim()).length
  if (nonEmpty <= 2 && result.length > 300) {
    result = result.replace(/([.!?]) (?=[A-Z][a-z])/g, '$1\n')
  }
  return result
}

function classifyLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return 'empty'
  if (/^[IVX]+\.\s/.test(trimmed)) return 'section'
  if (trimmed.endsWith(':') && trimmed.length < 80) return 'subheader'
  if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) return 'bullet'
  return 'text'
}

function DescriptionBody({ text }) {
  const lines = preprocessText(text).split('\n')
  const blocks = []
  let paraBuffer = []

  const flushPara = () => {
    if (paraBuffer.length > 0) {
      blocks.push({ type: 'paragraph', content: paraBuffer.join(' ') })
      paraBuffer = []
    }
  }

  for (const line of lines) {
    const kind = classifyLine(line)
    const trimmed = line.trim()
    if (kind === 'empty') { flushPara(); continue }
    if (kind === 'section') { flushPara(); blocks.push({ type: 'section', content: trimmed }) }
    else if (kind === 'subheader') { flushPara(); blocks.push({ type: 'subheader', content: trimmed }) }
    else if (kind === 'bullet') { flushPara(); blocks.push({ type: 'bullet', content: trimmed.replace(/^[•\-*]\s*/, '') }) }
    else { paraBuffer.push(trimmed) }
  }
  flushPara()

  return (
    <div className="space-y-0.5">
      {blocks.map((block, i) => {
        if (block.type === 'section') return (
          <h3 key={i} className="text-sm font-bold text-brand-black mt-4 mb-1 first:mt-0">{block.content}</h3>
        )
        if (block.type === 'subheader') return (
          <p key={i} className="text-xs font-semibold text-brand-black mt-3 mb-0.5 uppercase tracking-wide">
            {block.content.replace(/:$/, '')}
          </p>
        )
        if (block.type === 'bullet') return (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow flex-shrink-0" />
            <span className="text-sm text-brand-gray-mid leading-relaxed">{block.content}</span>
          </div>
        )
        return (
          <p key={i} className="text-sm text-brand-gray-mid leading-relaxed py-0.5">{block.content}</p>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Job Detail Modal
// ---------------------------------------------------------------------------
function JobModal({ job, onClose }) {
  const { savedJobIds, saveJob, unsaveJob } = useJobsStore()
  const isSaved = savedJobIds.has(job.id)
  const description = stripHtml(job.description)
  const truncated = isTruncated(job.description)
  const posted = timeSince(job.fetchedAt)

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-brand-black leading-snug">{job.title}</h2>
              <p className="text-brand-gray-mid font-medium text-sm mt-0.5">{job.company}</p>
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 rounded-lg text-brand-gray-mid hover:bg-gray-100 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {description ? (
            <>
              <DescriptionBody text={description} />
              {truncated && (
                <p className="mt-4 text-xs text-brand-gray-mid italic border-t border-gray-100 pt-3">
                  Preview only — click <strong>Apply Now</strong> to see the full job description on the source site.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-brand-gray-mid italic">No description available.</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => isSaved ? unsaveJob(job.id) : saveJob(job.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border
              ${isSaved
                ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow'
                : 'border-gray-200 text-brand-gray-mid hover:border-brand-yellow hover:text-brand-yellow'
              }`}
          >
            {isSaved ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
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
// Job Card
// ---------------------------------------------------------------------------
function JobCard({ job, isRecommended = false, matchTerms = [], onClick }) {
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
          {isSaved ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-brand-gray-mid font-medium mb-2 truncate">{job.company}</p>
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
      {job.salaryRange && (
        <p className="text-xs font-bold text-brand-black mb-2">{job.salaryRange}</p>
      )}
      {snippet && (
        <p className="text-[11px] text-brand-gray-mid line-clamp-2 leading-relaxed flex-1">{snippet}</p>
      )}

      {/* Match reasons — only shown on recommended cards */}
      {isRecommended && matchTerms.length > 0 && (
        <div className="mt-2 pt-2 border-t border-brand-yellow/20">
          <p className="text-[9px] uppercase tracking-wider text-brand-gray-mid font-semibold mb-1">Matched from your resume</p>
          <div className="flex flex-wrap gap-1">
            {matchTerms.map((term) => (
              <span key={term} className="text-[10px] bg-brand-yellow/15 text-brand-black font-medium px-1.5 py-0.5 rounded-md">
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
        {posted && <span className="text-[10px] text-brand-gray-mid">{posted}</span>}
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
// PDF Resume Upload Banner
// ---------------------------------------------------------------------------
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return text.trim()
}

function ResumeBanner({
  pdfFileName,
  isPdfLoading,
  hasPdfRecommendations,
  savedResumes,
  onFileSelect,
  onSavedResumeSelect,
  onClear,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') onFileSelect(file)
  }

  // Active state: analyzing or already loaded
  if (isPdfLoading || hasPdfRecommendations) {
    return (
      <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30">
        <SparklesIcon className="w-4 h-4 text-brand-yellow flex-shrink-0" />
        {isPdfLoading ? (
          <span className="text-sm text-brand-black font-medium flex-1">
            Analyzing your resume…
            <span className="inline-flex gap-0.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce [animation-delay:300ms]" />
            </span>
          </span>
        ) : (
          <span className="text-sm text-brand-black font-medium flex-1 flex items-center gap-1.5 min-w-0">
            <DocumentTextIcon className="w-4 h-4 text-brand-gray-mid flex-shrink-0" />
            <span className="truncate text-brand-gray-mid">{pdfFileName}</span>
            <span className="text-brand-gray-mid flex-shrink-0">— showing matched jobs</span>
          </span>
        )}
        {!isPdfLoading && (
          <button
            onClick={onClear}
            className="flex-shrink-0 p-1 rounded-md text-brand-gray-mid hover:bg-brand-yellow/20 transition-colors"
            title="Remove resume"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // Default state: upload CTA (+ saved-resume row when the user has resumes)
  const hasSavedResumes = Array.isArray(savedResumes) && savedResumes.length > 0

  return (
    <div className="mb-5">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer
          transition-colors select-none
          ${isDragging
            ? 'border-brand-yellow bg-brand-yellow/10'
            : 'border-gray-200 bg-gray-50 hover:border-brand-yellow hover:bg-brand-yellow/5'
          }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) { onFileSelect(file); e.target.value = '' }
          }}
        />
        <ArrowUpTrayIcon className="w-4 h-4 text-brand-gray-mid flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-brand-black">Upload your resume PDF </span>
          <span className="text-sm text-brand-gray-mid">to get personalized job matches</span>
        </div>
        <span className="flex-shrink-0 text-xs font-semibold text-brand-yellow bg-brand-yellow/10 px-2.5 py-1 rounded-full">
          PDF only
        </span>
      </div>

      {hasSavedResumes && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-brand-gray-mid mb-2">
            <span className="flex-1 border-t border-gray-200" />
            <span>or use a saved resume</span>
            <span className="flex-1 border-t border-gray-200" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {savedResumes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSavedResumeSelect(r)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200
                           bg-white hover:border-brand-yellow hover:bg-brand-yellow/5 transition-colors"
                title={r.title}
              >
                <DocumentTextIcon className="w-4 h-4 text-brand-gray-mid flex-shrink-0" />
                <span className="text-sm font-medium text-brand-black truncate max-w-[160px]">
                  {r.title}
                </span>
                {r.templateName && (
                  <span className="text-[10px] font-semibold text-brand-gray-mid bg-gray-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
                    {r.templateName}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function JobsPage() {
  const {
    jobs, savedJobs,
    isLoading, error,
    totalCount, currentPage, pageSize,
    pdfRecommendations, isPdfLoading, hasPdfRecommendations,
    fetchJobs, fetchSavedJobs,
    getRecommendationsFromResume, getRecommendationsFromResumeId, clearPdfRecommendations,
  } = useJobsStore()

  const [activeTab, setActiveTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const [savedResumes, setSavedResumes] = useState([])
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
    fetchJobs({ page: 1 })
  }, [fetchSavedJobs, fetchJobs])

  // Load the user's saved resumes for the "or use a saved resume" row.
  // Failures silently hide the feature for this session; new users (no resumes) also see nothing.
  useEffect(() => {
    let cancelled = false
    resumesApi
      .list()
      .then(({ data }) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : (data.results || [])
        setSavedResumes(list)
      })
      .catch(() => {
        if (!cancelled) setSavedResumes([])
      })
    return () => { cancelled = true }
  }, [])

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

  const handlePdfSelect = async (file) => {
    setPdfFileName(file.name)
    try {
      const text = await extractPdfText(file)
      await getRecommendationsFromResume(text)
    } catch {
      clearPdfRecommendations()
      setPdfFileName('')
    }
  }

  const handleSavedResumeSelect = async (resume) => {
    setPdfFileName(resume.title)
    const result = await getRecommendationsFromResumeId(resume.id)
    if (!result.ok) {
      // Backend returned an error (e.g. "too little content"). Reset the banner
      // and surface whatever message we got.
      setPdfFileName('')
      if (result.detail) {
        // Match the existing pattern — JobsPage currently has no toast helper, so
        // a simple alert keeps the user informed without a new dependency.
        window.alert(result.detail)
      }
    }
  }

  const handleClearPdf = () => {
    clearPdfRecommendations()
    setPdfFileName('')
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
            IT jobs in the Philippines.
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
          {/* Resume upload banner */}
          <ResumeBanner
            pdfFileName={pdfFileName}
            isPdfLoading={isPdfLoading}
            hasPdfRecommendations={hasPdfRecommendations}
            savedResumes={savedResumes}
            onFileSelect={handlePdfSelect}
            onSavedResumeSelect={handleSavedResumeSelect}
            onClear={handleClearPdf}
          />

          {/* Search + filters */}
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

          {/* PDF-based recommendations (only when resume uploaded) */}
          {hasPdfRecommendations && pdfRecommendations.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-4 h-4 text-brand-yellow" />
                <h2 className="text-sm font-bold text-brand-black">Recommended for You</h2>
                <span className="text-xs text-brand-gray-mid">based on your resume</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pdfRecommendations.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isRecommended
                    matchTerms={job.matchTerms ?? []}
                    onClick={() => setSelectedJob(job)}
                  />
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
