/**
 * Chat store — manages AI chat sessions and WebSocket connection.
 */
import { create } from 'zustand'
import toast from 'react-hot-toast'
import { chatApi, createChatWebSocket } from '../api/chat'

const useChatStore = create((set, get) => ({
  sessions: [],
  sessionsLoading: false,
  sessionLoading: false,
  currentSession: null,
  messages: [],
  streamingContent: '',  // Buffer for incoming AI stream chunks
  isStreaming: false,
  wsConnected: false,    // Tracks live WS connection status
  suggestions: [],       // Quick-reply chips for onboarding
  ws: null,
  _sessionCreating: false,  // Guard against double session creation race
  chatLanguage: (() => { try { return localStorage.getItem('cc_chat_language') || 'english' } catch { return 'english' } })(),

  fetchSessions: async () => {
    set({ sessionsLoading: true })
    try {
      const { data } = await chatApi.listSessions()
      set({ sessions: data.results || data })
    } catch {
      toast.error('Could not load chat history.')
    } finally {
      set({ sessionsLoading: false })
    }
  },

  renameSession: async (sessionId, title) => {
    try {
      const { data } = await chatApi.updateSession(sessionId, { title })
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === sessionId ? { ...s, title: data.title } : s
        ),
        currentSession:
          state.currentSession?.sessionId === sessionId
            ? { ...state.currentSession, title: data.title }
            : state.currentSession,
      }))
    } catch {
      toast.error('Could not rename chat.')
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await chatApi.deleteSession(sessionId)
      const isActive = get().currentSession?.sessionId === sessionId
      if (isActive) get().disconnectWebSocket()
      set((state) => ({
        sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
        currentSession: isActive ? null : state.currentSession,
        messages: isActive ? [] : state.messages,
      }))
    } catch {
      toast.error('Could not delete chat.')
    }
  },

  clearCurrentSession: () => {
    get().disconnectWebSocket()
    set({ currentSession: null, messages: [], streamingContent: '', isStreaming: false, suggestions: [], wsConnected: false, sessionLoading: false })
  },

  createSession: async (contextType = 'general') => {
    try {
      const { data } = await chatApi.createSession({ contextType })
      set((state) => ({ sessions: [data, ...state.sessions], currentSession: data }))
      return data
    } catch {
      return null
    }
  },

  selectSession: async (sessionId) => {
    set({ sessionLoading: true })
    try {
      const { data } = await chatApi.getSession(sessionId)
      set({ currentSession: data, messages: data.messages || [] })
      get()._connectWebSocket(sessionId)
    } catch {
      toast.error('Could not load that chat.')
    } finally {
      set({ sessionLoading: false })
    }
  },

  sendMessage: async (content, contextType = 'general') => {
    let { currentSession, _sessionCreating } = get()

    // Guard against double-tap / rapid re-send creating duplicate sessions
    if (!currentSession) {
      if (_sessionCreating) return
      set({ _sessionCreating: true })
      const session = await get().createSession(contextType)
      set({ _sessionCreating: false })
      if (!session) return
      currentSession = session
    }

    // Optimistically add user message
    const userMsg = { role: 'user', content, createdAt: new Date().toISOString() }
    set((state) => ({
      messages: [...state.messages, userMsg],
      streamingContent: '',
      isStreaming: true,
      suggestions: [],
    }))

    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: content, language: get().chatLanguage }))
    } else {
      get()._connectWebSocket(currentSession.sessionId, content)
    }
  },

  setChatLanguage: (lang) => {
    try { localStorage.setItem('cc_chat_language', lang) } catch { /* storage unavailable */ }
    set({ chatLanguage: lang })
  },

  dismissEditProposals: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, editProposals: null } : m
      ),
    }))
  },

  dismissRoadmapSwitch: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, roadmapSwitch: null } : m
      ),
    }))
  },

  dismissRoadmapUpskill: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, roadmapUpskill: null } : m
      ),
    }))
  },

  pushLocalMessage: (text) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `local-${Date.now()}`,
          role: 'assistant',
          content: text,
          createdAt: new Date().toISOString(),
          editProposals: null,
        },
      ],
    }))
  },

  disconnectWebSocket: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, wsConnected: false })
    }
  },

  _connectWebSocket: (sessionId, pendingMessage = null) => {
    get().disconnectWebSocket()

    const ws = createChatWebSocket(sessionId, {
      onChunk: (chunk) => {
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
          isStreaming: true,
        }))
      },
      onEnd: ({ message_id, clean_content, edit_proposals, resources, roadmap_switch, roadmap_upskill }) => {
        set((state) => {
          const content = clean_content ?? state.streamingContent
          const assistantMsg = {
            id: message_id,
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
            editProposals: (edit_proposals && edit_proposals.length > 0) ? edit_proposals : null,
            resources: (resources && resources.length > 0) ? resources : null,
            roadmapSwitch: roadmap_switch || null,
            roadmapUpskill: roadmap_upskill || null,
          }
          return {
            messages: [...state.messages, assistantMsg],
            streamingContent: '',
            isStreaming: false,
          }
        })
      },
      onSuggestions: (opts) => {
        set({ suggestions: opts })
      },
      onError: () => {
        const wasStreaming = get().isStreaming
        set((state) => {
          // Roll back the optimistic user message if it was never confirmed by the backend
          const last = state.messages[state.messages.length - 1]
          const messages = (last && last.role === 'user' && !last.id)
            ? state.messages.slice(0, -1)
            : state.messages
          return { messages, isStreaming: false, streamingContent: '', suggestions: [], wsConnected: false }
        })
        if (wasStreaming) toast.error('Message not sent — please try again.')
      },
      onClose: () => {
        set({ isStreaming: false, streamingContent: '', wsConnected: false })
      },
      onTitleUpdate: (title) => {
        const { currentSession } = get()
        if (!currentSession) return
        const sid = currentSession.sessionId
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.sessionId === sid ? { ...s, title } : s
          ),
          currentSession: { ...state.currentSession, title },
        }))
      },
    })

    // Mark connected once WS opens
    ws.addEventListener('open', () => {
      set({ wsConnected: true })
    }, { once: true })

    if (pendingMessage) {
      ws.addEventListener('open', () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ message: pendingMessage, language: get().chatLanguage }))
        }
      }, { once: true })
    }

    set({ ws })
  },
}))

export default useChatStore
