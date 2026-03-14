/**
 * AI Chat page — real-time conversation with CodeCompass AI.
 * Features: personalized context, markdown rendering, ChatGPT-like sidebar, dynamic modes.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  PaperAirplaneIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('csharp', csharp)
SyntaxHighlighter.registerLanguage('cpp', cpp)
import useChatStore from '../../stores/chatStore'
import useAuthStore from '../../stores/authStore'
import useRoadmapStore from '../../stores/roadmapStore'
import { onboardingApi } from '../../api/onboarding'

// ---------------------------------------------------------------------------
// Chat modes
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
  const currentNode = roadmap?.nodes?.find((n) => n.status === 'in_progress' || n.status === 'inProgress')?.title || null

  switch (modeKey) {
    case 'general':
      return [
        goal ? `How do I become a ${goal}?` : 'What IT career path fits me best?',
        year && program
          ? `What skills should a ${year} ${program} student focus on?`
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

function getModeWelcome(modeKey, user, roadmap) {
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
// ChatGPT-style date bucket grouping
// ---------------------------------------------------------------------------
function getDateBucket(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = startOfToday - new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays === 0) return { label: 'Today', order: 0 }
  if (diffDays === 1) return { label: 'Yesterday', order: 1 }
  if (diffDays <= 7) return { label: 'Previous 7 Days', order: 2 }
  if (diffDays <= 30) return { label: 'Previous 30 Days', order: 3 }
  // Older: group by "Month Year"
  const monthLabel = date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  return { label: monthLabel, order: 4 }
}

function groupSessions(sessions) {
  const buckets = {}    // label → { order, items[] }
  for (const s of sessions) {
    const { label, order } = getDateBucket(s.updatedAt || s.createdAt)
    if (!buckets[label]) buckets[label] = { order, items: [] }
    buckets[label].items.push(s)
  }
  // Sort bucket labels by order, then by date desc within each bucket
  return Object.entries(buckets)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([label, { items }]) => ({ label, items }))
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
// Sidebar session item with three-dot menu + inline rename
// ---------------------------------------------------------------------------
function SessionItem({ session, isActive, onSelect, onRename, onDelete, deletingId }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(session.title || '')
  const menuRef = useRef(null)
  const inputRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== session.title) onRename(session.sessionId, trimmed)
    setRenaming(false)
  }

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') { setRenameValue(session.title || ''); setRenaming(false) }
  }

  return (
    <div
      className={`relative group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
        ${isActive ? 'bg-brand-yellow/20 text-brand-black' : 'hover:bg-gray-100 text-brand-gray-mid'}`}
      onClick={() => !renaming && onSelect(session)}
    >
      <span className="text-sm flex-shrink-0">{MODE_ICONS[session.contextType] || '💬'}</span>

      {renaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleRenameKey}
          onBlur={commitRename}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 text-xs bg-white border border-brand-yellow rounded px-1.5 py-0.5
                     focus:outline-none focus:ring-1 focus:ring-brand-yellow text-brand-black"
        />
      ) : (
        <span className="text-xs truncate flex-1 min-w-0">
          {session.title || 'New Chat'}
        </span>
      )}

      {/* Three-dot menu button */}
      {!renaming && (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
            className={`p-0.5 rounded transition-opacity
              ${menuOpen ? 'opacity-100 text-brand-black' : 'opacity-0 group-hover:opacity-100 text-brand-gray-mid hover:text-brand-black'}`}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 text-xs">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenameValue(session.title || ''); setRenaming(true) }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-brand-black"
              >
                <PencilIcon className="w-3.5 h-3.5 text-brand-gray-mid" />
                Rename
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(session.sessionId) }}
                disabled={deletingId === session.sessionId}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 disabled:opacity-30"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
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
    disconnectWebSocket, deleteSession, renameSession,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMode, setActiveMode] = useState('general')
  const [deletingId, setDeletingId] = useState(null)
  const [onboardingSummary, setOnboardingSummary] = useState(null)
  const messagesEndRef = useRef(null)
  const initialized = useRef(false)
  const currentSessionId = useChatStore((s) => s.currentSession?.sessionId)

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

  // Mount: fetch onboarding summary + sessions + roadmaps + start fresh session
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Fetch real onboarding summary from API
    onboardingApi.status().then(({ data }) => {
      if (data?.onboarding_summary) setOnboardingSummary(data.onboarding_summary)
    }).catch(() => {})

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

  const handleDeleteSession = useCallback(async (sessionId) => {
    setDeletingId(sessionId)
    await deleteSession(sessionId)
    setDeletingId(null)
    if (sessionId === currentSessionId) {
      const mode = ALL_MODES.find((m) => m.key === activeMode)
      const session = await createSession(mode?.contextType || 'general')
      if (session) selectSession(session.sessionId)
    }
  }, [currentSessionId, activeMode, deleteSession, createSession, selectSession])

  const handleRenameSession = useCallback((sessionId, title) => {
    renameSession(sessionId, title)
  }, [renameSession])

  const handleSelectSession = (session) => {
    const mode = ALL_MODES.find((m) => m.contextType === session.contextType)
    if (mode && visibleModes.find((m) => m.key === mode.key)) setActiveMode(mode.key)
    selectSession(session.sessionId)
  }

  const dynamicPrompts = getDynamicPrompts(activeMode, user, primaryRoadmap, onboardingSummary)
  const welcomeText = getModeWelcome(activeMode, user, primaryRoadmap)
  const showWelcome = messages.length === 0 && !isStreaming
  const sessionGroups = useMemo(() => groupSessions(sessions), [sessions])

  return (
    <div className="flex h-full max-h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white">

      {/* ── Sidebar — smooth CSS width transition ─────────────── */}
      <div
        className={`flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden
                    transition-[width] duration-200 ease-in-out
                    ${sidebarOpen ? 'w-56' : 'w-0 border-r-0'}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-semibold text-brand-gray-mid uppercase tracking-wide whitespace-nowrap">
            Chat History
          </span>
          <button
            onClick={handleNewChat}
            className="text-brand-gray-mid hover:text-brand-black p-0.5 rounded transition-colors flex-shrink-0"
            title="New chat"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-1">
          {sessionGroups.length === 0 ? (
            <p className="text-xs text-brand-gray-mid text-center py-6 px-3 whitespace-nowrap">
              No previous chats yet
            </p>
          ) : (
            sessionGroups.map(({ label, items }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-brand-gray-mid uppercase tracking-wide
                              px-3 pt-3 pb-1 whitespace-nowrap">
                  {label}
                </p>
                {items.map((session) => (
                  <SessionItem
                    key={session.sessionId}
                    session={session}
                    isActive={session.sessionId === currentSessionId}
                    onSelect={handleSelectSession}
                    onRename={handleRenameSession}
                    onDelete={handleDeleteSession}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-brand-gray-mid hover:text-brand-black flex-shrink-0 transition-colors"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
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
                    onClick={() => sendMessage(prompt)}
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

          {/* Message history */}
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

          {/* Streaming bubble */}
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
