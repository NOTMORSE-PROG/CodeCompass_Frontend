import apiClient from './client'

export const jobsApi = {
  list: (params = {}) => apiClient.get('/jobs/', { params }),
  listSaved: () => apiClient.get('/jobs/saved/'),
  saveJob: (jobId) => apiClient.post(`/jobs/${jobId}/save/`),
  unsaveJob: (jobId) => apiClient.delete(`/jobs/${jobId}/save/`),
}
