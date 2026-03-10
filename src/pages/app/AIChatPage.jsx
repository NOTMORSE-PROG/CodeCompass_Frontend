/**
 * AI Chat page — real-time conversation with CodeCompass AI.
 * Features: personalized context, markdown rendering, chat history sidebar, dynamic modes.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  PaperAirplaneIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import useChatStore from '../../stores/chatStore'
import useAuthStore from '../../stores/authStore'
import useRoadmapStore from '../../stores/roadmapStore'

// ---------------------------------------------------------------------------
// Chat modes — visibility is data-driven
// ---------------------------------------------------------------------------
const ALL_MODES = [
  { key: 'general',    label: 'General',    icon: '💬', contextType: 'general' },
  { key: 'roadmap',    label: 'Roadmap',    icon: '🗺️', contextType: 'roadmap' },
  { key: 'job',        label: 'Jobs',       icon: '💼', contextType: 'job' },
  { key: 'university', label: 'University', icon: '🏫', contextType: 'university' },
]

const MODE_ICONS = Object.fromEntries(ALL_MODES.map((m) => [m.contextType, m.icon]))

// ---------------------------------------------------------------------------
// Dynamic suggested prompts — built from real user data
// ---------------------------------------------------------------------------
function getDynamicPrompts(modeKey, user, roadmap, summary) {
  const goal = summary?.career_goal || summary?.careerGoal || user?.targetCareer || null
  const path = summary?.recommended_path || summary?.recommendedPath || null
  const program = summary?.program || user?.program || null
  const year = summary?.year_level || user?.yearLevel || null
  const interests = summary?.interests
  const interest1 = Array.isArray(interests) && interests.length > 0 ? interests[0] : 'web development'
  const roadmapTitle = roadmap?.title || 'your roadmap'
  const _roadmapPct = roadmap?.completionPercentage ?? 0
  const currentNode = roadmap?.nodes?.find((n) => n.status === 'in_progress' || n.status === 'inProgress')?.title || null

  switch (modeKey) {
    case 'general':
      return [
        goal ? `How do I become a ${goal}?` : 'What IT career path fits me best?',
        year && program ? `What skills should a ${year} ${program} student focus on?`
          : program ? `What skills should a ${program} student prioritize?`
          : 'What should I learn first as a CCS student?',
        path ? `What free certifications match a ${path} path?` : 'What free certifications should I get?',
        goal ? `What's the job market like for ${goal}s in the Philippines?`
          : "What's the tech job market like in the Philippines?",
      ]
    case 'roadmap':
      return [
        currentNode ? `What should I focus on after finishing "${currentNode}"?`
          : `What should I work on next in ${roadmapTitle}?`,
        currentNode ? `Explain why "${currentNode}" is important for my career`
          : 'Explain the structure of my roadmap',
        currentNode ? `I'm stuck on "${currentNode}" — how do I approach it?`
          : 'How do I stay consistent and avoid burnout on my roadmap?',
        `How long will it take to complete ${roadmapTitle}?`,
      ]
    case 'job':
      return [
        goal ? `What companies in the Philippines hire ${goal}s?` : 'What are the top tech companies in the Philippines?',
        goal ? `What's the salary range for a ${goal} in the Philippines?` : 'What is a fresh grad IT salary in the Philippines?',
        program ? `How do I write a strong resume as a ${program} fresh grad?` : 'How do I write a strong tech resume?',
        'How do I find IT internships or OJT in the Philippines?',
      ]
    case 'university':
      return [
        'What are the top CHED CoE schools for CCS in the Philippines?',
        `Compare BSCS vs BSIT for someone interested in ${interest1}`,
        'What scholarships are available for CCS students in the Philippines?',
        'What are the entrance exam tips for top PH universities?',
      ]
    default:
      return []
  }
}

function getModeWelcome(modeKey, user, roadmap, _summary) {
  const firstName = user?.fullName?.split(' ')[0] || null
  const roadmapTitle = roadmap?.title || null
  const roadmapPct = roadmap?.completionPercentage ?? 0

  switch (modeKey) {
    case 'general':
      return firstName
        ? `Hi **${firstName}**! I'm CodeCompass AI, your personal career mentor. What would you like to talk about today?`
        : "Hi! I'm **CodeCompass AI**, your career mentor for CCS students in the Philippines. What would you like to talk about?"
    case 'roadmap':
      return roadmapTitle
        ? `Let's talk about your **${roadmapTitle}** progress! You're **${roadmapPct}%** done. What do you need help with?`
        : "Let's talk about your learning roadmap. Ask me anything about your path, skills, or progress."
    case 'job':
      return "Let's talk about **job hunting in the Philippines**! Ask me about salaries, top companies, resumes, or interview tips."
    case 'university':
      return "Let's find the right school for you! Ask about **universities, programs, scholarships**, or entrance exams."
    default:
      return 'Hi! How can I help you today?'
  }
}

// ---------------------------------------------------------------------------
// Markdown message renderer
// ---------------------------------------------------------------------------
function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const lang = /language-(\w+)/.exec(className || '')?.[1]
          return !inline && lang ? (
            <SyntaxHighlighter
              style={oneDark}
              language={lang}
              PreTag="div"
              className="rounded-lg text-xs my-2 overflow-x-auto"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono" {...props}>
              {children}
            </code>
          )
        },
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 pl-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
             className="text-amber-600 underline hover:no-underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ---------------------------------------------------------------------------
// Sidebar helpers
// ---------------------------------------------------------------------------
function relativeDay(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function groupSessions(sessions) {
  const groups = {}
  for (const s of sessions) {
    const label = relativeDay(s.updatedAt || s.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(s)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AIChatPage() {
  const { user } = useAuthStore()
  const { roadmaps, fetchRoadmaps } = useRoadmapStore()
  const {
    sessions, messages, streamingContent, isStreaming,
    fetchSessions, createSession, selectSession, sendMessage,
    disconnectWebSocket, deleteSession,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMode, setActiveMode] = useState('general')
  const [deletingId, setDeletingId] = useState(null)
  const messagesEndRef = useRef(null)
  const initialized = useRef(false)
  const currentSessionId = useChatStore((s) => s.currentSession?.sessionId)

  // Pull onboarding summary from sessionStorage if available
  const onboardingSummary = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('onboarding_summary') || 'null') }
    catch { return null }
  }, [])

  const primaryRoadmap = roadmaps?.[0] || null

  // Modes visible to this user based on their data
  const visibleModes = useMemo(() => ALL_MODES.filter((m) => {
    if (m.key === 'roadmap') return roadmaps.length > 0
    if (m.key === 'university') return user?.role === 'incoming_student'
    return true
  }), [roadmaps, user?.role])

  // Keep activeMode valid when visibility changes
  useEffect(() => {
    if (!visibleModes.find((m) => m.key === activeMode)) setActiveMode('general')
  }, [visibleModes]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mount: fetch data + start a fresh session
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    fetchSessions()
    fetchRoadmaps()
    createSession('general').then((session) => {
      if (session) selectSession(session.sessionId)
    })
    return () => { disconnectWebSocket() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleModeSwitch = async (modeKey) => {
    if (modeKey === activeMode) return
    setActiveMode(modeKey)
    const mode = ALL_MODES.find((m) => m.key === modeKey)
    disconnectWebSocket()
    const session = await createSession(mode.contextType)
    if (session) {
      await fetchSessions()
      selectSession(session.sessionId)
    }
  }

  const handleNewChat = async () => {
    const mode = ALL_MODES.find((m) => m.key === activeMode)
    disconnectWebSocket()
    const session = await createSession(mode?.contextType || 'general')
    if (session) {
      await fetchSessions()
      selectSession(session.sessionId)
    }
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    setDeletingId(sessionId)
    await deleteSession(sessionId)
    setDeletingId(null)
    if (sessionId === currentSessionId) {
      const mode = ALL_MODES.find((m) => m.key === activeMode)
      const session = await createSession(mode?.contextType || 'general')
      if (session) selectSession(session.sessionId)
    }
  }

  const handleSelectSession = (session) => {
    const mode = ALL_MODES.find((m) => m.contextType === session.contextType)
    if (mode && visibleModes.find((m) => m.key === mode.key)) setActiveMode(mode.key)
    selectSession(session.sessionId)
  }

  const dynamicPrompts = getDynamicPrompts(activeMode, user, primaryRoadmap, onboardingSummary)
  const welcomeText = getModeWelcome(activeMode, user, primaryRoadmap, onboardingSummary)
  const showWelcome = messages.length === 0 && !isStreaming
  const sessionGroups = useMemo(() => groupSessions(sessions), [sessions])

  return (
    <div className="flex h-full max-h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="w-52 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-gray-mid uppercase tracking-wide">Chats</span>
            <button onClick={() => setSidebarOpen(false)}
              className="text-brand-gray-mid hover:text-brand-black p-0.5 rounded">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {Object.keys(sessionGroups).length === 0 ? (
              <p className="text-xs text-brand-gray-mid text-center py-6 px-3">No previous chats yet</p>
            ) : (
              Object.entries(sessionGroups).map(([label, group]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-brand-gray-mid uppercase tracking-wide px-3 pt-3 pb-1">
                    {label}
                  </p>
                  {group.map((session) => {
                    const isActive = session.sessionId === currentSessionId
                    return (
                      <button
                        key={session.sessionId}
                        onClick={() => handleSelectSession(session)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 group transition-colors
                          ${isActive
                            ? 'bg-brand-yellow/20 text-brand-black'
                            : 'hover:bg-gray-100 text-brand-gray-mid'}`}
                      >
                        <span className="text-sm flex-shrink-0">{MODE_ICONS[session.contextType] || '💬'}</span>
                        <span className="text-xs truncate flex-1 min-w-0">
                          {session.title || 'New Chat'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSession(e, session.sessionId)}
                          disabled={deletingId === session.sessionId}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600
                                     transition-opacity flex-shrink-0 disabled:opacity-30"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              className="text-brand-gray-mid hover:text-brand-black flex-shrink-0">
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-brand-black leading-tight">CodeCompass AI</h1>
            <p className="text-brand-gray-mid text-xs">Your personal career mentor</p>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                       bg-brand-yellow text-brand-black font-medium hover:bg-brand-yellow-dark
                       transition-colors flex-shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-4 flex gap-1 border-b border-gray-200 overflow-x-auto">
          {visibleModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => handleModeSwitch(mode.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap
                          transition-colors border-b-2 -mb-px
                          ${activeMode === mode.key
                            ? 'border-brand-yellow text-brand-black'
                            : 'border-transparent text-brand-gray-mid hover:text-brand-black hover:bg-gray-50'}`}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Welcome state */}
          {showWelcome && (
            <div className="flex flex-col items-center py-4 max-w-lg mx-auto w-full">
              <div className="text-3xl mb-3">{ALL_MODES.find((m) => m.key === activeMode)?.icon || '🤖'}</div>
              <div className="text-sm text-brand-black text-center mb-5 font-medium leading-relaxed">
                <MarkdownMessage content={welcomeText} />
              </div>
              <div className="w-full space-y-2">
                {dynamicPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { sendMessage(prompt) }}
                    className="w-full text-left px-4 py-2.5 rounded-lg border border-brand-yellow/30
                               bg-brand-yellow-pale text-brand-black text-sm
                               hover:bg-brand-yellow hover:border-brand-yellow transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-brand-black font-bold text-xs">AI</span>
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-brand-yellow text-brand-black rounded-br-sm'
                  : 'bg-gray-100 text-brand-black rounded-bl-sm'}`}
              >
                {msg.role === 'assistant' ? <MarkdownMessage content={msg.content} /> : msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-brand-black flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                  <span className="text-brand-yellow font-bold text-xs">
                    {user?.fullName?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Streaming */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-brand-black font-bold text-xs">AI</span>
              </div>
              <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-brand-black text-sm leading-relaxed">
                {streamingContent ? (
                  <>
                    <MarkdownMessage content={streamingContent} />
                    <span className="inline-block w-1.5 h-4 bg-brand-yellow ml-0.5 animate-pulse align-middle" />
                  </>
                ) : (
                  <span className="flex items-center gap-1 h-4">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 pt-2 border-t border-gray-100 flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask anything... (Enter to send)"
            rows={2}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-brand-black
                       placeholder:text-brand-gray-mid resize-none
                       focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent
                       disabled:opacity-50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-brand-yellow text-brand-black p-3 rounded-xl hover:bg-brand-yellow-dark
                       active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                       flex-shrink-0 self-end"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
