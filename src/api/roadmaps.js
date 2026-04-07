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
  editRoadmapMeta: (roadmapId, changes) =>
    apiClient.patch(`/roadmaps/${roadmapId}/edit/`, changes),
  editNodeContent: (roadmapId, nodeId, changes) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/edit/`, changes),
  replaceNode: (roadmapId, nodeId, payload) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/replace/`, payload),
  unlockVideoWatch: (roadmapId, nodeId, resourceId) =>
    apiClient.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/resources/${resourceId}/unlock/`),
  switchRoadmap: (data) => apiClient.post('/roadmaps/switch/', data),
  upskillRoadmap: (data) => apiClient.post('/roadmaps/upskill/', data),
}
