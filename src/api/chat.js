import apiClient from './client'

export const chatApi = {
  listSessions: () => apiClient.get('/chat/sessions/'),
  createSession: (data) => apiClient.post('/chat/sessions/', data),
  getSession: (sessionId) => apiClient.get(`/chat/sessions/${sessionId}/`),
  deleteSession: (sessionId) => apiClient.delete(`/chat/sessions/${sessionId}/`),
  getMessages: (sessionId) => apiClient.get(`/chat/sessions/${sessionId}/messages/`),
}

/**
 * Create a WebSocket connection for AI chat streaming.
 * Returns the WebSocket instance.
 */
export function createChatWebSocket(sessionId, { onChunk, onEnd, onError }) {
  const WS_BASE = import.meta.env.VITE_WS_URL || ''
  const wsUrl = `${WS_BASE}/ws/chat/${sessionId}/`
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
      } else if (data.type === 'stream_error') {
        onError?.(data.error)
      }
    } catch (e) {
      console.error('[WS] Parse error', e)
    }
  }

  ws.onerror = (err) => {
    onError?.('WebSocket connection error')
  }

  ws.onclose = () => {
    console.log('[WS] Chat disconnected')
  }

  return ws
}
