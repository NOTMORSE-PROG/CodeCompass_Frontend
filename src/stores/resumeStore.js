/**
 * Resume store — manages resume list, current resume being edited,
 * AI suggestion state, and ATS scoring.
 */
import { create } from 'zustand'
import { resumesApi } from '../api/resumes'
import toast from 'react-hot-toast'

const EMPTY_CONTENT = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: { technical: [], soft: [], tools: [] },
  projects: [],
  certifications: [],
}

const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  isFetching: false,
  isSaving: false,
  isAutoSaving: false,
  isGenerating: false,

  // AI results
  bulletSuggestions: [], // string[]
  summarySuggestions: [], // {tone, text}[]
  parsedJob: null,        // {requiredSkills, keywords, ...}
  atsResult: null,        // {score, matchedKeywords, missingKeywords, suggestions}

  /** Fetch all resumes for the current user. */
  fetchResumes: async () => {
    set({ isFetching: true })
    try {
      const { data } = await resumesApi.list()
      // DRF may return paginated {results:[]} or a plain array
      set({ resumes: Array.isArray(data) ? data : (data.results || []) })
    } catch {
      toast.error('Failed to load resumes.')
    } finally {
      set({ isFetching: false })
    }
  },

  /** Load a single resume (with full content) into the editor. */
  loadResume: async (id) => {
    set({ isFetching: true, currentResume: null })
    try {
      const { data } = await resumesApi.get(id)
      // Ensure content has all keys (for older/incomplete resumes)
      set({
        currentResume: {
          ...data,
          template_name: data.templateName || data.template_name || 'modern',
          content: { ...EMPTY_CONTENT, ...data.content },
        },
        atsResult: null,
        parsedJob: null,
        bulletSuggestions: [],
        summarySuggestions: [],
      })
    } catch {
      toast.error('Failed to load resume.')
    } finally {
      set({ isFetching: false })
    }
  },

  /** Create a new blank resume and open it. */
  createResume: async (title = 'My Resume', template = 'modern') => {
    set({ isSaving: true })
    try {
      const { data } = await resumesApi.create({
        title,
        template_name: template,
        content: EMPTY_CONTENT,
      })
      set((state) => ({
        resumes: [data, ...state.resumes],
        currentResume: { ...data, template_name: template, content: { ...EMPTY_CONTENT, ...data.content } },
        atsResult: null,
        parsedJob: null,
        bulletSuggestions: [],
        summarySuggestions: [],
      }))
      return data
    } catch {
      toast.error('Failed to create resume.')
      return null
    } finally {
      set({ isSaving: false })
    }
  },

  /** Close (deselect) the current resume without deleting it. */
  closeResume: () => set({ currentResume: null }),

  /** Update a top-level field (title, template_name, content) in the current resume. */
  updateCurrentResume: (patch) => {
    set((state) => ({
      currentResume: state.currentResume ? { ...state.currentResume, ...patch } : null,
    }))
  },

  /** Update a section inside content (e.g. 'summary', 'experience', 'skills'). */
  updateSection: (section, value) => {
    set((state) => {
      if (!state.currentResume) return {}
      return {
        currentResume: {
          ...state.currentResume,
          content: { ...state.currentResume.content, [section]: value },
        },
      }
    })
  },

  /** Save the current resume to the backend. Pass silent=true for auto-saves. */
  saveResume: async (silent = false) => {
    const { currentResume } = get()
    if (!currentResume) return
    if (silent) {
      set({ isAutoSaving: true })
    } else {
      set({ isSaving: true })
    }
    try {
      const { data } = await resumesApi.update(currentResume.id, {
        title: currentResume.title,
        template_name: currentResume.template_name || currentResume.templateName,
        content: currentResume.content,
      })
      set((state) => ({
        // Only update server-assigned metadata — never overwrite local content/title
        // which may have been edited while the request was in flight.
        currentResume: state.currentResume
          ? { ...state.currentResume, updated_at: data.updated_at }
          : null,
        resumes: state.resumes.map((r) => (r.id === data.id ? { ...r, ...data } : r)),
      }))
      if (!silent) toast.success('Resume saved!')
    } catch {
      toast.error('Failed to save resume.')
    } finally {
      if (silent) {
        set({ isAutoSaving: false })
      } else {
        set({ isSaving: false })
      }
    }
  },

  /** Delete a resume. */
  deleteResume: async (id) => {
    try {
      await resumesApi.remove(id)
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
        currentResume: state.currentResume?.id === id ? null : state.currentResume,
      }))
      toast.success('Resume deleted.')
    } catch {
      toast.error('Failed to delete resume.')
    }
  },

  // ---------------------------------------------------------------------------
  // AI Generation
  // ---------------------------------------------------------------------------

  /** Generate bullet point suggestions for an experience entry. */
  generateBullets: async (jobTitle, achievement) => {
    const { currentResume } = get()
    if (!currentResume) return
    set({ isGenerating: true, bulletSuggestions: [] })
    try {
      const { data } = await resumesApi.generateBullets(currentResume.id, jobTitle, achievement)
      set({ bulletSuggestions: data.bullets || [] })
    } catch {
      toast.error('AI generation failed. Try again.')
    } finally {
      set({ isGenerating: false })
    }
  },

  /** Generate professional summary variations. */
  generateSummary: async (targetRole, strengths, yearsExp) => {
    const { currentResume } = get()
    if (!currentResume) return
    set({ isGenerating: true, summarySuggestions: [] })
    try {
      const { data } = await resumesApi.generateSummary(
        currentResume.id,
        targetRole,
        strengths,
        yearsExp,
      )
      set({ summarySuggestions: data.summaries || [] })
    } catch {
      toast.error('AI generation failed. Try again.')
    } finally {
      set({ isGenerating: false })
    }
  },

  /** Parse a job description and extract keywords. */
  parseJob: async (jobDescription) => {
    set({ isGenerating: true, parsedJob: null })
    try {
      const { data } = await resumesApi.parseJobDescription(jobDescription)
      set({ parsedJob: data })
      return data
    } catch {
      toast.error('Failed to parse job description.')
      return null
    } finally {
      set({ isGenerating: false })
    }
  },

  /** Score the current resume against a parsed job object. */
  scoreAts: async (parsedJob) => {
    const { currentResume } = get()
    if (!currentResume) return
    set({ isGenerating: true, atsResult: null })
    try {
      const { data } = await resumesApi.scoreAts(currentResume.id, parsedJob)
      set({ atsResult: data })
    } catch {
      toast.error('ATS scoring failed.')
    } finally {
      set({ isGenerating: false })
    }
  },

  clearBulletSuggestions: () => set({ bulletSuggestions: [] }),
  clearSummarySuggestions: () => set({ summarySuggestions: [] }),
  clearAtsResult: () => set({ atsResult: null, parsedJob: null }),
}))

export default useResumeStore
