/**
 * Chat-based onboarding page.
 * CodeCompass AI interviews the student conversationally to understand
 * their background, interests, and goals. When ready, a backend endpoint
 * extracts a structured profile from the chat and generates a roadmap.
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import useChatStore from '../../stores/chatStore'
import useRoadmapStore from '../../stores/roadmapStore'
import { onboardingApi } from '../../api/onboarding'
import toast from 'react-hot-toast'

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-black text-xs flex-shrink-0 mb-1">
          CC
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[78%] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-brand-yellow text-brand-black rounded-br-sm font-medium'
            : 'bg-white/10 text-white rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

// ─── Streaming bubble ─────────────────────────────────────────────────────────

// Strip the [SUGGESTIONS: ...] tag before displaying streaming content
function stripSuggestionsTag(text) {
  return text.replace(/\s*\[SUGGESTIONS:.*?\]/gi, '').trimEnd()
}

function StreamingBubble({ content }) {
  const displayContent = stripSuggestionsTag(content)
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-black text-xs flex-shrink-0 mb-1">
        CC
      </div>
      <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[78%]">
        {displayContent ? (
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <div className="flex gap-1.5 items-center py-1">
            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Completing screen ────────────────────────────────────────────────────────

function CompletingScreen({ step }) {
  const steps = [
    { label: 'Chat completed', done: step >= 1 },
    { label: 'Analyzing your answers...', done: step >= 2 },
    { label: 'Building your personalized roadmap...', done: step >= 3 },
  ]
  // index of the step currently in progress (first not-done step)
  const activeIndex = steps.findIndex(s => !s.done)

  return (
    <div className="min-h-screen bg-brand-black-soft flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-2xl bg-brand-yellow flex items-center justify-center text-brand-black font-black text-xl mx-auto mb-6 animate-pulse">
          CC
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Almost there!</h2>
        <p className="text-white/50 text-sm mb-8">Gawa na namin ang iyong roadmap...</p>
        <div className="space-y-4 text-left">
          {steps.map((s, i) => {
            const isActive = i === activeIndex
            return (
              <div key={i} className="flex items-center gap-3">
                {/* icon */}
                <div className="relative w-6 h-6 flex-shrink-0">
                  {s.done ? (
                    <div className="w-6 h-6 rounded-full bg-brand-yellow flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <>
                      {/* spinning ring */}
                      <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brand-yellow animate-spin" />
                    </>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  )}
                </div>
                {/* label */}
                <span
                  className={`text-sm transition-colors ${
                    s.done
                      ? 'text-white'
                      : isActive
                      ? 'text-white/80 animate-pulse'
                      : 'text-white/30'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setOnboarded, _saveSession } = useAuthStore()
  const {
    createSession,
    selectSession,
    sendMessage,
    messages,
    streamingContent,
    isStreaming,
    suggestions,
    disconnectWebSocket,
  } = useChatStore()
  const { generateRoadmap } = useRoadmapStore()

  const [sessionUUID, setSessionUUID] = useState(null)
  const [inputText, setInputText] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [completingStep, setCompletingStep] = useState(0)
  const [initError, setInitError] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  // Prevent React StrictMode double-mount from creating two sessions
  const initDoneRef = useRef(false)

  // Redirect already-onboarded users — skip if we're mid-completion (handleBuildRoadmap navigates itself)
  useEffect(() => {
    if (user?.isOnboarded && !isCompleting) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [user, isCompleting, navigate])

  // Create onboarding chat session on mount; server streams greeting on connect
  useEffect(() => {
    if (!user || user.isOnboarded || initDoneRef.current) return
    initDoneRef.current = true

    let mounted = true
    const init = async () => {
      try {
        const session = await createSession('onboarding')
        if (!session?.sessionId) {
          if (mounted) setInitError(true)
          return
        }
        // Always connect — don't abort on StrictMode cleanup (mounted=false is
        // only a dev-mode simulation; setSessionUUID + selectSession must run).
        setSessionUUID(session.sessionId)
        await selectSession(session.sessionId)
      } catch {
        if (mounted) setInitError(true)
      }
    }
    init()

    return () => {
      mounted = false
      disconnectWebSocket()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Refocus input after AI responds
  useEffect(() => {
    if (!isStreaming && sessionUUID) {
      inputRef.current?.focus()
    }
  }, [isStreaming, sessionUUID])

  // Auto-resize textarea as user types
  useEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [inputText])

  const handleSend = (text) => {
    const msg = (text ?? inputText).trim()
    if (!msg || isStreaming || !sessionUUID) return
    setInputText('')
    sendMessage(msg)
  }

  const handleChipClick = (option) => {
    if (isStreaming || !sessionUUID) return
    sendMessage(option)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()  // uses inputText
    }
  }

  const handleBuildRoadmap = async () => {
    if (!sessionUUID || isCompleting) return
    setIsCompleting(true)
    setCompletingStep(1)

    try {
      const { data: completionData } = await onboardingApi.completeFromChat(sessionUUID)
      // Store fresh tokens so localStorage JWT reflects is_onboarded=true
      if (completionData.access) {
        _saveSession({ access: completionData.access, refresh: completionData.refresh })
      } else {
        setOnboarded()
      }
      if (completionData.xpEarned) {
        toast.success(`+${completionData.xpEarned} XP! Onboarding complete!`)
      }
      setCompletingStep(2)

      await generateRoadmap()
      setCompletingStep(3)

      disconnectWebSocket()
      navigate('/app/roadmap', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
      setIsCompleting(false)
      setCompletingStep(0)
    }
  }

  // Show "Build My Roadmap" only when the AI explicitly signals it has enough info.
  // The ONBOARDING_SYSTEM_PROMPT instructs the AI to say a wrap-up phrase when done.
  const READY_SIGNALS = [
    // Taglish / Filipino phrases
    'ready na akong gumawa',
    'ready na ako gumawa',
    'gumawa ng roadmap para sa iyo',
    'ready na tayong gumawa',
    'ready na akong i-build',
    'sapat na ang impormasyon',
    'malinaw na ang iyong profile',
    // English phrases
    "i'm ready to build your roadmap",
    'ready to build your roadmap',
    'build your roadmap now',
    'have a good picture now',
    'have everything i need',
    'enough information',
  ]
  // Check if a signal phrase appears WITHOUT a preceding negation (e.g. "hindi pa ready na akong gumawa"
  // contains the signal but should NOT trigger the button).
  const NEGATIONS = ['hindi', 'not', "haven't", 'wala', 'di pa', 'hindi pa', 'wala pa']
  const containsSignal = (text, sig) => {
    const idx = text.indexOf(sig)
    if (idx === -1) return false
    const before = text.slice(Math.max(0, idx - 25), idx)
    return !NEGATIONS.some((neg) => before.includes(neg))
  }
  const aiSignaledReady = messages.some(
    (m) =>
      m.role === 'assistant' &&
      READY_SIGNALS.some((sig) => containsSignal(m.content.toLowerCase(), sig))
  )
  const showReadyButton = aiSignaledReady && !isCompleting && !isStreaming

  // Detect language from the first user message that is a language selection
  const detectedLang = (() => {
    const langMsg = messages.find(
      (m) => m.role === 'user' && /^(english|tagalog|taglish)$/i.test(m.content.trim())
    )
    const val = langMsg?.content.trim().toLowerCase()
    if (val === 'english') return 'english'
    if (val === 'tagalog') return 'tagalog'
    return 'taglish'
  })()

  const readyButtonText = {
    english: 'Your profile is ready! Tap the button below to generate your personalized roadmap.',
    tagalog: 'Handa na ang iyong profile! Pindutin ang button sa ibaba para gumawa ng iyong roadmap.',
    taglish: 'Handa ka na ba? Tap the button below para i-generate ang iyong personalized roadmap!',
  }[detectedLang]

  const readyButtonLabel = {
    english: 'Build My Roadmap →',
    tagalog: 'Gumawa ng Roadmap →',
    taglish: 'Build My Roadmap →',
  }[detectedLang]

  if (isCompleting) {
    return <CompletingScreen step={completingStep} />
  }

  return (
    <div className="min-h-screen bg-brand-black-soft flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center text-brand-black font-black text-sm flex-shrink-0">
            CC
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">CodeCompass</p>
            <p className="text-white/40 text-xs">Onboarding Guide</p>
          </div>
        </div>

        {/* spacer so header height is consistent */}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Init error */}
        {initError && (
          <div className="text-center py-20">
            <p className="text-white/50 mb-4">Could not connect to CodeCompass.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-brand-yellow text-brand-black rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Connecting indicator */}
        {!initError && messages.length === 0 && !isStreaming && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Connecting to CodeCompass...</p>
          </div>
        )}

        {/* Message history */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Live streaming bubble */}
        {isStreaming && <StreamingBubble content={streamingContent} />}

        {/* Build My Roadmap — pops up in chat after AI signals ready */}
        {showReadyButton && (
          <div className="flex gap-3 items-end">
            <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-black text-xs flex-shrink-0 mb-1">
              CC
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-4 max-w-[78%]">
              <p className="text-white text-sm mb-3">
                {readyButtonText}
              </p>
              <button
                onClick={handleBuildRoadmap}
                className="px-5 py-2.5 bg-brand-yellow text-brand-black rounded-xl font-bold text-sm
                           hover:bg-yellow-400 active:scale-95 transition-all w-full"
              >
                {readyButtonLabel}
              </button>
            </div>
          </div>
        )}

        {/* Quick-reply chips — appear below the last AI message, inline with chat */}
        {suggestions.length > 0 && !isStreaming && !aiSignaledReady && (
          <div className="pl-11 flex flex-wrap gap-2">
            {suggestions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(opt)}
                disabled={!sessionUUID}
                className="px-3 py-1.5 rounded-full border border-white/20 text-white/70
                           text-xs hover:border-white/50 hover:text-white hover:bg-white/10
                           active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/10 px-3 py-3 sm:px-4 sm:py-4 flex-shrink-0 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 sm:gap-3 items-end">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'CodeCompass is typing...' : 'Type your message...'}
            rows={1}
            disabled={isStreaming || !sessionUUID}
            className="flex-1 bg-white/10 text-white placeholder-white/25 rounded-xl px-3 py-3 sm:px-4 text-sm
                       resize-none focus:outline-none focus:ring-2 focus:ring-brand-yellow/40
                       disabled:opacity-40 transition-opacity"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isStreaming || !sessionUUID}
            className="w-11 h-11 rounded-xl bg-brand-yellow text-brand-black flex items-center justify-center
                       font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-400
                       active:scale-95 transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
