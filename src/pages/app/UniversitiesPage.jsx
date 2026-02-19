/**
 * Universities page — Philippine university finder for incoming students.
 * CHED CoE/CoD badges, program offerings, tuition info.
 * Full data seeded in Phase 6.
 */
import { AcademicCapIcon, MapPinIcon, TrophyIcon } from '@heroicons/react/24/solid'

const PLACEHOLDER_UNIVERSITIES = [
  {
    id: 1,
    name: 'University of the Philippines Diliman',
    shortName: 'UP Diliman',
    location: 'Quezon City, NCR',
    programs: ['BSCS', 'BSIT', 'BSCE'],
    isCoE: true,
    tuitionRange: '₱1,500 – ₱3,000/unit',
    acceptanceRate: '~12%',
    tags: ['State University', 'Research', 'Scholarship Available'],
  },
  {
    id: 2,
    name: 'De La Salle University',
    shortName: 'DLSU',
    location: 'Manila, NCR',
    programs: ['BSCS', 'BSIT', 'BSIS', 'BSCE'],
    isCoE: true,
    tuitionRange: '₱60,000 – ₱80,000/sem',
    acceptanceRate: '~25%',
    tags: ['Private', 'Research', 'Industry Network'],
  },
  {
    id: 3,
    name: 'Technological Institute of the Philippines',
    shortName: 'TIP Manila/QC',
    location: 'Manila & Quezon City, NCR',
    programs: ['BSCS', 'BSIT', 'BSIS', 'BSCE'],
    isCoE: false,
    tuitionRange: '₱30,000 – ₱45,000/sem',
    acceptanceRate: '~60%',
    tags: ['Private', 'Engineering-focused', 'Industry Partnerships'],
  },
  {
    id: 4,
    name: 'Mapúa University',
    shortName: 'Mapúa',
    location: 'Manila, NCR',
    programs: ['BSCS', 'BSIT', 'BSCE'],
    isCoE: false,
    tuitionRange: '₱40,000 – ₱60,000/sem',
    acceptanceRate: '~45%',
    tags: ['Private', 'Trimestral', 'ABET Accredited'],
  },
]

function UniversityCard({ uni }) {
  return (
    <div className="card hover:border-brand-yellow hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-6 h-6 text-brand-yellow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-brand-black text-sm leading-tight">{uni.name}</h3>
            {uni.isCoE && (
              <span className="flex items-center gap-0.5 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                <TrophyIcon className="w-3 h-3" />
                CoE
              </span>
            )}
          </div>
          <p className="text-brand-gray-mid text-xs flex items-center gap-1 mt-0.5">
            <MapPinIcon className="w-3 h-3" />
            {uni.location}
          </p>
        </div>
      </div>

      {/* Programs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {uni.programs.map((prog) => (
          <span key={prog} className="badge-yellow text-xs">{prog}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Tuition</div>
          <div className="font-semibold text-brand-black mt-0.5">{uni.tuitionRange}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-brand-gray-mid">Acceptance</div>
          <div className="font-semibold text-brand-black mt-0.5">{uni.acceptanceRate}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {uni.tags.map((tag) => (
          <span key={tag} className="bg-gray-100 text-brand-gray-mid text-xs px-2 py-0.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      <button className="w-full bg-brand-yellow text-brand-black text-sm font-bold py-2 rounded-lg
                         hover:bg-brand-yellow-dark active:scale-95 transition-all">
        View Details
      </button>
    </div>
  )
}

export default function UniversitiesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">University Finder</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Hanapin ang tamang unibersidad para sa iyong IT/CS career sa Pilipinas.
          </p>
        </div>
        <span className="badge-yellow flex items-center gap-1">
          <TrophyIcon className="w-3.5 h-3.5" />
          CHED CoE
        </span>
      </div>

      {/* Coming soon notice */}
      <div className="bg-brand-yellow-pale border border-brand-yellow/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">🏫</span>
        <div>
          <p className="font-semibold text-brand-black text-sm">Full University Database Coming in Phase 6</p>
          <p className="text-brand-gray-mid text-xs mt-0.5">
            30+ PH universities with CHED accreditation, entrance exam info, and AI-powered recommendations.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search universities... (e.g. UP, Manila, engineering)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-brand-black
                     placeholder:text-brand-gray-mid text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
        />
        <select className="px-3 py-2.5 rounded-xl border border-gray-200 text-brand-gray-mid text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white">
          <option>All Programs</option>
          <option>BSCS</option>
          <option>BSIT</option>
          <option>BSIS</option>
          <option>BSCE</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLACEHOLDER_UNIVERSITIES.map((uni) => (
          <UniversityCard key={uni.id} uni={uni} />
        ))}
      </div>
    </div>
  )
}
