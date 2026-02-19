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
  ws: null,

  fetchSessions: async () => {
    try {
      const { data } = await chatApi.listSessions()
      set({ sessions: data.results || data })
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
    // Add user message optimistically
    const userMsg = { role: 'user', content, createdAt: new Date().toISOString() }
    set((state) => ({
      messages: [...state.messages, userMsg],
      streamingContent: '',
      isStreaming: true,
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
        set((state) => ({ streamingContent: state.streamingContent + chunk }))
      },
      onEnd: ({ messageId }) => {
        set((state) => {
          const assistantMsg = {
            id: messageId,
            role: 'assistant',
            content: state.streamingContent,
            createdAt: new Date().toISOString(),
          }
          return {
            messages: [...state.messages, assistantMsg],
            streamingContent: '',
            isStreaming: false,
          }
        })
      },
      onError: () => {
        set({ isStreaming: false, streamingContent: '' })
      },
    })

    set({ ws })
  },
}))

export default useChatStore
