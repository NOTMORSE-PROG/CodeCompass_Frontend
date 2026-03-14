import client from './client'

export const resumesApi = {
  /** List all resumes for the current user (lightweight). */
  list: () => client.get('/resumes/'),

  /** Get a single resume with full content. */
  get: (id) => client.get(`/resumes/${id}/`),

  /** Create a new resume. */
  create: (data) => client.post('/resumes/', data),

  /** Update a resume (partial update). */
  update: (id, data) => client.patch(`/resumes/${id}/`, data),

  /** Delete a resume. */
  remove: (id) => client.delete(`/resumes/${id}/`),

  /** AI: Generate 4 bullet points for an experience entry. */
  generateBullets: (id, jobTitle, achievement) =>
    client.post(`/resumes/${id}/generate-bullets/`, { jobTitle, achievement }),

  /** AI: Generate 3 professional summary variations. */
  generateSummary: (id, targetRole, strengths, yearsExp) =>
    client.post(`/resumes/${id}/generate-summary/`, {
      targetRole,
      strengths,
      yearsExp,
    }),

  /** AI: Parse a job description to extract keywords and skills. */
  parseJobDescription: (jobDescription) =>
    client.post('/resumes/parse-job/', { jobDescription }),

  /** AI: Score resume against job keywords and get suggestions. */
  scoreAts: (id, jobKeywords) =>
    client.post(`/resumes/${id}/score-ats/`, { jobKeywords }),
}
