/**
 * ResumePage — AI-powered resume creator.
 * Three-panel layout: editor tabs | live preview | ATS scorer.
 */
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import useResumeStore from '../../stores/resumeStore'
import ResumePreview from '../../components/resume/ResumePreview'
import TemplateGallery from '../../components/resume/TemplateGallery'
import { v4 as uuidv4 } from 'uuid'

const SKILL_PLACEHOLDER = { technical: 'e.g. Python, React, SQL', soft: 'e.g. Leadership, Communication', tools: 'e.g. Git, Docker, Figma' }

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ResumePage() {
  const {
    resumes, currentResume, isFetching, isSaving, isGenerating,
    bulletSuggestions, summarySuggestions, atsResult,
    fetchResumes, loadResume, createResume, saveResume, closeResume,
    updateCurrentResume, updateSection,
    generateBullets, generateSummary, parseJob, scoreAts,
    clearBulletSuggestions, clearSummarySuggestions, clearAtsResult,
  } = useResumeStore()

  const [activeTab, setActiveTab] = useState('info')
  const [jobDescText, setJobDescText] = useState('')
  const [bulletModal, setBulletModal] = useState(null) // { expId, jobTitle, achievement }
  const [summaryModal, setSummaryModal] = useState(false)
  const [summaryForm, setSummaryForm] = useState({ targetRole: '', strengths: '', yearsExp: '' })
  const [showGallery, setShowGallery] = useState(false)
  const [galleryMode, setGalleryMode] = useState('create') // 'create' | 'edit'
  const [previewScale, setPreviewScale] = useState(0.72)

  const previewRef = useRef(null)
  const previewContainerRef = useRef(null)

  // Dynamic preview scaling — fills available container width
  useLayoutEffect(() => {
    const el = previewContainerRef.current
    if (!el) return
    const RESUME_WIDTH = 816
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setPreviewScale(w / RESUME_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => { fetchResumes() }, [fetchResumes])

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: currentResume?.title || 'Resume',
  })

  // Auto-save debounce
  const saveTimeout = useRef(null)
  const debouncedSave = useCallback(() => {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => { saveResume() }, 2000)
  }, [saveResume])

  const handleSectionChange = (section, value) => {
    updateSection(section, value)
    debouncedSave()
  }

  // ---------------------------------------------------------------------------
  // Create / switch template via gallery
  // ---------------------------------------------------------------------------
  const handleCreate = async ({ templateId, color, title }) => {
    const newResume = await createResume(title || 'My Resume', templateId || 'modern')
    if (newResume && color) {
      // Store chosen color in content._styling
      useResumeStore.getState().updateSection('_styling', { primaryColor: color })
      setTimeout(() => saveResume(), 300)
    }
    setShowGallery(false)
    setActiveTab('info')
  }

  const handleApplyTemplate = ({ templateId, color }) => {
    updateCurrentResume({ template_name: templateId })
    if (color) {
      updateSection('_styling', { ...(currentResume?.content?._styling || {}), primaryColor: color })
    }
    setShowGallery(false)
    debouncedSave()
  }

  // ---------------------------------------------------------------------------
  // Experience helpers
  // ---------------------------------------------------------------------------
  const addExperience = () => {
    const exps = currentResume.content.experience || []
    handleSectionChange('experience', [...exps, {
      id: uuidv4(), company: '', title: '', location: '',
      startDate: '', endDate: '', current: false, bullets: [],
    }])
  }

  const updateExperience = (id, patch) => {
    const exps = (currentResume.content.experience || []).map((e) => e.id === id ? { ...e, ...patch } : e)
    handleSectionChange('experience', exps)
  }

  const removeExperience = (id) => {
    handleSectionChange('experience', (currentResume.content.experience || []).filter((e) => e.id !== id))
  }

  const addBulletToExp = (expId, bullet) => {
    const exps = (currentResume.content.experience || []).map((e) =>
      e.id === expId ? { ...e, bullets: [...(e.bullets || []), bullet] } : e
    )
    handleSectionChange('experience', exps)
  }

  const removeBullet = (expId, idx) => {
    const exps = (currentResume.content.experience || []).map((e) =>
      e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
    )
    handleSectionChange('experience', exps)
  }

  // ---------------------------------------------------------------------------
  // Education helpers
  // ---------------------------------------------------------------------------
  const addEducation = () => {
    const edus = currentResume.content.education || []
    handleSectionChange('education', [...edus, {
      id: uuidv4(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '',
    }])
  }

  const updateEducation = (id, patch) => {
    const edus = (currentResume.content.education || []).map((e) => e.id === id ? { ...e, ...patch } : e)
    handleSectionChange('education', edus)
  }

  const removeEducation = (id) => {
    handleSectionChange('education', (currentResume.content.education || []).filter((e) => e.id !== id))
  }

  // ---------------------------------------------------------------------------
  // Projects helpers
  // ---------------------------------------------------------------------------
  const addProject = () => {
    const projs = currentResume.content.projects || []
    handleSectionChange('projects', [...projs, { id: uuidv4(), name: '', description: '', tech: [], link: '' }])
  }

  const updateProject = (id, patch) => {
    const projs = (currentResume.content.projects || []).map((p) => p.id === id ? { ...p, ...patch } : p)
    handleSectionChange('projects', projs)
  }

  const removeProject = (id) => {
    handleSectionChange('projects', (currentResume.content.projects || []).filter((p) => p.id !== id))
  }

  // ---------------------------------------------------------------------------
  // Certifications helpers
  // ---------------------------------------------------------------------------
  const addCertification = () => {
    const certs = currentResume.content.certifications || []
    handleSectionChange('certifications', [...certs, { id: uuidv4(), name: '', issuer: '', date: '' }])
  }

  const updateCertification = (id, patch) => {
    const certs = (currentResume.content.certifications || []).map((c) => c.id === id ? { ...c, ...patch } : c)
    handleSectionChange('certifications', certs)
  }

  const removeCertification = (id) => {
    handleSectionChange('certifications', (currentResume.content.certifications || []).filter((c) => c.id !== id))
  }

  // ---------------------------------------------------------------------------
  // Skills helper
  // ---------------------------------------------------------------------------
  const updateSkillList = (type, raw) => {
    const arr = raw.split(',').map((s) => s.trim()).filter(Boolean)
    handleSectionChange('skills', { ...(currentResume.content.skills || {}), [type]: arr })
  }

  // ---------------------------------------------------------------------------
  // ATS
  // ---------------------------------------------------------------------------
  const handleAnalyzeJob = async () => {
    if (!jobDescText.trim()) return
    const result = await parseJob(jobDescText)
    if (result?.keywords?.length > 0) {
      await scoreAts([...result.keywords, ...(result.requiredSkills || [])])
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (isFetching && !currentResume && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-brand-black">Resume Builder</h1>
        <span className="text-gray-300">|</span>

        {/* Resume list tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => loadResume(r.id)}
              className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-all font-medium ${
                currentResume?.id === r.id
                  ? 'bg-brand-yellow text-brand-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.title}
            </button>
          ))}

          <button
            onClick={() => { setGalleryMode('create'); setShowGallery(true) }}
            className="px-3 py-1.5 text-xs rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-brand-yellow hover:text-brand-yellow transition-all whitespace-nowrap"
          >
            + New Resume
          </button>
        </div>

        {/* Actions */}
        {currentResume && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Auto-save status */}
            <span className={`text-[10px] font-medium transition-colors ${isSaving ? 'text-amber-500' : 'text-green-500'}`}>
              {isSaving ? '● Saving...' : '✓ Saved'}
            </span>
            <button
              onClick={saveResume}
              disabled={isSaving}
              className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handlePrint}
              className="text-xs px-3 py-1.5 bg-brand-yellow text-brand-black font-semibold rounded-md hover:bg-yellow-400 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={closeResume}
              className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close editor (resume is saved)"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      {!currentResume ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-500 font-medium mb-2">No resume selected</p>
            <p className="text-sm text-gray-400 mb-4">Create a new resume or select one from the top bar</p>
            <button
              onClick={() => { setGalleryMode('create'); setShowGallery(true) }}
              className="px-4 py-2 bg-brand-yellow text-brand-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              + Create New Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ------------------------------------------------------------------ */}
          {/* LEFT: Editor */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-[340px] flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Template + tab nav */}
            <div className="px-4 pt-3 pb-0 border-b border-gray-100 bg-white flex-shrink-0">
              {/* Template selector */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500 font-medium">Template:</span>
                <span className="text-xs font-semibold text-gray-800 capitalize">{currentResume.template_name}</span>
                <button
                  onClick={() => { setGalleryMode('edit'); setShowGallery(true) }}
                  className="ml-auto text-xs px-2.5 py-1 border border-gray-200 rounded-md text-gray-500 hover:border-brand-yellow hover:text-brand-yellow transition-all"
                >
                  Change Template
                </button>
              </div>

              {/* Tab nav */}
              <div className="flex gap-0 overflow-x-auto">
                {[
                  { id: 'info', label: 'Info' },
                  { id: 'summary', label: 'Summary' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'education', label: 'Education' },
                  { id: 'skills', label: 'Skills' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'certifications', label: 'Certs' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-xs px-3 py-2 border-b-2 whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'border-brand-yellow text-brand-black font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeTab === 'info' && <InfoTab resume={currentResume} onChange={handleSectionChange} />}
              {activeTab === 'summary' && (
                <SummaryTab
                  resume={currentResume}
                  onChange={handleSectionChange}
                  isGenerating={isGenerating}
                  suggestions={summarySuggestions}
                  onGenerate={() => setSummaryModal(true)}
                  onPickSuggestion={(text) => { handleSectionChange('summary', text); clearSummarySuggestions() }}
                  onClear={clearSummarySuggestions}
                />
              )}
              {activeTab === 'experience' && (
                <ExperienceTab
                  resume={currentResume}
                  onAdd={addExperience}
                  onUpdate={updateExperience}
                  onRemove={removeExperience}
                  onAddBullet={addBulletToExp}
                  onRemoveBullet={removeBullet}
                  onOpenBulletAI={(expId, jobTitle) => {
                    clearBulletSuggestions()
                    setBulletModal({ expId, jobTitle, achievement: '' })
                  }}
                  bulletSuggestions={bulletSuggestions}
                  bulletModal={bulletModal}
                  isGenerating={isGenerating}
                  onGenerateBullets={(achievement) => generateBullets(bulletModal.jobTitle, achievement)}
                  onPickBullet={(bullet) => { addBulletToExp(bulletModal.expId, bullet); setBulletModal(null); clearBulletSuggestions() }}
                  onCloseBulletModal={() => { setBulletModal(null); clearBulletSuggestions() }}
                />
              )}
              {activeTab === 'education' && (
                <EducationTab
                  resume={currentResume}
                  onAdd={addEducation}
                  onUpdate={updateEducation}
                  onRemove={removeEducation}
                />
              )}
              {activeTab === 'skills' && (
                <SkillsTab resume={currentResume} onUpdate={updateSkillList} />
              )}
              {activeTab === 'projects' && (
                <ProjectsTab
                  resume={currentResume}
                  onAdd={addProject}
                  onUpdate={updateProject}
                  onRemove={removeProject}
                />
              )}
              {activeTab === 'certifications' && (
                <CertsTab
                  resume={currentResume}
                  onAdd={addCertification}
                  onUpdate={updateCertification}
                  onRemove={removeCertification}
                />
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* CENTER: Live Preview — dynamic scale fills panel width */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex-1 overflow-y-auto bg-[#e0e2e6] p-5 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center mb-3 flex-shrink-0">
              Live Preview
            </p>
            {/* Container measures available width and drives scale */}
            <div ref={previewContainerRef} className="flex-shrink-0 w-full">
              <div
                className="shadow-2xl"
                style={{
                  transformOrigin: 'top left',
                  transform: `scale(${previewScale})`,
                  width: '816px',
                  marginBottom: `${-(1056 * (1 - previewScale))}px`,
                }}
              >
                <ResumePreview ref={previewRef} resume={currentResume} />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* RIGHT: ATS Panel */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-[280px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800">ATS Score</h3>
              <p className="text-xs text-gray-400">Paste a job description to analyze your match</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Job description input */}
              <div>
                <textarea
                  value={jobDescText}
                  onChange={(e) => setJobDescText(e.target.value)}
                  placeholder="Paste job description here..."
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 h-28 resize-none focus:outline-none focus:border-brand-yellow"
                />
                <button
                  onClick={handleAnalyzeJob}
                  disabled={isGenerating || !jobDescText.trim()}
                  className="w-full mt-2 text-xs py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isGenerating ? 'Analyzing...' : 'Analyze Match'}
                </button>
              </div>

              {/* ATS Score display */}
              {atsResult && (
                <div className="space-y-3">
                  {/* Score circle */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 font-bold text-xl ${
                      atsResult.score >= 70 ? 'border-green-400 text-green-600' :
                      atsResult.score >= 40 ? 'border-yellow-400 text-yellow-600' :
                      'border-red-400 text-red-600'
                    }`}>
                      {atsResult.score}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ATS Match Score</p>
                  </div>

                  {/* Matched keywords */}
                  {atsResult.matchedKeywords?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1.5">✓ Matched ({atsResult.matchedKeywords.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {atsResult.matchedKeywords.map((kw) => (
                          <span key={kw} className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing keywords */}
                  {atsResult.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1.5">✗ Missing ({atsResult.missingKeywords.length})</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {atsResult.missingKeywords.map((kw) => (
                          <span key={kw} className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI suggestions */}
                  {atsResult.suggestions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">💡 Suggestions</p>
                      <ul className="space-y-1.5">
                        {atsResult.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button onClick={clearAtsResult} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">Clear results</button>
                </div>
              )}

              {!atsResult && !isGenerating && (
                <p className="text-xs text-gray-400 text-center">
                  Your ATS match score and keyword analysis will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Gallery Modal */}
      {showGallery && (
        <TemplateGallery
          mode={galleryMode}
          initialTemplate={currentResume?.template_name || 'modern'}
          initialColor={currentResume?.content?._styling?.primaryColor || '#1A2F5E'}
          onSelect={galleryMode === 'create' ? handleCreate : handleApplyTemplate}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Summary AI Modal */}
      {summaryModal && (
        <Modal title="Generate Professional Summary" onClose={() => { setSummaryModal(false); clearSummarySuggestions() }}>
          <div className="space-y-3">
            <Field label="Target Role">
              <input
                type="text"
                value={summaryForm.targetRole}
                onChange={(e) => setSummaryForm({ ...summaryForm, targetRole: e.target.value })}
                placeholder="e.g. Full Stack Developer"
                className="input text-sm"
              />
            </Field>
            <Field label="Key Strengths (comma separated)">
              <input
                type="text"
                value={summaryForm.strengths}
                onChange={(e) => setSummaryForm({ ...summaryForm, strengths: e.target.value })}
                placeholder="e.g. React, Django, problem-solving"
                className="input text-sm"
              />
            </Field>
            <Field label="Experience Level">
              <select
                value={summaryForm.yearsExp}
                onChange={(e) => setSummaryForm({ ...summaryForm, yearsExp: e.target.value })}
                className="input text-sm"
              >
                <option value="entry-level">Entry-level / Fresh grad</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </Field>
            <button
              onClick={() => generateSummary(summaryForm.targetRole, summaryForm.strengths.split(',').map(s => s.trim()), summaryForm.yearsExp)}
              disabled={isGenerating || !summaryForm.targetRole}
              className="w-full py-2 bg-brand-yellow text-brand-black font-semibold rounded-lg text-sm disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : '✨ Generate Summaries'}
            </button>

            {summarySuggestions.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-gray-600">Pick a variation:</p>
                {summarySuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { handleSectionChange('summary', s.text); setSummaryModal(false); clearSummarySuggestions() }}
                    className="w-full text-left text-xs p-3 border border-gray-200 rounded-lg hover:border-brand-yellow hover:bg-yellow-50 transition-all"
                  >
                    <span className="text-gray-400 uppercase text-[10px] font-bold block mb-1">{s.tone}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor Tab Components
// ---------------------------------------------------------------------------

function InfoTab({ resume, onChange }) {
  const info = resume.content.personalInfo || {}
  const update = (field, value) => onChange('personalInfo', { ...info, [field]: value })

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Resume Title</p>
      <input
        type="text"
        value={resume.title}
        onChange={(e) => useResumeStore.getState().updateCurrentResume({ title: e.target.value })}
        className="input text-sm w-full"
        placeholder="My Resume"
      />

      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-4">Personal Info</p>
      <Field label="Full Name"><input type="text" value={info.name || ''} onChange={(e) => update('name', e.target.value)} className="input text-sm" placeholder="Juan dela Cruz" /></Field>
      <Field label="Job Title / Current Role"><input type="text" value={info.title || ''} onChange={(e) => update('title', e.target.value)} className="input text-sm" placeholder="e.g. Full Stack Developer" /></Field>
      <Field label="Email"><input type="email" value={info.email || ''} onChange={(e) => update('email', e.target.value)} className="input text-sm" placeholder="juan@email.com" /></Field>
      <Field label="Phone"><input type="text" value={info.phone || ''} onChange={(e) => update('phone', e.target.value)} className="input text-sm" placeholder="+63 9XX XXX XXXX" /></Field>
      <Field label="Location"><input type="text" value={info.location || ''} onChange={(e) => update('location', e.target.value)} className="input text-sm" placeholder="Manila, Philippines" /></Field>
      <Field label="LinkedIn URL"><input type="text" value={info.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} className="input text-sm" placeholder="linkedin.com/in/username" /></Field>
      <Field label="GitHub URL"><input type="text" value={info.github || ''} onChange={(e) => update('github', e.target.value)} className="input text-sm" placeholder="github.com/username" /></Field>
      <Field label="Portfolio / Website"><input type="text" value={info.website || ''} onChange={(e) => update('website', e.target.value)} className="input text-sm" placeholder="https://myportfolio.com" /></Field>
    </div>
  )
}

function SummaryTab({ resume, onChange, isGenerating: _isGenerating, suggestions: _suggestions, onGenerate, onPickSuggestion: _onPickSuggestion, onClear: _onClear }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">Professional Summary</label>
        <button
          onClick={onGenerate}
          className="text-xs px-2 py-1 bg-brand-yellow text-brand-black rounded font-medium hover:bg-yellow-400 transition-colors"
        >
          ✨ AI Generate
        </button>
      </div>
      <textarea
        value={resume.content.summary || ''}
        onChange={(e) => onChange('summary', e.target.value)}
        rows={6}
        className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:border-brand-yellow"
        placeholder="Write a 2-3 sentence professional summary, or use AI to generate one..."
      />
      <p className="text-xs text-gray-400">
        Tip: A good summary states your role, key strengths, and what you bring to an employer.
      </p>
    </div>
  )
}

function ExperienceTab({ resume, onAdd, onUpdate, onRemove, onAddBullet, onRemoveBullet, onOpenBulletAI, bulletSuggestions, bulletModal, isGenerating, onGenerateBullets, onPickBullet, onCloseBulletModal }) {
  const [achievementText, setAchievementText] = useState('')
  const exps = resume.content.experience || []

  return (
    <div className="space-y-4">
      {exps.map((exp) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-700">{exp.title || exp.company || 'New Entry'}</p>
            <button onClick={() => onRemove(exp.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Job Title"><input type="text" value={exp.title} onChange={(e) => onUpdate(exp.id, { title: e.target.value })} className="input text-xs" placeholder="Software Developer" /></Field>
            <Field label="Company"><input type="text" value={exp.company} onChange={(e) => onUpdate(exp.id, { company: e.target.value })} className="input text-xs" placeholder="Tech Corp" /></Field>
            <Field label="Start Date"><input type="text" value={exp.startDate} onChange={(e) => onUpdate(exp.id, { startDate: e.target.value })} className="input text-xs" placeholder="Jan 2023" /></Field>
            <Field label="End Date">
              <input type="text" value={exp.current ? '' : exp.endDate} onChange={(e) => onUpdate(exp.id, { endDate: e.target.value })} className="input text-xs" placeholder="Present" disabled={exp.current} />
              <label className="flex items-center gap-1 mt-1 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={(e) => onUpdate(exp.id, { current: e.target.checked })} className="w-3 h-3" />
                <span className="text-xs text-gray-500">Current</span>
              </label>
            </Field>
          </div>
          <Field label="Location"><input type="text" value={exp.location || ''} onChange={(e) => onUpdate(exp.id, { location: e.target.value })} className="input text-xs" placeholder="Manila, Philippines" /></Field>

          {/* Bullets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Bullet Points</label>
              <button
                onClick={() => onOpenBulletAI(exp.id, exp.title)}
                className="text-xs text-brand-black font-medium hover:text-yellow-600"
              >
                ✨ AI Bullets
              </button>
            </div>
            <ul className="space-y-1 mb-2">
              {(exp.bullets || []).map((b, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <span className="text-gray-300 flex-shrink-0 mt-0.5">•</span>
                  <span className="flex-1">{b}</span>
                  <button onClick={() => onRemoveBullet(exp.id, i)} className="text-red-300 hover:text-red-500 flex-shrink-0">✕</button>
                </li>
              ))}
            </ul>
            <AddBulletInline onAdd={(bullet) => onAddBullet(exp.id, bullet)} />
          </div>

          {/* Bullet AI modal (inline) */}
          {bulletModal?.expId === exp.id && (
            <div className="mt-2 border border-yellow-200 rounded-lg p-3 bg-yellow-50 space-y-2">
              <p className="text-xs font-semibold text-gray-700">✨ AI Bullet Generator</p>
              <textarea
                value={achievementText}
                onChange={(e) => setAchievementText(e.target.value)}
                rows={2}
                className="w-full text-xs border border-gray-200 rounded p-2 resize-none focus:outline-none focus:border-brand-yellow"
                placeholder="Describe what you did/achieved (e.g. Built a REST API for mobile app, reduced load time by 40%)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onGenerateBullets(achievementText)}
                  disabled={isGenerating || !achievementText.trim()}
                  className="flex-1 text-xs py-1.5 bg-brand-yellow text-brand-black font-semibold rounded disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                <button onClick={onCloseBulletModal} className="text-xs text-gray-400 hover:text-gray-600 px-2">Cancel</button>
              </div>
              {bulletSuggestions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-600">Pick one:</p>
                  {bulletSuggestions.map((b, i) => (
                    <button
                      key={i}
                      onClick={() => { onPickBullet(b); setAchievementText('') }}
                      className="w-full text-left text-xs p-2 border border-gray-200 bg-white rounded hover:border-brand-yellow hover:bg-yellow-50 transition-all"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button onClick={onAdd} className="w-full text-xs py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand-yellow hover:text-brand-yellow transition-all">
        + Add Experience
      </button>
    </div>
  )
}

function AddBulletInline({ onAdd }) {
  const [val, setVal] = useState('')
  const handle = () => { if (val.trim()) { onAdd(val.trim()); setVal('') } }
  return (
    <div className="flex gap-1.5">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handle()}
        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-brand-yellow"
        placeholder="Type a bullet point and press Enter"
      />
      <button onClick={handle} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Add</button>
    </div>
  )
}

function EducationTab({ resume, onAdd, onUpdate, onRemove }) {
  const edus = resume.content.education || []
  return (
    <div className="space-y-4">
      {edus.map((edu) => (
        <div key={edu.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-700">{edu.school || 'New Entry'}</p>
            <button onClick={() => onRemove(edu.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <Field label="School / University"><input type="text" value={edu.school} onChange={(e) => onUpdate(edu.id, { school: e.target.value })} className="input text-xs" placeholder="University of the Philippines" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Degree"><input type="text" value={edu.degree} onChange={(e) => onUpdate(edu.id, { degree: e.target.value })} className="input text-xs" placeholder="BS Computer Science" /></Field>
            <Field label="Field"><input type="text" value={edu.field || ''} onChange={(e) => onUpdate(edu.id, { field: e.target.value })} className="input text-xs" placeholder="Computer Science" /></Field>
            <Field label="Start"><input type="text" value={edu.startDate} onChange={(e) => onUpdate(edu.id, { startDate: e.target.value })} className="input text-xs" placeholder="2020" /></Field>
            <Field label="End"><input type="text" value={edu.endDate} onChange={(e) => onUpdate(edu.id, { endDate: e.target.value })} className="input text-xs" placeholder="2024" /></Field>
          </div>
          <Field label="GPA (optional)"><input type="text" value={edu.gpa || ''} onChange={(e) => onUpdate(edu.id, { gpa: e.target.value })} className="input text-xs" placeholder="3.8" /></Field>
        </div>
      ))}
      <button onClick={onAdd} className="w-full text-xs py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand-yellow hover:text-brand-yellow transition-all">
        + Add Education
      </button>
    </div>
  )
}

function SkillsTab({ resume, onUpdate }) {
  const skills = resume.content.skills || {}
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Enter skills separated by commas. They will appear automatically in the resume.</p>
      {['technical', 'tools', 'soft'].map((type) => (
        <Field key={type} label={type === 'technical' ? 'Technical Skills' : type === 'tools' ? 'Tools & Technologies' : 'Soft Skills'}>
          <textarea
            value={(skills[type] || []).join(', ')}
            onChange={(e) => onUpdate(type, e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:border-brand-yellow"
            placeholder={SKILL_PLACEHOLDER[type]}
          />
        </Field>
      ))}
    </div>
  )
}

function ProjectsTab({ resume, onAdd, onUpdate, onRemove }) {
  const projects = resume.content.projects || []
  return (
    <div className="space-y-4">
      {projects.map((proj) => (
        <div key={proj.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-700">{proj.name || 'New Project'}</p>
            <button onClick={() => onRemove(proj.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <Field label="Project Name"><input type="text" value={proj.name} onChange={(e) => onUpdate(proj.id, { name: e.target.value })} className="input text-xs" placeholder="CodeCompass" /></Field>
          <Field label="Tech Stack (comma separated)">
            <input type="text" value={(proj.tech || []).join(', ')} onChange={(e) => onUpdate(proj.id, { tech: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="input text-xs" placeholder="React, Django, PostgreSQL" />
          </Field>
          <Field label="Link (optional)"><input type="text" value={proj.link || ''} onChange={(e) => onUpdate(proj.id, { link: e.target.value })} className="input text-xs" placeholder="https://github.com/..." /></Field>
          <Field label="Description">
            <textarea value={proj.description || ''} onChange={(e) => onUpdate(proj.id, { description: e.target.value })} rows={2} className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:border-brand-yellow" placeholder="Brief description of the project and your role..." />
          </Field>
        </div>
      ))}
      <button onClick={onAdd} className="w-full text-xs py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand-yellow hover:text-brand-yellow transition-all">
        + Add Project
      </button>
    </div>
  )
}

function CertsTab({ resume, onAdd, onUpdate, onRemove }) {
  const certs = resume.content.certifications || []
  return (
    <div className="space-y-4">
      {certs.map((cert) => (
        <div key={cert.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-700">{cert.name || 'New Certification'}</p>
            <button onClick={() => onRemove(cert.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <Field label="Certification Name"><input type="text" value={cert.name} onChange={(e) => onUpdate(cert.id, { name: e.target.value })} className="input text-xs" placeholder="AWS Certified Developer" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Issuer"><input type="text" value={cert.issuer || ''} onChange={(e) => onUpdate(cert.id, { issuer: e.target.value })} className="input text-xs" placeholder="Amazon" /></Field>
            <Field label="Date"><input type="text" value={cert.date || ''} onChange={(e) => onUpdate(cert.id, { date: e.target.value })} className="input text-xs" placeholder="Mar 2024" /></Field>
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="w-full text-xs py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand-yellow hover:text-brand-yellow transition-all">
        + Add Certification
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared UI helpers
// ---------------------------------------------------------------------------
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
