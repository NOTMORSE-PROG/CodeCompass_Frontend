import apiClient from './client'

export const mentorsApi = {
  // Mentor discovery
  list: (params = {}) => apiClient.get('/auth/profiles/mentors/', { params }),
  detail: (id) => apiClient.get(`/auth/profiles/mentors/${id}/`),

  // Mentorship requests
  listRequests: () => apiClient.get('/mentorship/requests/'),
  sendRequest: (mentorId, message) =>
    apiClient.post('/mentorship/requests/', { mentor: mentorId, studentMessage: message }),
  respondToRequest: (requestId, status, mentorResponse = '') =>
    apiClient.patch(`/mentorship/requests/${requestId}/`, { status, mentorResponse }),

  // Sessions
  listSessions: () => apiClient.get('/mentorship/sessions/'),
  createSession: (data) => apiClient.post('/mentorship/sessions/', data),
  submitReview: (sessionId, data) =>
    apiClient.post(`/mentorship/sessions/${sessionId}/review/`, data),
}
