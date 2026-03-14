import apiClient from './client'

export const universitiesApi = {
  list: (params = {}) => apiClient.get('/universities/', { params }),
  detail: (id) => apiClient.get(`/universities/${id}/`),
  recommendations: () => apiClient.get('/universities/recommendations/'),
}
