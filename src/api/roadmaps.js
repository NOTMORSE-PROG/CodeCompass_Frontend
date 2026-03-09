import apiClient from './client'

export const roadmapApi = {
  list: () => apiClient.get('/roadmaps/'),
  detail: (id) => apiClient.get(`/roadmaps/${id}/`),
  generate: () => apiClient.post('/roadmaps/generate/'),
  updateNodeStatus: (roadmapId, nodeId, status) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/`, { status }),
  repair: (roadmapId) => apiClient.post(`/roadmaps/${roadmapId}/repair/`),
  fetchResources: (roadmapId, nodeId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/fetch-resources/`),
  startAssessment: (roadmapId, nodeId, resourceId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/assessment/`),
  submitAssessment: (roadmapId, nodeId, resourceId, sessionId, answers) =>
    apiClient.post(
      `/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/assessment/${sessionId}/submit/`,
      { answers }
    ),
}
