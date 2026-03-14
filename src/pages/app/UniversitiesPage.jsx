import { useEffect, useState, useCallback } from 'react'
import {
  AcademicCapIcon,
  MapPinIcon,
  TrophyIcon,
  GlobeAltIcon,
  SparklesIcon,
  XMarkIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid'
import { universitiesApi } from '../../api/universities'

const PROGRAM_FILTERS = ['All Programs', 'BSCS', 'BSIT', 'BSIS', 'BSCE']
const TYPE_FILTERS = ['All Types', 'state', 'private', 'local']
const TYPE_LABELS = { state: 'State / SUC', private: 'Private', local: 'Local College' }
const TYPE_COLORS = {
  state: 'bg-blue-100 text-blue-800',
  private: 'bg-purple-100 text-purple-800',
  local: 'bg-green-100 text-green-800',
}

function tuitionLabel(min, max) {
  if (min === 0 && max <= 5000) return 'Free / RA 10931'
  if (!min && !max) return 'Contact school'
  if (min === 0) return `Up to ₱${max?.toLocaleString()}/sem`
  if (!max) return `From ₱${min?.toLocaleString()}/sem`
  return `₱${min.toLocaleString()} – ₱${max.toLocaleString()}/sem`
}

// ── University Detail Drawer ───────────────────────────────────────────────

function UniversityDetailDrawer({ uni, matchScore, matchReasons, onClose }) {
  if (!uni) return null

  const isFree = uni.tuitionRangeMin === 0 && (uni.tuitionRangeMax ?? 0) <= 5000

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start gap-3 pr-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center flex-shrink-0">
              <AcademicCapIcon className="w-6 h-6 text-brand-yellow" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-bold text-brand-black text-base leading-snug">{uni.name}</h2>
                {uni.abbreviation && (
                  <span className="text-xs font-semibold text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {uni.abbreviation}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {uni.universityType && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[uni.universityType] || 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[uni.universityType] || uni.universityType}
                  </span>
                )}
                {uni.chedCoe && (
                  <span className="flex items-center gap-0.5 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-0.5 rounded-full">
                    <TrophyIcon className="w-3 h-3" /> CoE
                  </span>
                )}
                {uni.chedCod && (
                  <span className="flex items-center gap-0.5 bg-gray-200 text-brand-black text-xs font-bold px-2 py-0.5 rounded-full">
                    CoD
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-gray-mid hover:text-brand-black transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-brand-gray-mid text-xs mb-1">
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" /> Location
              </div>
              <p className="text-sm font-semibold text-brand-black">
                {uni.city}{uni.province ? `, ${uni.province}` : ''}
              </p>
              <p className="text-xs text-brand-gray-mid">{uni.region}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-brand-gray-mid text-xs mb-1">
                <CurrencyDollarIcon className="w-3.5 h-3.5 flex-shrink-0" /> Tuition / Semester
              </div>
              <p className={`text-sm font-semibold ${isFree ? 'text-green-600' : 'text-brand-black'}`}>
                {tuitionLabel(uni.tuitionRangeMin, uni.tuitionRangeMax)}
              </p>
              {isFree && (
                <p className="text-xs text-green-600">Universal Access Act (RA 10931)</p>
              )}
            </div>

            {uni.accreditationLevel && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-brand-gray-mid text-xs mb-1">
                  <BuildingLibraryIcon className="w-3.5 h-3.5 flex-shrink-0" /> Accreditation
                </div>
                <p className="text-sm font-semibold text-brand-black">
                  Level {uni.accreditationLevel}
                </p>
                <p className="text-xs text-brand-gray-mid">CHED / PAASCU</p>
              </div>
            )}

            {uni.websiteUrl && (
              <div className={`bg-brand-black rounded-xl p-3 flex flex-col justify-between ${uni.accreditationLevel ? '' : 'col-span-2'}`}>
                <p className="text-xs text-gray-400 mb-1">Official Website</p>
                <a
                  href={uni.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand-yellow text-sm font-bold hover:underline truncate"
                >
                  <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Match score section — only shown for recommendations */}
          {matchScore != null && (
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-brand-yellow" />
                  <span className="text-sm font-bold text-brand-black">Match Score</span>
                </div>
                <span className="text-lg font-extrabold text-brand-black">{matchScore}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-brand-yellow/20 rounded-full h-2 mb-3">
                <div
                  className="bg-brand-yellow h-2 rounded-full transition-all"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
              {matchReasons?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {matchReasons.map((reason, i) => (
                    <span key={i} className="bg-brand-yellow/20 text-brand-black text-xs px-2 py-0.5 rounded-full">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Programs */}
          {uni.programs?.length > 0 && (
            <div>
              <h3 className="font-bold text-brand-black text-sm mb-3 flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-brand-yellow" />
                CCS Programs Offered ({uni.programs.length})
              </h3>
              <div className="space-y-3">
                {uni.programs.map((prog) => (
                  <div key={prog.id} className="border border-gray-200 rounded-xl p-4 hover:border-brand-yellow transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-brand-black text-sm">{prog.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="badge-yellow text-xs">{prog.abbreviation}</span>
                          <span className="text-xs text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">
                            {prog.durationYears} years
                          </span>
                          {prog.hasBoardExam && (
                            <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                              Board Exam
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {prog.description && (
                      <p className="text-xs text-brand-gray-mid leading-relaxed mb-3">{prog.description}</p>
                    )}

                    {prog.specializations?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-brand-black mb-1.5">Specializations</p>
                        <div className="flex flex-wrap gap-1.5">
                          {prog.specializations.map((spec, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-brand-black px-2 py-0.5 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prog.curriculumUrl && (
                      <a
                        href={prog.curriculumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-black font-semibold
                                   border border-brand-black rounded-lg px-3 py-1.5
                                   hover:bg-brand-black hover:text-brand-yellow transition-all"
                      >
                        <BookOpenIcon className="w-3.5 h-3.5" />
                        View Curriculum
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Recommendation card ────────────────────────────────────────────────────

function RecommendationCard({ uni, onSelect }) {
  return (
    <div
      onClick={() => onSelect(uni)}
      className="card hover:border-brand-yellow hover:shadow-md transition-all relative cursor-pointer"
    >
      {/* Match score badge */}
      <div className="absolute top-3 right-3 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded-full">
        {uni.matchScore}% match
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-20">
        <div className="w-10 h-10 rounded-xl bg-brand-black flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-5 h-5 text-brand-yellow" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-brand-black text-sm leading-tight line-clamp-2">{uni.name}</h3>
          <p className="text-brand-gray-mid text-xs flex items-center gap-1 mt-0.5">
            <MapPinIcon className="w-3 h-3 flex-shrink-0" />
            {uni.city}, {uni.region}
          </p>
        </div>
      </div>

      {/* Match reasons — exclude tuition reason since we show it separately */}
      {uni.matchReasons?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {uni.matchReasons
            .filter((r) => !r.toLowerCase().includes('tuition') && !r.toLowerCase().includes('affordable'))
            .slice(0, 3)
            .map((reason, i) => (
              <span key={i} className="bg-brand-yellow/20 text-brand-black text-xs px-2 py-0.5 rounded-full">
                {reason}
              </span>
            ))}
        </div>
      )}

      {/* Programs */}
      {uni.programs?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {uni.programs.map((p) => (
            <span key={p.id} className="badge-yellow text-xs">{p.abbreviation}</span>
          ))}
        </div>
      )}

      {/* Tuition — always shown once */}
      {uni.tuitionRangeMin === 0 ? (
        <p className="text-xs text-green-600 font-semibold mb-3">Free tuition (RA 10931)</p>
      ) : uni.tuitionRangeMin ? (
        <p className="text-xs text-brand-gray-mid mb-3">From ₱{uni.tuitionRangeMin.toLocaleString()}/sem</p>
      ) : null}

      {/* CTA */}
      <button
        className="w-full bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                   hover:bg-brand-yellow-dark active:scale-95 transition-all"
      >
        View Details
      </button>
    </div>
  )
}

function RecommendationSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-28" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-gray-200 rounded-full w-12" />
        <div className="h-5 bg-gray-200 rounded-full w-12" />
      </div>
      <div className="h-9 bg-gray-200 rounded-lg w-full" />
    </div>
  )
}

// ── Browse card ────────────────────────────────────────────────────────────

function UniversityCard({ uni, onSelect }) {
  const programs = uni.programs || []
  const isFree = uni.tuitionRangeMin === 0 && (uni.tuitionRangeMax ?? 0) <= 5000

  return (
    <div
      onClick={() => onSelect(uni)}
      className="card hover:border-brand-yellow hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-6 h-6 text-brand-yellow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-brand-black text-sm leading-tight">{uni.name}</h3>
            {uni.chedCoe && (
              <span className="flex items-center gap-0.5 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                <TrophyIcon className="w-3 h-3" /> CoE
              </span>
            )}
            {uni.chedCod && (
              <span className="flex items-center gap-0.5 bg-gray-200 text-brand-black text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                CoD
              </span>
            )}
          </div>
          <p className="text-brand-gray-mid text-xs flex items-center gap-1 mt-0.5">
            <MapPinIcon className="w-3 h-3" />
            {uni.city}{uni.region ? `, ${uni.region}` : ''}
          </p>
        </div>

        {/* Type badge */}
        {uni.universityType && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[uni.universityType] || 'bg-gray-100 text-gray-700'}`}>
            {TYPE_LABELS[uni.universityType] || uni.universityType}
          </span>
        )}
      </div>

      {programs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {programs.map((prog) => (
            <span key={prog.id} className="badge-yellow text-xs">{prog.abbreviation}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Tuition</div>
          <div className={`font-semibold mt-0.5 ${isFree ? 'text-green-600' : 'text-brand-black'}`}>
            {tuitionLabel(uni.tuitionRangeMin, uni.tuitionRangeMax)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Programs</div>
          <div className="font-semibold text-brand-black mt-0.5">
            {programs.length} offered
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState('All Programs')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(true)

  // Detail drawer state
  const [selectedUni, setSelectedUni] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Reset to page 1 when filters/search change
  useEffect(() => { setPage(1) }, [search, typeFilter, programFilter])

  const fetchRecs = useCallback(() => {
    setRecsLoading(true)
    universitiesApi.recommendations()
      .then(({ data }) => setRecommendations(data))
      .catch(() => {})
      .finally(() => setRecsLoading(false))
  }, [])

  // Fetch on mount
  useEffect(() => { fetchRecs() }, [fetchRecs])

  // Re-fetch whenever the user comes back to this tab (e.g. after updating their profile)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchRecs() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchRecs])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (typeFilter !== 'All Types') params.university_type = typeFilter
      const { data } = await universitiesApi.list(params)
      // DRF pagination: { count, results } — fall back to flat array
      if (data.results !== undefined) {
        setUniversities(data.results)
        setTotalCount(data.count)
      } else {
        setUniversities(data)
        setTotalCount(data.length)
      }
    } catch {
      /* silent */
    } finally {
      setIsLoading(false)
    }
  }, [search, typeFilter, page])

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const filtered = programFilter === 'All Programs'
    ? universities
    : universities.filter((u) =>
        u.programs?.some((p) => p.abbreviation === programFilter)
      )

  function openUni(uni, match = null) {
    setSelectedUni(uni)
    setSelectedMatch(match)
  }

  function closeDrawer() {
    setSelectedUni(null)
    setSelectedMatch(null)
  }

  return (
    <div>
      {/* Detail drawer */}
      {selectedUni && (
        <UniversityDetailDrawer
          uni={selectedUni}
          matchScore={selectedMatch?.score ?? null}
          matchReasons={selectedMatch?.reasons ?? null}
          onClose={closeDrawer}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">University Finder</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Find the right university for your IT/CS career in the Philippines.
          </p>
        </div>
        <span className="badge-yellow flex items-center gap-1">
          <TrophyIcon className="w-3.5 h-3.5" />
          CHED CoE/CoD
        </span>
      </div>

      {/* ── Recommended for You ─────────────────────────────────────────── */}
      {(recsLoading || recommendations.length > 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-brand-yellow" />
              <h2 className="font-bold text-brand-black text-base">Recommended for You</h2>
              {!recsLoading && (
                <span className="text-xs text-brand-gray-mid">based on your profile & career goals</span>
              )}
            </div>
            <button
              onClick={fetchRecs}
              disabled={recsLoading}
              title="Refresh recommendations"
              className="p-1.5 rounded-lg text-brand-gray-mid hover:text-brand-black hover:bg-gray-100
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-4 h-4 ${recsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {recsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RecommendationSkeleton />
              <RecommendationSkeleton />
              <RecommendationSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((uni) => (
                <RecommendationCard
                  key={uni.id}
                  uni={uni}
                  onSelect={(u) => openUni(u, { score: u.matchScore, reasons: u.matchReasons })}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Browse all ──────────────────────────────────────────────────── */}
      <h2 className="font-bold text-brand-black text-base mb-3">All Universities</h2>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city, or region..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-brand-black
                     placeholder:text-brand-gray-mid text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
        />
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-brand-gray-mid text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
        >
          {PROGRAM_FILTERS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-brand-gray-mid text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t === 'All Types' ? 'All Types' : TYPE_LABELS[t] || t}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-brand-gray-mid mb-4">
          {totalCount} {totalCount === 1 ? 'university' : 'universities'} found
          {typeFilter !== 'All Types' && ` · ${TYPE_LABELS[typeFilter] || typeFilter}`}
          {programFilter !== 'All Programs' && ` · ${programFilter}`}
        </p>
      )}

      {/* University grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🏫</div>
          <h2 className="text-xl font-bold text-brand-black mb-2">No universities found</h2>
          <p className="text-brand-gray-mid text-sm max-w-sm mx-auto">
            {universities.length === 0
              ? 'No university data yet. Ask an admin to run: python manage.py seed_universities'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((uni) => (
              <UniversityCard key={uni.id} uni={uni} onSelect={(u) => openUni(u)} />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-brand-gray-mid">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium
                             text-brand-black hover:border-brand-yellow hover:bg-yellow-50 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
                >
                  <ChevronLeftIcon className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm font-semibold text-brand-black px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium
                             text-brand-black hover:border-brand-yellow hover:bg-yellow-50 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
                >
                  Next <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
