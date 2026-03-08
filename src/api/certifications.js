import apiClient from './client'

export const certApi = {
  listAll: (params = {}) => apiClient.get('/certifications/', { params }),
  listMy: () => apiClient.get('/certifications/my/'),
  trackCert: (certificationId, status) =>
    apiClient.post('/certifications/my/', { certification: certificationId, status }),
  updateTracking: (id, data) => apiClient.patch(`/certifications/my/${id}/`, data),
  removeTracking: (id) => apiClient.delete(`/certifications/my/${id}/`),
}
