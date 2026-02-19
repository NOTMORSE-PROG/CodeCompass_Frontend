import apiClient from './client'

export const roadmapApi = {
  list: () => apiClient.get('/roadmaps/'),
  detail: (id) => apiClient.get(`/roadmaps/${id}/`),
  generate: () => apiClient.post('/roadmaps/generate/'),
  updateNodeStatus: (roadmapId, nodeId, status) =>
    apiClient.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/`, { status }),
}
