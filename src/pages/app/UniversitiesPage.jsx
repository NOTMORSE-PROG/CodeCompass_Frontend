import { useEffect, useState, useCallback } from 'react'
import { AcademicCapIcon, MapPinIcon, TrophyIcon, GlobeAltIcon } from '@heroicons/react/24/solid'
import { universitiesApi } from '../../api/universities'

const PROGRAM_FILTERS = ['All Programs', 'BSCS', 'BSIT', 'BSIS', 'BSCE']
const TYPE_FILTERS = ['All Types', 'state', 'private', 'local']
const TYPE_LABELS = { All: 'All', state: 'State University', private: 'Private', local: 'Local College' }

function UniversityCard({ uni }) {
  const programs = uni.programs || []

  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-6 h-6 text-brand-yellow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-brand-black text-sm leading-tight">{uni.name}</h3>
            {uni.chedCoe && (
              <span className="flex items-center gap-0.5 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                <TrophyIcon className="w-3 h-3" />CoE
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
      </div>

      {/* Programs */}
      {programs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {programs.map((prog) => (
            <span key={prog.id} className="badge-yellow text-xs">{prog.abbreviation}</span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Tuition</div>
          <div className="font-semibold text-brand-black mt-0.5">
            {uni.tuitionRangeMin && uni.tuitionRangeMax
              ? `₱${uni.tuitionRangeMin.toLocaleString()} – ₱${uni.tuitionRangeMax.toLocaleString()}/sem`
              : uni.tuitionRangeMin
              ? `From ₱${uni.tuitionRangeMin.toLocaleString()}`
              : 'Contact school'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Type</div>
          <div className="font-semibold text-brand-black mt-0.5 capitalize">
            {uni.universityType === 'state' ? 'State / SUC' : uni.universityType}
          </div>
        </div>
      </div>

      {/* CHED accreditation */}
      {uni.accreditationLevel && (
        <p className="text-xs text-brand-gray-mid mb-3">
          CHED Accreditation Level {uni.accreditationLevel}
        </p>
      )}

      <div className="flex gap-2">
        {uni.websiteUrl ? (
          <a
            href={uni.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-yellow text-brand-black
                       text-sm font-bold py-2 rounded-lg hover:bg-brand-yellow-dark active:scale-95 transition-all"
          >
            <GlobeAltIcon className="w-4 h-4" />
            Visit Website
          </a>
        ) : (
          <button className="flex-1 bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                             hover:bg-brand-yellow-dark active:scale-95 transition-all">
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState('All Programs')
  const [typeFilter, setTypeFilter] = useState('All Types')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (typeFilter !== 'All Types') params.university_type = typeFilter
      const { data } = await universitiesApi.list(params)
      setUniversities(data.results || data)
    } catch {
      /* silent */
    } finally {
      setIsLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    const timer = setTimeout(load, 300) // debounce search
    return () => clearTimeout(timer)
  }, [load])

  // Client-side program filter (programs are nested objects)
  const filtered = programFilter === 'All Programs'
    ? universities
    : universities.filter((u) =>
        u.programs?.some((p) => p.abbreviation === programFilter)
      )

  return (
    <div>
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
          {TYPE_FILTERS.map((t) => <option key={t} value={t}>{t === 'All Types' ? 'All Types' : TYPE_LABELS[t] || t}</option>)}
        </select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-brand-gray-mid mb-4">
          {filtered.length} {filtered.length === 1 ? 'university' : 'universities'} found
        </p>
      )}

      {/* Content */}
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
              ? 'No university data yet. Ask an admin to seed the database.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((uni) => (
            <UniversityCard key={uni.id} uni={uni} />
          ))}
        </div>
      )}
    </div>
  )
}
