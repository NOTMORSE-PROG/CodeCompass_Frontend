import apiClient from './client'

export const profileApi = {
  // Student profile
  getStudentProfile: () => apiClient.get('/auth/profiles/student/me/'),
  updateStudentProfile: (data) => apiClient.patch('/auth/profiles/student/me/', data),

  // Mentor profiles
  getMentorList: (params = {}) => apiClient.get('/auth/profiles/mentors/', { params }),
  getMentorDetail: (id) => apiClient.get(`/auth/profiles/mentors/${id}/`),
  getOwnMentorProfile: () => apiClient.get('/auth/profiles/mentor/me/'),
  updateOwnMentorProfile: (data) => apiClient.patch('/auth/profiles/mentor/me/', data),
  applyAsMentor: (data) => apiClient.post('/auth/profiles/mentor/apply/', data),
}
