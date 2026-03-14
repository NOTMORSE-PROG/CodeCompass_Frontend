import { useEffect, useState, useMemo } from 'react'
import {
  CheckBadgeIcon, MagnifyingGlassIcon, XMarkIcon,
} from '@heroicons/react/24/solid'
import {
  ArrowTopRightOnSquareIcon, BookOpenIcon, ClockIcon,
  CurrencyDollarIcon, BriefcaseIcon, WrenchScrewdriverIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { certApi } from '../../api/certifications'
import { roadmapApi } from '../../api/roadmaps'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { value: 'all', label: 'All' },
  { value: 'tesda', label: 'TESDA' },
  { value: 'google', label: 'Google' },
  { value: 'freecodecamp', label: 'freeCodeCamp' },
  { value: 'harvard', label: 'CS50' },
  { value: 'ibm', label: 'IBM' },
  { value: 'cisco', label: 'Cisco' },
  { value: 'microsoft', label: 'Microsoft' },
  { value: 'aws', label: 'AWS' },
  { value: 'comptia', label: 'CompTIA' },
  { value: 'fortinet', label: 'Fortinet' },
  { value: 'linux_foundation', label: 'Linux Found.' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'kaggle', label: 'Kaggle' },
  { value: 'hackerrank', label: 'HackerRank' },
  { value: 'github', label: 'GitHub' },
  { value: 'meta', label: 'Meta' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'postman', label: 'Postman' },
  { value: 'scrum', label: 'Scrum' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'other', label: 'Other' },
]

const PROVIDER_COLORS = {
  tesda: '#0066CC', google: '#4285F4', aws: '#FF9900', comptia: '#C8202F',
  microsoft: '#00A4EF', cisco: '#1BA0D7', meta: '#0081FB', oracle: '#F80000',
  freecodecamp: '#0A0A23', ibm: '#054ADA', mongodb: '#00ED64', github: '#24292F',
  kaggle: '#20BEFF', harvard: '#A51C30', hubspot: '#FF7A59', salesforce: '#00A1E0',
  postman: '#FF6C37', scrum: '#009FDA', linux_foundation: '#003366',
  fortinet: '#EE3124', hackerrank: '#2EC866', other: '#6B7280',
}

const STATUS_BADGE = {
  interested: { label: 'Interested', className: 'bg-blue-100 text-blue-700' },
  studying: { label: 'Studying', className: 'bg-brand-yellow text-brand-black' },
  passed: { label: 'Earned ✓', className: 'bg-brand-black text-brand-yellow' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
}

const TRACK_COLORS = {
  web: 'bg-blue-50 text-blue-600', backend: 'bg-purple-50 text-purple-600',
  data: 'bg-green-50 text-green-700', cyber: 'bg-red-50 text-red-600',
  cloud: 'bg-sky-50 text-sky-600', mobile: 'bg-pink-50 text-pink-600',
  networking: 'bg-orange-50 text-orange-600', algorithms: 'bg-indigo-50 text-indigo-600',
  marketing: 'bg-yellow-50 text-yellow-700', agile: 'bg-teal-50 text-teal-600',
  general: 'bg-gray-100 text-gray-600',
}

// Provider-specific how-to guides
const HOW_TO_GUIDES = {
  freecodecamp: [
    'Go to freecodecamp.org — no account needed to start, but create a free account to save progress.',
    'Navigate to the certification curriculum (e.g., Responsive Web Design, JavaScript Algorithms).',
    'Complete all required projects and challenges in order.',
    'Submit your projects — they are peer-reviewed or auto-verified.',
    'Once all projects pass, claim your verified certificate from your profile settings.',
  ],
  google: [
    'Visit the Google Cloud Skills Boost platform or Google Career Certificates on Coursera.',
    'Sign in with your existing Google account — no new account needed.',
    'Enroll in the free learning path or audit the course for free.',
    'Complete all modules, quizzes, and hands-on labs.',
    'Pass the final assessment or complete all courses to earn your certificate.',
    'Download and share your certificate from your profile.',
  ],
  harvard: [
    'Visit cs50.harvard.edu — the course is completely free and open to everyone.',
    'Create a free edX account or sign up directly on the CS50 site to track progress.',
    'Watch the lecture videos and complete the weekly problem sets.',
    'Submit your problem sets through the CS50 submission system (GitHub required).',
    'Complete the final project to earn the free CS50 certificate.',
    'Note: A verified certificate from edX is available for a fee, but the course certificate is free.',
  ],
  ibm: [
    'Visit IBM Skills Network (cognitiveclass.ai) or IBM\'s courses on Coursera.',
    'Create a free IBM Skills Network account.',
    'Enroll in the course — most are free to audit.',
    'Complete all videos, labs, and quizzes.',
    'Pass the final exam or complete all modules to earn your digital badge via Credly.',
    'Share your Credly badge on LinkedIn to showcase your achievement.',
  ],
  cisco: [
    'Visit the Cisco Networking Academy at netacad.com.',
    'Create a free Cisco NetAcad account.',
    'Enroll in a free course (e.g., Introduction to Networks, Cybersecurity Essentials).',
    'Complete all modules and chapter quizzes at your own pace.',
    'Pass the final course assessment to earn your completion certificate.',
    'Note: CCNA/CCNP certifications require a paid proctored exam — courses are free.',
  ],
  microsoft: [
    'Visit Microsoft Learn at learn.microsoft.com — completely free.',
    'Sign in with any Microsoft account (Outlook, Hotmail, or create one free).',
    'Browse learning paths and modules for your target role (e.g., Azure Developer).',
    'Complete modules and earn XP points on Microsoft Learn.',
    'For official certifications (AZ-900, etc.), use the free learning path to prepare, then schedule an exam.',
    'Note: Microsoft certification exams have a fee, but all study materials are free on Microsoft Learn.',
  ],
  aws: [
    'Visit AWS Skill Builder at skillbuilder.aws — create a free account.',
    'Browse free digital training courses (hundreds are free).',
    'Complete the free training content including videos and labs.',
    'For the AWS Cloud Practitioner Essentials course, it\'s completely free.',
    'Note: AWS certification exams (Cloud Practitioner, etc.) require a paid exam fee.',
    'Use AWS Free Tier to practice with real AWS services while studying.',
  ],
  comptia: [
    'CompTIA certifications require a paid proctored exam — there is no free exam option.',
    'Use free study resources: Professor Messer\'s free CompTIA courses on YouTube.',
    'Download the free exam objectives PDF from CompTIA\'s website to know what to study.',
    'Practice with free CompTIA CertMaster Practice trial or free online practice tests.',
    'Schedule your exam at a Pearson VUE or Certiport testing center.',
    'CompTIA A+, Network+, and Security+ are the most in-demand entry-level certs.',
  ],
  mongodb: [
    'Visit MongoDB University at learn.mongodb.com — create a free account.',
    'Browse free courses (MongoDB for developers, DBA path, etc.).',
    'Complete the course videos, quizzes, and hands-on labs.',
    'Pass the final assessment to earn a free MongoDB completion badge.',
    'For MongoDB Associate Developer certifications, a paid exam is required.',
    'The free courses count toward exam preparation.',
  ],
  kaggle: [
    'Visit kaggle.com and create a free Kaggle account.',
    'Go to kaggle.com/learn — all courses are completely free.',
    'Complete the short, practical courses (Python, ML, Deep Learning, etc.).',
    'Each course has exercises you run directly in Kaggle Notebooks (no setup needed).',
    'Finish all exercises to earn a Kaggle Certificate of Completion.',
    'Share your certificate directly from your Kaggle profile.',
  ],
  hackerrank: [
    'Visit hackerrank.com and create a free account.',
    'Go to the Skills Certification section.',
    'Take the free online skill assessment test (timed, multiple choice + coding).',
    'No prior study required — the test measures your existing skill level.',
    'Pass the assessment to earn a verified HackerRank certificate.',
    'Share your certificate URL directly on your resume or LinkedIn.',
  ],
  github: [
    'Visit skills.github.com — you need a free GitHub account.',
    'Sign in with your GitHub account — all courses use GitHub repositories.',
    'Start any course — it automatically creates a repository in your account.',
    'Follow the step-by-step instructions in the repo issues/discussions.',
    'Complete all steps to get your completion badge on your GitHub profile.',
    'Your work is visible on GitHub, which also serves as a portfolio.',
  ],
  hubspot: [
    'Visit academy.hubspot.com — create a free HubSpot Academy account.',
    'Browse the free certifications (Marketing, Sales, SEO, etc.).',
    'Complete the free course lessons and videos.',
    'Take the free certification exam (multiple choice, open book style).',
    'Pass the exam to earn your HubSpot certification.',
    'Certificate is valid for 1 year and automatically renewable.',
  ],
  postman: [
    'Visit learning.postman.com — create a free Postman account.',
    'Enroll in the free Postman API Fundamentals Student Expert program.',
    'Complete the workspace exercises and submit via a Postman collection.',
    'Fork the provided collection and follow the guided challenges.',
    'Submit your completed collection to receive your free digital badge.',
    'Share your Postman badge on LinkedIn.',
  ],
  salesforce: [
    'Visit trailhead.salesforce.com — create a free Trailhead account.',
    'Complete free Trails and Modules at your own pace.',
    'Earn free Trailhead Badges and Superbadges by completing challenges.',
    'Superbadges are scenario-based and verify real skills.',
    'Note: Official Salesforce certifications require a paid exam.',
    'Trailhead credentials and superbadges are recognized by employers.',
  ],
  scrum: [
    'Visit scrumstudyguide.com or certiprof.com for free Scrum certifications.',
    'Create a free account on either platform.',
    'Download the free Scrum Body of Knowledge (SBOK) study guide.',
    'Study the Scrum framework: roles, events, artifacts.',
    'Take the free online exam (Scrum Fundamentals Certified / SFPC).',
    'Pass with 70%+ to receive your free certificate via email.',
  ],
  linux_foundation: [
    'Visit training.linuxfoundation.org — create a free account.',
    'Browse free courses (Introduction to Linux, Open Source, etc.).',
    'Complete the free course on edX by auditing for free.',
    'Finish all modules and pass the final assessment.',
    'Note: LFCS/LFCE/CKA certifications require paid exams.',
    'Free courses provide a strong foundation for paid certification exams.',
  ],
  fortinet: [
    'Visit training.fortinet.com — create a free NSE Training Institute account.',
    'Enroll in NSE 1, NSE 2, and NSE 3 — all completely free.',
    'Complete the online self-paced modules (videos + quizzes).',
    'NSE 1 covers information security fundamentals (about 2 hours).',
    'NSE 2 covers the evolution of cybersecurity threats (about 3 hours).',
    'NSE 3 covers the Fortinet Security Fabric (about 3 hours).',
    'Pass each level\'s exam to earn your free NSE certificate.',
  ],
  tesda: [
    'Visit tesda.gov.ph or a TESDA-accredited training center near you.',
    'Create a free TESDA online account at portal.tesda.gov.ph.',
    'Enroll in a free online course (TVET programs are government-funded).',
    'Complete all course modules and practical sessions.',
    'Apply for the National Competency Assessment at a TESDA Assessment Center.',
    'Pass the competency assessment to earn your National Certificate (NC I or NC II).',
    'Note: Assessment fee is approximately ₱550–₱1,000 depending on the qualification.',
  ],
  other: [
    'Visit the provider\'s official website using the link on this page.',
    'Look for a free account sign-up option.',
    'Enroll in the free course or certification program.',
    'Complete all required modules, projects, or assessments.',
    'Claim your certificate upon successful completion.',
  ],
}

// ─── Recommended Certs Strip ──────────────────────────────────────────────────
function RecommendedCertMiniCard({ cert, tracking, onOpenDetail, onTrack }) {
  const bgColor = PROVIDER_COLORS[cert.provider] || '#6B7280'
  const isTracked = !!tracking
  return (
    <div
      className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-3 cursor-pointer
                 hover:border-purple-300 hover:shadow-sm transition-all flex flex-col"
      onClick={() => onOpenDetail(cert)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
          style={{ backgroundColor: bgColor }}
        >
          {cert.abbreviation?.[0] || cert.name[0]}
        </div>
        {cert.isFree && (
          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold">FREE</span>
        )}
      </div>
      <p className="text-xs font-bold text-brand-black line-clamp-2 leading-snug mb-1 flex-1">{cert.name}</p>
      <p className="text-xs text-brand-gray-mid mb-3">{cert.levelDisplay}</p>
      <button
        onClick={(e) => { e.stopPropagation(); if (!isTracked) onTrack(cert.id, null, 'interested') }}
        disabled={isTracked}
        className={`w-full text-xs font-bold py-1.5 rounded-lg transition-all ${
          isTracked
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark active:scale-95'
        }`}
      >
        {isTracked ? 'Tracked ✓' : 'Track This'}
      </button>
    </div>
  )
}

function RecommendedCertsStrip({ certs, roadmapTitle, trackingMap, onOpenDetail, onTrack, isLoading }) {
  if (isLoading) {
    return (
      <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-yellow-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">✨</span>
          <div className="space-y-1">
            <div className="h-3.5 w-36 bg-purple-100 rounded animate-pulse" />
            <div className="h-3 w-52 bg-purple-100/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-28 bg-white/70 border border-purple-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  if (!certs.length) return null
  return (
    <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-yellow-50 border border-purple-100 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✨</span>
        <div>
          <p className="text-sm font-bold text-brand-black">Recommended for You</p>
          {roadmapTitle && (
            <p className="text-xs text-brand-gray-mid">Based on your "{roadmapTitle}" roadmap</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {certs.map((cert) => (
          <RecommendedCertMiniCard
            key={cert.id}
            cert={cert}
            tracking={trackingMap[cert.id]}
            onOpenDetail={onOpenDetail}
            onTrack={onTrack}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function CertDetailDrawer({ cert, tracking, onClose, onTrack, onUntrack }) {
  const steps = HOW_TO_GUIDES[cert.provider] || HOW_TO_GUIDES.other
  const isTracked = !!tracking
  const trackedStatus = tracking?.status
  const bgColor = PROVIDER_COLORS[cert.provider] || '#6B7280'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-200" style={{ borderTopColor: bgColor, borderTopWidth: 4 }}>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-lg"
            style={{ backgroundColor: bgColor }}
          >
            {cert.abbreviation?.[0] || cert.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-brand-black text-base leading-snug">{cert.name}</h2>
            {cert.abbreviation && (
              <p className="text-brand-gray-mid text-xs font-medium mt-0.5">{cert.abbreviation}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${TRACK_COLORS[cert.track] || 'bg-gray-100 text-gray-600'}`}>
                {cert.trackDisplay}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {cert.levelDisplay}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-700 font-medium">
                Free
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-brand-gray-mid flex-shrink-0" />
              <div>
                <p className="text-xs text-brand-gray-mid">Study Time</p>
                <p className="text-sm font-bold text-brand-black">
                  {cert.estimatedStudyHours ? `~${cert.estimatedStudyHours} hours` : 'Varies'}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <CurrencyDollarIcon className="w-5 h-5 text-brand-gray-mid flex-shrink-0" />
              <div>
                <p className="text-xs text-brand-gray-mid">Cost</p>
                <p className="text-sm font-bold text-brand-black">
                  {cert.isFree ? 'Free' : cert.estimatedCostPhp ? `₱${cert.estimatedCostPhp.toLocaleString()}` : 'Paid'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-brand-black mb-2">
              <InformationCircleIcon className="w-4 h-4" />
              About
            </h3>
            <p className="text-sm text-brand-gray-mid leading-relaxed">{cert.description}</p>
          </div>

          {/* How to get it */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-brand-black mb-3">
              <BookOpenIcon className="w-4 h-4" />
              How to Get This Certification
            </h3>
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: bgColor }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-brand-gray-mid leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Optional paid upgrade */}
          {cert.optionalPaidUpgrade && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs font-bold text-yellow-800 mb-1">Optional Paid Upgrade</p>
              <p className="text-sm text-yellow-700">{cert.optionalPaidUpgrade}</p>
            </div>
          )}

          {/* Skills */}
          {cert.relevantSkills?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-black mb-2">
                <WrenchScrewdriverIcon className="w-4 h-4" />
                Skills You'll Gain
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cert.relevantSkills.map((skill) => (
                  <span key={skill} className="bg-gray-100 text-brand-gray-mid text-xs px-2.5 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Career paths */}
          {cert.careerPaths?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-black mb-2">
                <BriefcaseIcon className="w-4 h-4" />
                Career Paths
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cert.careerPaths.map((path) => (
                  <span key={path} className="bg-brand-yellow/20 text-brand-black text-xs px-2.5 py-1 rounded-lg font-medium">
                    {path}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-col gap-2">
            {cert.examUrl && (
              <a
                href={cert.examUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg
                           hover:border-brand-yellow hover:bg-yellow-50 transition-all group"
              >
                <span className="text-sm font-medium text-brand-black">Visit Official Page</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-brand-gray-mid group-hover:text-brand-black" />
              </a>
            )}
            {cert.studyGuideUrl && (
              <a
                href={cert.studyGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg
                           hover:border-brand-yellow hover:bg-yellow-50 transition-all group"
              >
                <span className="text-sm font-medium text-brand-black">Study Guide / Resources</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-brand-gray-mid group-hover:text-brand-black" />
              </a>
            )}
          </div>
        </div>

        {/* Drawer footer — tracking actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {trackedStatus === 'passed' ? (
            <div className="flex items-center justify-center gap-2 py-2 text-brand-yellow font-bold">
              <CheckBadgeIcon className="w-5 h-5" />
              <span>Certificate Earned! +200 XP</span>
            </div>
          ) : isTracked ? (
            <div className="flex gap-2">
              <select
                value={trackedStatus}
                onChange={(e) => onTrack(cert.id, tracking.id, e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
              >
                <option value="interested">Interested</option>
                <option value="studying">Currently Studying</option>
                <option value="passed">Passed / Earned</option>
              </select>
              <button
                onClick={() => { onUntrack(tracking.id); onClose() }}
                className="px-4 py-2.5 border border-red-200 rounded-lg text-red-400 hover:bg-red-50 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTrack(cert.id, null, 'interested')}
              className="w-full bg-brand-yellow text-brand-black font-bold py-3 rounded-lg
                         hover:bg-brand-yellow-dark active:scale-95 transition-all"
            >
              Track This Certification
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Cert Card ────────────────────────────────────────────────────────────────
function CertCard({ cert, tracking, onTrack, onUntrack, onOpenDetail }) {
  const isTracked = !!tracking
  const trackedStatus = tracking?.status
  const currentBadge = isTracked
    ? (STATUS_BADGE[trackedStatus] || STATUS_BADGE.interested)
    : { label: 'Available', className: 'bg-green-100 text-green-700' }

  return (
    <div
      className="card hover:border-brand-yellow hover:shadow-md transition-all flex flex-col cursor-pointer"
      onClick={() => onOpenDetail(cert)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
            style={{ backgroundColor: PROVIDER_COLORS[cert.provider] || '#6B7280' }}
          >
            {cert.abbreviation?.[0] || cert.name[0]}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-brand-black text-sm leading-snug line-clamp-2">{cert.name}</h3>
            <p className="text-brand-gray-mid text-xs capitalize mt-0.5">
              {cert.provider?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <span className={`badge text-xs flex-shrink-0 ${currentBadge.className}`}>
          {currentBadge.label}
        </span>
      </div>

      {/* Track + Level */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cert.trackDisplay && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${TRACK_COLORS[cert.track] || 'bg-gray-100 text-gray-600'}`}>
            {cert.trackDisplay}
          </span>
        )}
        {cert.levelDisplay && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
            {cert.levelDisplay}
          </span>
        )}
      </div>

      {/* Description preview */}
      <p className="text-xs text-brand-gray-mid line-clamp-2 mb-3 leading-relaxed">
        {cert.description}
      </p>

      {/* Quick stats */}
      <div className="flex items-center gap-4 text-xs text-brand-gray-mid mb-4">
        <span>⏱ {cert.estimatedStudyHours ? `~${cert.estimatedStudyHours}h` : 'Varies'}</span>
        <span>💰 {cert.isFree ? 'Free' : 'Paid'}</span>
      </div>

      {/* Actions — stop propagation so clicks don't open drawer */}
      <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
        {trackedStatus === 'passed' ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 text-brand-yellow font-bold text-sm">
            <CheckBadgeIcon className="w-5 h-5" />
            <span>Earned! +200 XP</span>
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
              className="px-3 py-2 border border-red-200 rounded-lg text-red-400 hover:bg-red-50 text-xs"
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
            <button
              onClick={() => onOpenDetail(cert)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-brand-gray-mid
                         hover:border-brand-yellow transition-colors text-xs font-medium"
            >
              Details
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CertificationsPage() {
  const [certs, setCerts] = useState([])
  const [myTracking, setMyTracking] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [isLoading, setIsLoading] = useState(true)
  const [detailCert, setDetailCert] = useState(null)
  const [roadmapNodes, setRoadmapNodes] = useState([])
  const [roadmapTitle, setRoadmapTitle] = useState('')
  const [isLoadingRecs, setIsLoadingRecs] = useState(true)

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
        /* silent */
      } finally {
        setIsLoading(false)
      }
      // Fetch primary roadmap for recommendations (non-blocking)
      try {
        const listRes = await roadmapApi.list()
        const roadmaps = listRes.data.results || listRes.data
        const primary = roadmaps.find((r) => r.isPrimary) || roadmaps[0]
        if (primary) {
          const detailRes = await roadmapApi.detail(primary.id)
          setRoadmapNodes(detailRes.data.nodes || [])
          setRoadmapTitle(detailRes.data.title || '')
        }
      } catch {
        /* no roadmap — recommendations simply won't show */
      } finally {
        setIsLoadingRecs(false)
      }
    }
    load()
  }, [])

  const handleTrack = async (certId, trackingId, newStatus) => {
    try {
      if (trackingId) {
        const { data } = await certApi.updateTracking(trackingId, { status: newStatus })
        setMyTracking((prev) => prev.map((t) => (t.id === trackingId ? data : t)))
        if (newStatus === 'passed') {
          toast.success('Certification earned! +200 XP awarded 🎉', { duration: 4000 })
        } else {
          toast.success('Status updated!')
        }
      } else {
        const { data } = await certApi.trackCert(certId, newStatus)
        setMyTracking((prev) => [...prev, data])
        toast.success('Added to your tracker!')
      }
    } catch {
      toast.error('Failed to update tracker.')
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

  const trackingMap = useMemo(
    () => Object.fromEntries(myTracking.map((t) => [t.certification?.id ?? t.certification, t])),
    [myTracking]
  )

  const filtered = useMemo(() => {
    let list = certs
    if (selectedProvider !== 'all') list = list.filter((c) => c.provider === selectedProvider)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    }
    return list
  }, [certs, selectedProvider, search])

  const myCerts = useMemo(
    () => myTracking.map((t) => ({ cert: t.certification, tracking: t })).filter((x) => x.cert),
    [myTracking]
  )

  const earnedCount = myTracking.filter((t) => t.status === 'passed').length
  const studyingCount = myTracking.filter((t) => t.status === 'studying').length

  // Dynamically score DB certs against the user's roadmap node titles
  const recommendations = useMemo(() => {
    if (!roadmapNodes.length || !certs.length) return []
    const roadmapText = roadmapNodes
      .filter((n) => n.nodeType !== 'milestone')
      .map((n) => n.title.toLowerCase())
      .join(' ')
    return certs
      .filter((c) => !trackingMap[c.id])
      .map((c) => ({
        cert: c,
        score: (c.relevantSkills || []).filter((s) => roadmapText.includes(s.toLowerCase())).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ cert }) => cert)
  }, [certs, roadmapNodes, trackingMap])

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Certifications</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">
            Track free IT certifications that strengthen your resume.
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-2xl font-black text-brand-yellow">{earnedCount}</div>
            <div className="text-xs text-brand-gray-mid">earned</div>
          </div>
          <div>
            <div className="text-2xl font-black text-brand-black">{studyingCount}</div>
            <div className="text-xs text-brand-gray-mid">studying</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[['browse', 'Browse All'], ['mine', `My Certs (${myTracking.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === key
                ? 'border-brand-yellow text-brand-black'
                : 'border-transparent text-brand-gray-mid hover:text-brand-black'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Recommendations based on active roadmap */}
          {(isLoadingRecs || recommendations.length > 0) && (
            <RecommendedCertsStrip
              certs={recommendations}
              roadmapTitle={roadmapTitle}
              trackingMap={trackingMap}
              onOpenDetail={setDetailCert}
              onTrack={handleTrack}
              isLoading={isLoadingRecs}
            />
          )}

          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Provider filter */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {PROVIDERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedProvider(value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedProvider === value
                    ? 'bg-brand-yellow text-brand-black'
                    : 'bg-white border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!isLoading && (
            <p className="text-xs text-brand-gray-mid mb-4">
              {filtered.length} certification{filtered.length !== 1 ? 's' : ''} — click any card to see how to get it
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🏅</div>
              <p className="text-brand-gray-mid">
                {certs.length === 0
                  ? 'No certifications yet. Run the seed command first!'
                  : 'No certifications match your filters.'}
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
                  onOpenDetail={setDetailCert}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {myCerts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-brand-gray-mid mb-3">You haven't tracked any certifications yet.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="bg-brand-yellow text-brand-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-brand-yellow-dark"
              >
                Browse Certifications
              </button>
            </div>
          ) : (
            ['studying', 'interested', 'passed', 'expired'].map((status) => {
              const group = myCerts.filter((x) => x.tracking.status === status)
              if (!group.length) return null
              return (
                <div key={status} className="mb-8">
                  <h2 className="text-xs font-bold text-brand-gray-mid uppercase tracking-wide mb-3">
                    {STATUS_BADGE[status]?.label || status}
                    <span className="ml-2 text-brand-black text-sm font-black">{group.length}</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map(({ cert, tracking }) => (
                      <CertCard
                        key={cert.id}
                        cert={cert}
                        tracking={tracking}
                        onTrack={handleTrack}
                        onUntrack={handleUntrack}
                        onOpenDetail={setDetailCert}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Detail drawer */}
      {detailCert && (
        <CertDetailDrawer
          cert={detailCert}
          tracking={trackingMap[detailCert.id]}
          onClose={() => setDetailCert(null)}
          onTrack={handleTrack}
          onUntrack={handleUntrack}
        />
      )}
    </div>
  )
}
