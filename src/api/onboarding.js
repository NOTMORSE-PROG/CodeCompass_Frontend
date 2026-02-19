import apiClient from './client'

export const onboardingApi = {
  status: () => apiClient.get('/onboarding/status/'),
  questions: () => apiClient.get('/onboarding/questions/'),
  start: () => apiClient.post('/onboarding/start/'),
  submitResponses: (responses) => apiClient.post('/onboarding/responses/', { responses }),
  complete: () => apiClient.post('/onboarding/complete/'),
}
