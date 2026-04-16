import apiClient from './client'

export const roadmapApi = {
  list: () => apiClient.get('/roadmaps/'),
  detail: (id) => apiClient.get(`/roadmaps/${id}/`),
  generate: () => apiClient.post('/roadmaps/generate/'),
  updateNodeStatus: (roadmapId, nodeId, status) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/`, { status }),
  repair: (roadmapId) => apiClient.post(`/roadmaps/${roadmapId}/repair/`),
  fixStructure: (roadmapId) => apiClient.post(`/roadmaps/${roadmapId}/fix-structure/`),
  fetchResources: (roadmapId, nodeId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/fetch-resources/`),
  startAssessment: (roadmapId, nodeId, resourceId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/assessment/`),
  submitAssessment: (roadmapId, nodeId, resourceId, sessionId, answers) =>
    apiClient.post(
      `/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/assessment/${sessionId}/submit/`,
      { answers }
    ),
  // Roadmap mutation endpoints — optional second arg { sessionId } attaches
  // the X-Chat-Session-Id header. Backend's FromRoadmapScopedSession permission
  // verifies the session scope is 'roadmap' before applying, blocking mutations
  // that originate from a Jobs/General/University chat session.
  editRoadmapMeta: (roadmapId, changes, { sessionId } = {}) =>
    apiClient.patch(`/roadmaps/${roadmapId}/edit/`, changes, _scopeHeaders(sessionId)),
  editNodeContent: (roadmapId, nodeId, changes, { sessionId } = {}) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/edit/`, changes, _scopeHeaders(sessionId)),
  replaceNode: (roadmapId, nodeId, payload, { sessionId } = {}) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/replace/`, payload, _scopeHeaders(sessionId)),
  unlockVideoWatch: (roadmapId, nodeId, resourceId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/unlock/`),
  switchRoadmap: (data, { sessionId } = {}) =>
    apiClient.post('/roadmaps/switch/', data, _scopeHeaders(sessionId)),
  upskillRoadmap: (data, { sessionId } = {}) =>
    apiClient.post('/roadmaps/upskill/', data, _scopeHeaders(sessionId)),
}

function _scopeHeaders(sessionId) {
  return sessionId ? { headers: { 'X-Chat-Session-Id': sessionId } } : {}
}
