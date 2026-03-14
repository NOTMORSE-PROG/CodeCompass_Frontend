import apiClient from './client'
import useAuthStore from '../stores/authStore'

export const chatApi = {
  listSessions: () => apiClient.get('/chat/sessions/'),
  createSession: (data) => apiClient.post('/chat/sessions/', data),
  getSession: (sessionId) => apiClient.get(`/chat/sessions/${sessionId}/`),
  updateSession: (sessionId, data) => apiClient.patch(`/chat/sessions/${sessionId}/`, data),
  deleteSession: (sessionId) => apiClient.delete(`/chat/sessions/${sessionId}/`),
  getMessages: (sessionId) => apiClient.get(`/chat/sessions/${sessionId}/messages/`),
}

/**
 * Create a WebSocket connection for AI chat streaming.
 * Returns the WebSocket instance.
 */
export function createChatWebSocket(sessionId, { onChunk, onEnd, onError, onSuggestions, onTitleUpdate }) {
  const WS_BASE = import.meta.env.VITE_WS_URL || ''
  // Pass JWT access token as query param for WebSocket authentication
  const { accessToken } = useAuthStore.getState()
  const tokenParam = accessToken ? `?token=${accessToken}` : ''
  const wsUrl = `${WS_BASE}/ws/chat/${sessionId}/${tokenParam}`
  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('[WS] Chat connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'stream_chunk') {
        onChunk?.(data.content)
      } else if (data.type === 'stream_end') {
        onEnd?.(data)
        if (data.suggestions?.length) {
          onSuggestions?.(data.suggestions)
        }
      } else if (data.type === 'stream_error') {
        onError?.(data.error)
      } else if (data.type === 'session_title_updated') {
        onTitleUpdate?.(data.title)
      } else {
        console.warn('[WS] Unknown message type:', data.type)
      }
    } catch (e) {
      console.error('[WS] Parse error', e)
    }
  }

  ws.onerror = (_err) => {
    onError?.('WebSocket connection error')
  }

  ws.onclose = () => {
    console.log('[WS] Chat disconnected')
  }

  return ws
}
