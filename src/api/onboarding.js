import apiClient from './client'

export const onboardingApi = {
  status: () => apiClient.get('/onboarding/status/'),
  completeFromChat: (chatSessionId) =>
    apiClient.post('/onboarding/complete-from-chat/', { chat_session_id: chatSessionId }),
}
