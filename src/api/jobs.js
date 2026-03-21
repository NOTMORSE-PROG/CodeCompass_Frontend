import apiClient from './client'

export const jobsApi = {
  list: (params = {}) => apiClient.get('/jobs/', { params }),
  getRecommended: () => apiClient.get('/jobs/recommended/'),
  recommendFromResume: (resumeText) => apiClient.post('/jobs/recommend-from-resume/', { resume_text: resumeText }),
  listSaved: () => apiClient.get('/jobs/saved/'),
  saveJob: (jobId) => apiClient.post(`/jobs/${jobId}/save/`),
  unsaveJob: (jobId) => apiClient.delete(`/jobs/${jobId}/save/`),
}
