/**
 * Roadmap page — Udemy-like learning flow with curriculum list, active lesson, and localStorage persistence.
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import useRoadmapStore from '../../stores/roadmapStore'
import useGamificationStore from '../../stores/gamificationStore'
import { roadmapApi } from '../../api/roadmaps'

const NODE_TYPE_LABEL = {
  milestone: 'PHASE',
  skill: 'SKILL',
  project: 'PROJECT',
  certification: 'CERT',
  assessment: 'QUIZ',
  final_assessment: 'FINAL',
}

const DIFFICULTY_LABELS = ['', 'Beginner', 'Easy', 'Intermediate', 'Hard', 'Expert']

// Sub-section grouping: types listed here get their own labeled divider within a phase.
// Certifications used to be a per-phase sub-section, but now render globally as a
// trailing section (see GLOBAL_TRAILING_TYPES below).
const SUB_SECTION_TYPES = [
  { type: 'project', label: 'Projects' },
]
const SUB_SECTION_TYPE_SET = new Set(SUB_SECTION_TYPES.map((s) => s.type))

// Global trailing sections — collected out of per-phase groupings and rendered
// after all phases in this order. Only applied when the roadmap actually contains
// a final_assessment node; otherwise legacy layout (per-phase certs) is preserved.
const GLOBAL_TRAILING_SECTIONS = [
  { type: 'final_assessment', label: 'Phase 4: Final Assessment' },
  { type: 'certification',    label: 'Phase 5: Certifications'   },
]

// Titles matching these are opinion/meta videos, not actual lessons.
// Must stay in sync with backend _META_TITLE_PATTERNS in youtube_client.py.
const META_TITLE_PATTERNS = [
  'has changed', 'is dead', 'is dying', 'you should stop', 'stop using',
  'nobody talks about', 'every developer should', 'this will change',
  'changed everything', 'honest opinion', 'my opinion', 'the truth about',
  'why i quit', 'why i left', 'i was wrong', 'unpopular opinion',
  'reaction to', 'responding to', 'what nobody tells you', 'you need to know',
  'tier list', 'ranked', 'vlog', 'q&a', 'ama', 'best of', 'top 10', 'top 5',
  'roadmap 2024', 'roadmap 2025', 'roadmap 2026',
]

function titleIsLowQuality(title) {
  if (!title) return false
  const lower = title.toLowerCase()
  return META_TITLE_PATTERNS.some((pat) => lower.includes(pat))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatRemainingHours(h) {
  if (h <= 0) return null
  return h < 1 ? '< 1h left' : `~${Math.ceil(h)}h left`
}

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#F5C518', '#1a1a1a', '#ffffff', '#fbbf24'],
    ticks: 200,
    gravity: 1.2,
  })
}

function hasWrongStructure(nodes) {
  // Check each phase independently: cert phases must be cert-only,
  // project phases must be project-only (no skills/assessments mixed in).
  const phases = []
  let cur = []
  for (const node of nodes) {
    if (node.nodeType === 'milestone') { if (cur.length) phases.push(cur); cur = [] }
    else cur.push(node)
  }
  if (cur.length) phases.push(cur)
  return phases.some((ph) => {
    const hasCert    = ph.some((n) => n.nodeType === 'certification')
    const hasProject = ph.some((n) => n.nodeType === 'project')
    const hasSkill   = ph.some((n) => n.nodeType === 'skill' || n.nodeType === 'assessment')
    return (hasCert && (hasProject || hasSkill)) || (hasProject && hasSkill)
  })
}

function SubSectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function PhaseHeader({ label, completed, total, done, xpRemaining }) {
  return (
    <div className="flex items-center gap-3 py-2 mt-4">
      <div className="flex-1 h-px bg-gray-200" />
      <div
        className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap ${
          completed
            ? 'bg-brand-black text-brand-yellow'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {completed ? '✓ ' : ''}{label}
        {total > 0 && (
          <span className="ml-2 font-normal normal-case tracking-normal opacity-80">
            {done}/{total} done
          </span>
        )}
        {xpRemaining > 0 && !completed && (
          <span className="ml-2 opacity-70">+{xpRemaining} XP</span>
        )}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function getLsKey(nodeId, kind) {
  return kind === 'active'
    ? `cc_node_${nodeId}_active`
    : `cc_node_${nodeId}_done`
}

function readActiveIndex(nodeId) {
  try {
    const v = localStorage.getItem(getLsKey(nodeId, 'active'))
    return v !== null ? parseInt(v, 10) : 0
  } catch {
    return 0
  }
}

function writeActiveIndex(nodeId, idx) {
  try {
    localStorage.setItem(getLsKey(nodeId, 'active'), String(idx))
  } catch { /* localStorage unavailable — skip persistence */ }
}

function readDoneIds(nodeId) {
  try {
    const v = localStorage.getItem(getLsKey(nodeId, 'done'))
    return v ? new Set(JSON.parse(v)) : new Set()
  } catch {
    return new Set()
  }
}

function writeDoneIds(nodeId, doneSet) {
  try {
    localStorage.setItem(getLsKey(nodeId, 'done'), JSON.stringify([...doneSet]))
  } catch { /* localStorage unavailable — skip persistence */ }
}

// ---------------------------------------------------------------------------
// YouTube IFrame API — singleton loader so the script is injected once
// ---------------------------------------------------------------------------

let _ytApiPromise = null

function loadYouTubeApi() {
  if (_ytApiPromise) return _ytApiPromise
  _ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(window.YT); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      resolve(window.YT)
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return _ytApiPromise
}

/**
 * YouTubePlayer — wraps YT.Player with:
 *   - timestamp resume (saves every 1 s to localStorage)
 *   - seek-forward prevention: snaps back if user tries to skip ahead
 *   - fires onWatchedEnough(secs) after 5 continuous minutes of watch time (resets on leave)
 *   - fires onEnded() when video finishes
 */
function YouTubePlayer({ videoId, resourceId, onWatchedEnough, onTimeUpdate, onEnded }) {
  const divRef = useRef(null)
  const playerRef = useRef(null)
  const intervalRef = useRef(null)
  const unlockedRef = useRef(false)
  const maxWatchedRef = useRef(0)   // high-water mark: furthest position reached (seconds)
  const cumulativeRef = useRef(0)   // total accumulated playback seconds
  const lastWallRef   = useRef(null) // wall-clock ms at last interval tick
  const LS_KEY = `cc_vid_${resourceId}_t`

  useEffect(() => {
    let mounted = true
    loadYouTubeApi().then((YT) => {
      if (!mounted || !divRef.current) return

      const savedTime = parseFloat(localStorage.getItem(LS_KEY) || '0') || 0
      // maxWatched starts at the resume position so seek-prevention works correctly
      maxWatchedRef.current = savedTime
      // cumulative always resets — leaving the video means starting the 5-min timer over
      cumulativeRef.current = 0
      lastWallRef.current   = null

      playerRef.current = new YT.Player(divRef.current, {
        videoId,
        playerVars: {
          start: Math.floor(savedTime),
          rel: 0,        // no related videos at end
          modestbranding: 1,
        },
        events: {
          onStateChange(e) {
            const P = YT.PlayerState
            if (e.data === P.PLAYING) {
              lastWallRef.current = Date.now()
              intervalRef.current = setInterval(() => {
                const t   = playerRef.current?.getCurrentTime?.() ?? 0
                const now = Date.now()

                // ── seek-forward prevention ──────────────────────────────
                if (t > maxWatchedRef.current + 3) {
                  playerRef.current.seekTo(maxWatchedRef.current, true)
                  lastWallRef.current = Date.now()
                  return
                }

                // ── accumulate real watch time ───────────────────────────
                if (lastWallRef.current !== null) {
                  const elapsed = (now - lastWallRef.current) / 1000
                  cumulativeRef.current += elapsed
                }
                lastWallRef.current = now

                // ── advance high-water mark ──────────────────────────────
                if (t > maxWatchedRef.current) maxWatchedRef.current = t

                // ── persist resume position only (cumulative is intentionally in-memory) ──
                localStorage.setItem(LS_KEY, String(t))

                // ── notify parent of current watch time (drives the visual timer) ─
                onTimeUpdate?.(Math.min(cumulativeRef.current, 300))

                // ── unlock quiz after 5 minutes of real watch time ───────
                if (!unlockedRef.current && cumulativeRef.current >= 300) {
                  unlockedRef.current = true
                  onWatchedEnough?.(cumulativeRef.current)
                }
              }, 1000)
            } else {
              clearInterval(intervalRef.current)
              lastWallRef.current = null  // stop accumulating while paused/ended
              const t = playerRef.current?.getCurrentTime?.() ?? 0
              if (t > 0) localStorage.setItem(LS_KEY, String(t))
              if (e.data === P.ENDED) {
                localStorage.removeItem(LS_KEY)
                onEnded?.()
              }
            }
          },
        },
      })
    })
    return () => {
      mounted = false
      clearInterval(intervalRef.current)
      playerRef.current?.destroy?.()
    }
  }, [videoId, resourceId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={divRef} className="w-full aspect-video" />
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function DifficultyDots({ level }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`inline-block w-2 h-2 rounded-full ${
            i <= level ? 'bg-brand-yellow' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-brand-gray-mid">{DIFFICULTY_LABELS[level] || ''}</span>
    </span>
  )
}

/** Modal for viewing articles / docs / courses in-app via iframe */
function ResourceModal({ resource, onClose, onMarkedRead }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand-black">
      <div className="flex items-center gap-3 px-4 py-2 bg-brand-black border-b border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-brand-yellow font-bold text-sm hover:opacity-70 transition-opacity"
        >
          ← Back
        </button>
        <span className="text-white text-sm font-medium truncate flex-1">{resource.title}</span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-brand-yellow transition-colors flex-shrink-0"
        >
          Open externally ↗
        </a>
        {onMarkedRead && (
          <button
            onClick={() => { onMarkedRead(); onClose() }}
            className="px-3 py-1.5 bg-green-600 text-white font-bold text-xs rounded-lg
                       hover:bg-green-700 active:scale-95 transition-all flex-shrink-0"
          >
            Mark as Read ✓
          </button>
        )}
      </div>
      <div className="flex-1 relative">
        <iframe
          src={resource.url}
          title={resource.title}
          className="absolute inset-0 w-full h-full border-0 bg-white"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white pointer-events-none">
          <p className="text-sm opacity-50">Page blocked iframe embedding.</p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto px-4 py-2 bg-brand-yellow text-brand-black font-bold text-sm rounded-lg"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>
    </div>
  )
}

/** Navigate to QuizPage for a YouTube video resource */
function VideoAssessment({ roadmapId, nodeId, resource, onAssessmentPassed }) {
  const navigate = useNavigate()
  const location = useLocation()

  // On return from QuizPage: detect passed result in location state
  useEffect(() => {
    const s = location.state
    if (s?.quizPassed && s?.resourceId === resource.id) {
      onAssessmentPassed(resource.id, { results: s.results, questions: s.questions })
      // Clear the state so it doesn't re-fire on subsequent renders
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={() => navigate('/app/quiz', { state: { roadmapId, nodeId, resource } })}
      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                 border border-dashed border-brand-yellow bg-yellow-50 text-brand-black
                 text-sm font-semibold hover:bg-yellow-100 transition-colors"
    >
      <span>📝</span> Take Quiz — 10 Questions
    </button>
  )
}

// ---------------------------------------------------------------------------
// Resource type helpers
// ---------------------------------------------------------------------------

function getResourceTypeIcon(resourceType) {
  switch (resourceType) {
    case 'youtube_video':
    case 'youtube_playlist':
      return { label: 'YT', bg: 'bg-red-100 text-red-600' }
    case 'github_repo':
      return { label: 'GH', bg: 'bg-gray-900 text-white' }
    case 'article':
      return { label: 'A', bg: 'bg-blue-100 text-blue-700' }
    case 'documentation':
      return { label: 'D', bg: 'bg-purple-100 text-purple-700' }
    case 'course':
      return { label: 'C', bg: 'bg-green-100 text-green-700' }
    default:
      return { label: 'R', bg: 'bg-gray-100 text-gray-600' }
  }
}

function isYouTubeResource(resource) {
  return resource.resourceType === 'youtube_video' || resource.resourceType === 'youtube_playlist'
}

function isGitHubResource(resource) {
  return resource.resourceType === 'github_repo'
}

function getVideoId(resource) {
  const ytIdFromUrl = resource.url?.match(/(?:v=|youtu\.be\/)([^&\n?#]{11})/)?.[1]
  return resource.youtubeVideoId || ytIdFromUrl || null
}

// ---------------------------------------------------------------------------
// CurriculumRow — single lesson row in the curriculum list
// ---------------------------------------------------------------------------

function CurriculumRow({ resource, index, isActive, isDone, isFetching, onClick }) {
  const { label, bg } = getResourceTypeIcon(resource.resourceType)
  const duration = formatDuration(resource.durationMinutes)

  let statusIcon
  if (isDone) {
    statusIcon = <span className="text-green-500 text-sm font-bold">✓</span>
  } else if (isActive) {
    statusIcon = <span className="text-brand-yellow text-sm">▶</span>
  } else {
    statusIcon = <span className="text-gray-300 text-sm">○</span>
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-yellow-50 border border-brand-yellow'
          : isDone
          ? 'bg-green-50 border border-green-200 hover:border-green-300'
          : 'bg-white border border-gray-100 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {/* Lesson number */}
      <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0 text-right">
        {index + 1}
      </span>

      {/* Type icon */}
      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${bg}`}>
        {isFetching && isYouTubeResource(resource) && !getVideoId(resource) ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          label
        )}
      </span>

      {/* Title */}
      <span className={`flex-1 text-sm truncate ${
        isActive ? 'font-semibold text-brand-black' : isDone ? 'text-gray-500' : 'text-gray-700'
      }`}>
        {resource.title}
      </span>

      {/* Duration badge */}
      {duration && (
        <span className="text-xs text-gray-400 flex-shrink-0 mr-1">{duration}</span>
      )}

      {/* Status icon */}
      <span className="flex-shrink-0">{statusIcon}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// ActiveLessonContent — expanded content for the currently active lesson
// ---------------------------------------------------------------------------

function ActiveLessonContent({
  resource,
  isFetching,
  fetchAttempted: _fetchAttempted,
  roadmapId,
  nodeId,
  isDone,
  onMarkLessonDone,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [quizUnlocked, setQuizUnlocked] = useState(isDone || !!resource.watchUnlocked)
  const [watchedSecs, setWatchedSecs] = useState(0)
  function handleUnlock() {
    setQuizUnlocked(true)
    roadmapApi.unlockVideoWatch(roadmapId, nodeId, resource.id).catch(() => {})
  }
  function handleAssessmentPassed(resourceId) {
    onMarkLessonDone(resourceId)
  }

  const isYT = isYouTubeResource(resource)
  const isGH = isGitHubResource(resource)
  const videoId = getVideoId(resource)
  const isUnavailable = resource.url === 'yt:unavailable'

  // Unavailable YouTube resources auto-complete on open — there's no video to
  // watch and the UI now omits the "Mark as Visited" button. Component is keyed
  // by activeResource.id so this runs once per lesson selection.
  useEffect(() => {
    if (isYT && !videoId && !isDone) {
      onMarkLessonDone(resource.id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // YouTube with a resolvable video ID → YT IFrame player + gated quiz
  if (isYT && videoId) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
        <YouTubePlayer
          videoId={videoId}
          resourceId={resource.id}
          onWatchedEnough={handleUnlock}
          onTimeUpdate={(s) => setWatchedSecs(s)}
          onEnded={handleUnlock}
        />
        <div className="px-3 py-2 bg-gray-50">
          <p className="text-sm font-semibold text-brand-black leading-snug">{resource.title}</p>
          {resource.youtubeChannel && (
            <p className="text-xs text-brand-gray-mid mt-0.5">{resource.youtubeChannel}</p>
          )}
        </div>
        <div className="px-3 pb-3 bg-gray-50">
          {isDone ? (
            <div className="mt-2 rounded-xl border border-green-200 bg-green-50 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-sm text-green-700 font-semibold">Quiz passed — lesson complete!</span>
              </div>
            </div>
          ) : quizUnlocked ? (
            <VideoAssessment
              roadmapId={roadmapId}
              nodeId={nodeId}
              resource={resource}
              onAssessmentPassed={handleAssessmentPassed}
            />
          ) : (
            <div className="mt-2 rounded-lg bg-gray-100 border border-gray-200 px-3 py-3 space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-base">🔒</span>
                  <span className="text-sm text-gray-600 font-medium">Watch 5 minutes to unlock the quiz</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-brand-black">
                  {`${Math.floor(watchedSecs / 60)}:${String(Math.floor(watchedSecs % 60)).padStart(2, '0')}`}
                  <span className="text-xs font-normal text-gray-400"> / 5:00</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(watchedSecs / 300) * 100}%`,
                    background: watchedSecs >= 240
                      ? '#22c55e'  // green when close
                      : '#f59e0b', // amber otherwise
                  }}
                />
              </div>
              {/* Warning */}
              <p className="text-xs text-amber-600 font-medium">
                Heads up — leaving or switching lessons resets your timer back to 0:00.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // YouTube with no ID yet: spinner while fetching, search fallback after
  if (isYT && !videoId) {
    if (isFetching && !isUnavailable) {
      return (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-500 text-xs font-bold flex-shrink-0">
            YT
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-500 truncate">{resource.title}</p>
            <p className="text-xs text-gray-400">Finding video...</p>
          </div>
          <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        </div>
      )
    }
    return (
      <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-400 text-xs font-bold flex-shrink-0">
          YT
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-500 truncate">{resource.title}</p>
          <p className="text-xs text-gray-400">Video unavailable</p>
        </div>
      </div>
    )
  }

  // GitHub → external link card + Mark as Visited
  if (isGH) {
    return (
      <div className="mt-3 space-y-2">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-yellow hover:bg-yellow-50 transition-all group"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-900 text-white text-xs font-bold flex-shrink-0">
            GH
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-black truncate group-hover:text-brand-yellow">
              {resource.title}
            </p>
            <p className="text-xs text-brand-gray-mid">GitHub Repository</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        {!isDone && (
          <button
            onClick={() => onMarkLessonDone(resource.id)}
            className="w-full py-2 px-4 bg-green-600 text-white font-bold text-sm rounded-lg
                       hover:bg-green-700 active:scale-95 transition-all"
          >
            Mark as Visited ✓
          </button>
        )}
        {isDone && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
            <span className="text-green-600 font-bold">✓</span>
            <span className="text-sm text-green-700 font-semibold">Marked as visited</span>
          </div>
        )}
      </div>
    )
  }

  // Articles / Docs / Courses → open in modal + AI quiz required to mark complete
  const typeLabel = {
    article: 'Article',
    documentation: 'Documentation',
    course: 'Course',
    youtube_video: 'Video',
  }[resource.resourceType] || 'Resource'

  const typeBg = {
    article: 'bg-blue-100 text-blue-700',
    documentation: 'bg-purple-100 text-purple-700',
    course: 'bg-green-100 text-green-700',
  }[resource.resourceType] || 'bg-gray-100 text-gray-600'

  return (
    <div className="mt-3 space-y-2">
      {modalOpen && (
        <ResourceModal
          resource={resource}
          onClose={() => setModalOpen(false)}
        />
      )}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-yellow hover:bg-yellow-50 transition-all group text-left"
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${typeBg}`}>
          {typeLabel[0]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-black truncate group-hover:text-brand-yellow">
            {resource.title}
          </p>
          <p className="text-xs text-brand-gray-mid">{typeLabel} · Open to Read</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {isDone ? (
        <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-green-600 font-bold">✓</span>
            <span className="text-sm text-green-700 font-semibold">Quiz passed — lesson complete!</span>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-brand-gray-mid px-1">
            Read the {typeLabel.toLowerCase()} above, then pass the quiz to complete this lesson.
          </p>
          <VideoAssessment
            roadmapId={roadmapId}
            nodeId={nodeId}
            resource={resource}
            onAssessmentPassed={handleAssessmentPassed}
          />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NodeCard
// ---------------------------------------------------------------------------

function NodeCard({ node, roadmapId, onUpdateStatus, displayNum, prerequisiteTitle, phaseStats, onMountRef, onNodeCompleted, roadmapTitle, careerPath }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(() => node.status === 'in_progress')
  const [updating, setUpdating] = useState(false)
  const [resources, setResources] = useState(node.resources || [])
  const [fetchingResources, setFetchingResources] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  // localStorage-backed state
  const [activeIndex, setActiveIndex] = useState(() => readActiveIndex(node.id))
  const [doneIds, setDoneIds] = useState(() => readDoneIds(node.id))

  const isLocked = node.status === 'locked'
  const isAvailable = node.status === 'available'
  const isInProgress = node.status === 'in_progress'
  const isCompleted = node.status === 'completed'
  const isMilestone = node.nodeType === 'milestone'

  const hasYouTubePending = resources.some(
    (r) => isYouTubeResource(r) && r.url !== 'yt:unavailable' && (
      !getVideoId(r) || titleIsLowQuality(r.title)
    )
  )

  // All lessons done = every resource ID is in doneIds
  const allLessonsDone = resources.length > 0 && resources.every((r) => doneIds.has(r.id))

  // Persist doneIds whenever they change
  const markLessonDone = useCallback((resourceId) => {
    setDoneIds((prev) => {
      const next = new Set([...prev, resourceId])
      writeDoneIds(node.id, next)
      return next
    })
    // Auto-advance to next undone lesson
    setActiveIndex((prevActive) => {
      const currentResources = resources
      const nextIdx = currentResources.findIndex(
        (r, i) => i > prevActive && !doneIds.has(r.id) && r.id !== resourceId
      )
      const newIdx = nextIdx !== -1 ? nextIdx : prevActive
      writeActiveIndex(node.id, newIdx)
      return newIdx
    })
  }, [node.id, resources, doneIds])

  async function fetchResourcesIfNeeded() {
    if (hasYouTubePending && !fetchAttempted) {
      setFetchingResources(true)
      try {
        const { data } = await roadmapApi.fetchResources(roadmapId, node.id)
        setResources(data)
      } catch {
        // Keep existing resources on failure
      } finally {
        setFetchingResources(false)
        setFetchAttempted(true)
      }
    }
  }

  async function handleExpand() {
    if (isLocked) return

    // Final Assessment: single-click launches the quiz page in 'final' mode.
    // No expansion, no resources fetching — the quiz is generated server-side.
    if (node.nodeType === 'final_assessment') {
      navigate('/app/quiz', {
        state: {
          mode: 'final',
          roadmapId,
          roadmapTitle: roadmapTitle ?? '',
          careerPath:   careerPath  ?? '',
        }
      })
      return
    }

    if (isAvailable) {
      // Auto-start: transition to in_progress AND expand in one click
      setExpanded(true)
      setUpdating(true)
      try {
        await onUpdateStatus(roadmapId, node.id, 'in_progress')
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Action failed.'
        toast.error(msg)
      } finally {
        setUpdating(false)
      }
      await fetchResourcesIfNeeded()
      return
    }

    // in_progress or completed: toggle expand/collapse
    const nextExpanded = !expanded
    setExpanded(nextExpanded)
    if (nextExpanded) {
      await fetchResourcesIfNeeded()
    }
  }

  async function handleMarkComplete() {
    setUpdating(true)
    try {
      const result = await onUpdateStatus(roadmapId, node.id, 'completed')
      if (result) {
        fireConfetti()
        onNodeCompleted?.(result.newlyUnlocked)
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Action failed.'
      toast.error(msg)
    } finally {
      setUpdating(false)
    }
  }

  function handleSelectLesson(idx) {
    setActiveIndex(idx)
    writeActiveIndex(node.id, idx)
  }

  // Milestone nodes use a special header style
  if (isMilestone) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gray-200" />
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap ${
            isCompleted
              ? 'bg-brand-black text-brand-yellow'
              : isInProgress
              ? 'bg-brand-yellow text-brand-black'
              : isAvailable
              ? 'bg-brand-yellow text-brand-black'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {isCompleted ? '✓ ' : ''}{node.title}
          {phaseStats && phaseStats.total > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal opacity-80">
              {phaseStats.completed}/{phaseStats.total} done
            </span>
          )}
          {node.xpReward > 0 && !isCompleted && (
            <span className="ml-2 opacity-70">+{node.xpReward} XP</span>
          )}
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )
  }

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, resources.length - 1))
  const activeResource = resources[safeActiveIndex] || null

  return (
    <div
      ref={onMountRef}
      className={`rounded-xl border-2 transition-all ${
        isCompleted
          ? 'border-brand-yellow bg-yellow-50'
          : isInProgress
          ? 'border-brand-yellow bg-white shadow-sm'
          : isAvailable
          ? 'border-gray-200 bg-white hover:border-brand-yellow hover:shadow-sm'
          : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
      {/* Card header — always visible */}
      <button
        className="w-full text-left p-4 flex items-center gap-3"
        onClick={handleExpand}
        disabled={isLocked}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            isCompleted
              ? 'bg-brand-black text-brand-yellow'
              : isInProgress
              ? 'bg-brand-yellow text-brand-black'
              : isLocked
              ? 'bg-gray-200 text-gray-400'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : isLocked ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <span>{displayNum}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold truncate ${isLocked ? 'text-gray-400' : 'text-brand-black'}`}>
              {node.title}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0 ${
              node.nodeType === 'project' ? 'bg-blue-100 text-blue-700'
              : node.nodeType === 'certification' ? 'bg-purple-100 text-purple-700'
              : node.nodeType === 'final_assessment' ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
            }`}>
              {NODE_TYPE_LABEL[node.nodeType] || node.nodeType}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-brand-gray-mid">{node.estimatedHours}h</span>
            {node.difficulty > 0 && <DifficultyDots level={node.difficulty} />}
            <span className={`text-xs font-semibold ${isCompleted ? 'text-brand-black' : 'text-brand-yellow'}`}>
              +{node.xpReward} XP
            </span>
          </div>
          {isLocked && prerequisiteTitle && (
            <p className="text-xs text-gray-400 mt-1">
              Complete <span className="font-semibold text-gray-500">"{prerequisiteTitle}"</span> to unlock
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isCompleted ? 'bg-brand-black text-brand-yellow'
            : isInProgress ? 'bg-brand-yellow text-brand-black'
            : isAvailable ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-400'
          }`}>
            {isInProgress ? 'In Progress' : isCompleted ? 'Done' : isAvailable ? 'Available' : 'Locked'}
          </span>
          {!isLocked && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && !isLocked && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {/* Node description */}
          <p className="text-sm text-gray-700 leading-relaxed">{node.description}</p>

          {/* Curriculum list */}
          {(resources.length > 0 || fetchingResources) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-brand-gray-mid uppercase tracking-wide">
                  Curriculum
                </p>
                {resources.length > 0 && (
                  <span className="text-xs text-brand-gray-mid">
                    {resources.filter((r) => doneIds.has(r.id)).length}/{resources.length} done
                  </span>
                )}
              </div>

              {/* Lesson progress bar */}
              {resources.length > 0 && (
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-brand-yellow rounded-full transition-all duration-500"
                    style={{
                      width: `${(resources.filter((r) => doneIds.has(r.id)).length / resources.length) * 100}%`,
                    }}
                  />
                </div>
              )}

              {/* Loading indicator while fetching */}
              {fetchingResources && (
                <div className="flex items-center gap-2 py-1 mb-2 text-sm text-brand-gray-mid">
                  <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  Finding videos...
                </div>
              )}

              <div className="space-y-1.5">
                {resources.map((res, idx) => (
                  <CurriculumRow
                    key={res.id}
                    resource={res}
                    index={idx}
                    isActive={idx === safeActiveIndex}
                    isDone={doneIds.has(res.id)}
                    isFetching={fetchingResources}
                    onClick={() => handleSelectLesson(idx)}
                  />
                ))}
              </div>

              {/* Active lesson content — shown below the curriculum list */}
              {activeResource && (
                <ActiveLessonContent
                  key={activeResource.id}
                  resource={activeResource}
                  isFetching={fetchingResources}
                  fetchAttempted={fetchAttempted}
                  roadmapId={roadmapId}
                  nodeId={node.id}
                  isDone={doneIds.has(activeResource.id)}
                  onMarkLessonDone={markLessonDone}
                />
              )}
            </div>
          )}

          {/* Completed date */}
          {isCompleted && node.completedAt && (
            <p className="text-xs text-green-600 font-medium">
              Completed {new Date(node.completedAt).toLocaleDateString('en-PH', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
          )}

          {/* Mark Complete button — only when all lessons done and node is in_progress */}
          {isInProgress && (
            <div className="space-y-2 pt-1">
              <button
                onClick={handleMarkComplete}
                disabled={updating || fetchingResources || !allLessonsDone}
                className="px-4 py-2 bg-brand-black text-brand-yellow font-bold text-sm rounded-lg
                           hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : fetchingResources ? 'Loading resources...' : 'Mark Complete'}
              </button>
              {resources.length > 0 && !allLessonsDone && (
                <p className="text-xs text-brand-gray-mid">
                  Complete all lessons to mark this node done
                  ({doneIds.size}/{resources.length} done).
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// RoadmapPage
// ---------------------------------------------------------------------------

export default function RoadmapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    roadmaps,
    currentRoadmap,
    fetchRoadmaps,
    fetchRoadmap,
    generateRoadmap,
    updateNodeStatus,
    isLoading,
    isGenerating,
  } = useRoadmapStore()

  const { profile: gamProfile, fetchProfile } = useGamificationStore()

  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null)
  const [isRepairing, setIsRepairing] = useState(false)
  const [nextUpNode, setNextUpNode] = useState(null)

  // When QuizPage navigates back after a passing Final Assessment, refetch the
  // roadmap so cert nodes appear unlocked and the final_assessment node is marked complete.
  useEffect(() => {
    if (location.state?.finalAssessmentPassed && currentRoadmap?.id) {
      fetchRoadmap(currentRoadmap.id)
      toast.success('Final Assessment passed! Certifications unlocked.')
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state?.finalAssessmentPassed, currentRoadmap?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to active node on page load
  const nodeRefs = useRef({})
  const hasScrolled = useRef(false)

  async function handleRepair() {
    if (!currentRoadmap) return
    setIsRepairing(true)
    try {
      await roadmapApi.repair(currentRoadmap.id)
      await fetchRoadmap(currentRoadmap.id)
      toast.success('Roadmap repaired! Your first node is now unlocked.')
    } catch {
      toast.error('Repair failed.')
    } finally {
      setIsRepairing(false)
    }
  }

  useEffect(() => {
    fetchRoadmaps()
    fetchProfile()
  }, [fetchRoadmaps, fetchProfile])

  useEffect(() => {
    if (roadmaps.length > 0 && !selectedRoadmapId) {
      const primary = roadmaps.find((r) => r.isPrimary) || roadmaps[0]
      setSelectedRoadmapId(primary.id)
      hasScrolled.current = false
      fetchRoadmap(primary.id)
    }
  }, [roadmaps, selectedRoadmapId, fetchRoadmap])

  // Auto-scroll to first in_progress (or available) node once per roadmap load
  useEffect(() => {
    if (!currentRoadmap || isLoading || hasScrolled.current) return
    const target =
      currentRoadmap.nodes?.find((n) => n.status === 'in_progress') ||
      currentRoadmap.nodes?.find((n) => n.status === 'available')
    if (!target) return
    const el = nodeRefs.current[target.id]
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
      hasScrolled.current = true
    }
  }, [currentRoadmap, isLoading])

  // Auto-fix wrong phase structure (projects after certifications)
  useEffect(() => {
    if (!currentRoadmap || isLoading) return
    if (hasWrongStructure(currentRoadmap.nodes ?? [])) {
      roadmapApi.fixStructure(currentRoadmap.id)
        .then(() => fetchRoadmap(currentRoadmap.id))
    }
  }, [currentRoadmap?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss "Next Up" banner after 6 seconds
  useEffect(() => {
    if (!nextUpNode) return
    const t = setTimeout(() => setNextUpNode(null), 6000)
    return () => clearTimeout(t)
  }, [nextUpNode])

  if (isLoading && !currentRoadmap) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-black mb-2">No Roadmap Yet</h2>
        <p className="text-brand-gray-mid mb-6 max-w-md">
          Complete the onboarding quiz to generate your personalized AI learning roadmap.
        </p>
        <button
          onClick={generateRoadmap}
          disabled={isGenerating}
          className="bg-brand-yellow text-brand-black font-bold px-8 py-3 rounded-lg
                     hover:bg-brand-yellow-dark active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? 'Generating your roadmap...' : 'Generate My Roadmap'}
        </button>
      </div>
    )
  }

  // Exclude milestone and final_assessment from user-facing counts.
  // final_assessment is a gate node, not a regular learnable node — if it were
  // counted, adding it to a roadmap would lower existing users' completion %.
  const _isCountableNode = (n) => n.nodeType !== 'milestone' && n.nodeType !== 'final_assessment'

  const completionPct = parseFloat(currentRoadmap?.completionPercentage || 0)
  const completedCount = currentRoadmap?.nodes?.filter(
    (n) => n.status === 'completed' && _isCountableNode(n)
  ).length || 0
  const totalCount = currentRoadmap?.nodes?.filter(_isCountableNode).length || 0
  const allLocked = currentRoadmap?.nodes?.length > 0 &&
    currentRoadmap.nodes.every((n) => n.status === 'locked' || n.nodeType === 'milestone')

  const streakCount = gamProfile?.streakCount ?? 0
  const remainingHours = currentRoadmap?.nodes
    ?.filter((n) => n.status !== 'completed' && _isCountableNode(n))
    .reduce((sum, n) => sum + (n.estimatedHours || 0), 0) ?? 0

  // Build phase stats map: for each milestone, count done vs total nodes in its phase
  const phaseStats = {}
  if (currentRoadmap?.nodes) {
    let phaseNodes = []
    for (let i = currentRoadmap.nodes.length - 1; i >= 0; i--) {
      const n = currentRoadmap.nodes[i]
      if (n.nodeType === 'milestone') {
        phaseStats[n.id] = {
          total: phaseNodes.length,
          completed: phaseNodes.filter((pn) => pn.status === 'completed').length,
        }
        phaseNodes = []
      } else {
        phaseNodes.unshift(n)
      }
    }
  }

  // Precompute per-node display data (displayNum + prereq) from the original flat order.
  // Required because the render loop groups by type, losing the original idx.
  const nodeDisplayData = {}
  if (currentRoadmap?.nodes) {
    let skillNum = 0
    currentRoadmap.nodes.forEach((node, idx) => {
      if (node.nodeType !== 'milestone') skillNum++

      let prereq = null
      if (node.status === 'locked') {
        if (node.nodeType === 'certification') {
          // Certifications unlock based on the last node of the PREVIOUS phase,
          // so all certs in a phase become available at once rather than chaining.
          const prevNodes = currentRoadmap.nodes.slice(0, idx)
          const reversedPrev = [...prevNodes].reverse()
          const msFromEnd = reversedPrev.findIndex((n) => n.nodeType === 'milestone')
          const nodesBeforePhase = msFromEnd >= 0
            ? prevNodes.slice(0, prevNodes.length - 1 - msFromEnd)
            : prevNodes
          prereq = nodesBeforePhase.filter((n) => n.nodeType !== 'milestone').at(-1) ?? null
        } else {
          prereq = currentRoadmap.nodes.slice(0, idx).filter((n) => n.nodeType !== 'milestone').at(-1) ?? null
        }
      }

      nodeDisplayData[node.id] = {
        displayNum: node.nodeType !== 'milestone' ? skillNum : null,
        prereq,
      }
    })
  }

  // Does this roadmap include the new Final Assessment node? That controls whether
  // certifications pull out to a global trailing section vs. remain inline per-phase
  // (legacy roadmaps have certs under a Phase 4 milestone and should still render that way).
  const hasFinalAssessment = !!currentRoadmap?.nodes?.some((n) => n.nodeType === 'final_assessment')

  // Group nodes into phases for sub-section rendering. When the roadmap has a
  // final_assessment, final_assessment + certification nodes are collected into
  // trailingSections instead of being pushed into a phase group.
  const phaseGroups = []
  const trailingSections = { final_assessment: [], certification: [] }
  if (currentRoadmap?.nodes) {
    let currentGroup = { milestone: null, nodes: [] }
    for (const node of currentRoadmap.nodes) {
      if (node.nodeType === 'milestone') {
        phaseGroups.push(currentGroup)
        currentGroup = { milestone: node, nodes: [] }
      } else if (hasFinalAssessment && (node.nodeType === 'final_assessment' || node.nodeType === 'certification')) {
        trailingSections[node.nodeType].push(node)
      } else {
        currentGroup.nodes.push(node)
      }
    }
    phaseGroups.push(currentGroup)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">
              {currentRoadmap?.title || 'My Roadmap'}
            </h1>
            <p className="text-brand-gray-mid text-sm mt-0.5">
              {currentRoadmap?.estimatedWeeks || 0} weeks estimated &middot; {currentRoadmap?.careerPath || ''}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide flex-shrink-0 ${
            currentRoadmap?.status === 'completed'
              ? 'bg-brand-black text-brand-yellow'
              : 'bg-brand-yellow text-brand-black'
          }`}>
            {currentRoadmap?.status || 'active'}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1 gap-2">
            <span className="font-semibold text-brand-black">{completionPct.toFixed(0)}% complete</span>
            <div className="flex items-center gap-3">
              {formatRemainingHours(remainingHours) && (
                <span className="text-xs text-brand-gray-mid">{formatRemainingHours(remainingHours)}</span>
              )}
              {streakCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                  🔥 {streakCount} day streak
                </span>
              )}
              <span className="text-brand-gray-mid">{completedCount} / {totalCount} nodes</span>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-yellow rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Up banner — briefly shown after completing a node */}
      {nextUpNode && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-base">🔓</span>
            <p className="text-sm font-semibold text-green-800">
              <span className="font-bold">"{nextUpNode.title}"</span> is now unlocked!
            </p>
          </div>
          <button
            onClick={() => setNextUpNode(null)}
            className="text-green-500 hover:text-green-700 text-xl leading-none flex-shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Repair banner */}
      {allLocked && !isLoading && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-yellow-50 border border-brand-yellow rounded-xl px-4 py-3">
          <p className="text-sm text-brand-black font-medium">
            All nodes are locked — click Repair to unlock your first step.
          </p>
          <button
            onClick={handleRepair}
            disabled={isRepairing}
            className="px-3 py-1.5 bg-brand-yellow text-brand-black font-bold text-sm rounded-lg
                       hover:bg-brand-yellow-dark active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
          >
            {isRepairing ? 'Repairing...' : 'Repair'}
          </button>
        </div>
      )}

      {/* Node list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentRoadmap?.nodes?.length > 0 ? (
        <div className="space-y-2">
          {phaseGroups.map((group, gIdx) => {
            const regularNodes = group.nodes.filter((n) => !SUB_SECTION_TYPE_SET.has(n.nodeType))
            const subSections = SUB_SECTION_TYPES
              .map(({ type, label }) => ({
                label,
                nodes: group.nodes.filter((n) => n.nodeType === type),
              }))
              .filter(({ nodes }) => nodes.length > 0)

            const renderNode = (node) => {
              const { displayNum, prereq } = nodeDisplayData[node.id] ?? {}
              return (
                <NodeCard
                  key={node.id}
                  node={node}
                  displayNum={displayNum ?? null}
                  roadmapId={currentRoadmap.id}
                  onUpdateStatus={updateNodeStatus}
                  prerequisiteTitle={prereq?.title ?? null}
                  phaseStats={node.nodeType === 'milestone' ? phaseStats[node.id] : null}
                  onMountRef={(el) => { nodeRefs.current[node.id] = el }}
                  onNodeCompleted={(newlyUnlocked) => {
                    if (newlyUnlocked?.length > 0) setNextUpNode(newlyUnlocked[0])
                  }}
                />
              )
            }

            return (
              <div key={gIdx}>
                {group.milestone && renderNode(group.milestone)}
                {regularNodes.map(renderNode)}
                {subSections.map(({ label, nodes }, sIdx) => (
                  <div key={label}>
                    {(sIdx > 0 || regularNodes.length > 0) && <SubSectionDivider label={label} />}
                    {nodes.map(renderNode)}
                  </div>
                ))}
              </div>
            )
          })}
          {GLOBAL_TRAILING_SECTIONS.map(({ type, label }) => {
            const nodes = trailingSections[type]
            if (!nodes || nodes.length === 0) return null
            const total = nodes.length
            const done = nodes.filter((n) => n.status === 'completed').length
            const xpRemaining = nodes
              .filter((n) => n.status !== 'completed')
              .reduce((sum, n) => sum + (n.xpReward || 0), 0)
            const completed = done === total && total > 0
            const renderTrailingNode = (node) => {
              const { displayNum, prereq } = nodeDisplayData[node.id] ?? {}
              return (
                <NodeCard
                  key={node.id}
                  node={node}
                  displayNum={displayNum ?? null}
                  roadmapId={currentRoadmap.id}
                  onUpdateStatus={updateNodeStatus}
                  prerequisiteTitle={prereq?.title ?? null}
                  phaseStats={null}
                  onMountRef={(el) => { nodeRefs.current[node.id] = el }}
                  onNodeCompleted={(newlyUnlocked) => {
                    if (newlyUnlocked?.length > 0) setNextUpNode(newlyUnlocked[0])
                  }}
                  roadmapTitle={type === 'final_assessment' ? (currentRoadmap.title ?? '') : undefined}
                  careerPath={type === 'final_assessment' ? (currentRoadmap.careerPath ?? '') : undefined}
                />
              )
            }
            return (
              <div key={type}>
                <PhaseHeader
                  label={label}
                  completed={completed}
                  total={total}
                  done={done}
                  xpRemaining={xpRemaining}
                />
                {nodes.map(renderTrailingNode)}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-brand-gray-mid">
          No nodes found.
        </div>
      )}
    </div>
  )
}
