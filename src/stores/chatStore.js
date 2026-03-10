/**
 * Chat store — manages AI chat sessions and WebSocket connection.
 */
import { create } from 'zustand'
import { chatApi, createChatWebSocket } from '../api/chat'

const useChatStore = create((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  streamingContent: '',  // Buffer for incoming AI stream chunks
  isStreaming: false,
  suggestions: [],       // Quick-reply chips for onboarding
  ws: null,

  fetchSessions: async () => {
    try {
      const { data } = await chatApi.listSessions()
      set({ sessions: data.results || data })
    } catch {
      /* silent */
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await chatApi.deleteSession(sessionId)
      set((state) => ({
        sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
        currentSession: state.currentSession?.sessionId === sessionId ? null : state.currentSession,
        messages: state.currentSession?.sessionId === sessionId ? [] : state.messages,
      }))
    } catch {
      /* silent */
    }
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
    try {
      const { data } = await chatApi.getSession(sessionId)
      set({ currentSession: data, messages: data.messages || [] })
      get()._connectWebSocket(sessionId)
    } catch {
      /* silent */
    }
  },

  sendMessage: (content) => {
    const { ws, currentSession } = get()
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      get()._connectWebSocket(currentSession?.sessionId)
      return
    }
    // Add user message optimistically; clear any pending suggestions
    const userMsg = { role: 'user', content, createdAt: new Date().toISOString() }
    set((state) => ({
      messages: [...state.messages, userMsg],
      streamingContent: '',
      isStreaming: true,
      suggestions: [],
    }))
    ws.send(JSON.stringify({ message: content }))
  },

  disconnectWebSocket: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null })
    }
  },

  _connectWebSocket: (sessionId) => {
    // Close existing connection
    get().disconnectWebSocket()

    const ws = createChatWebSocket(sessionId, {
      onChunk: (chunk) => {
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
          isStreaming: true,  // handles server-initiated streams (e.g., greeting)
        }))
      },
      onEnd: ({ message_id, clean_content }) => {
        set((state) => {
          // Use clean_content from backend (suggestions tag stripped) if available
          const content = clean_content ?? state.streamingContent
          const assistantMsg = {
            id: message_id,
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
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
        set({ isStreaming: false, streamingContent: '', suggestions: [] })
      },
    })

    set({ ws })
  },
}))

export default useChatStore
