/**
 * TemplateGallery — modal for picking a resume template before creating,
 * or switching templates mid-edit.
 *
 * Shows live miniature previews of all 5 templates using sample data.
 * Also lets the user pick an accent color preset.
 */
import { useState, useRef, useLayoutEffect } from 'react'
import ResumePreview, { TEMPLATES, COLOR_PRESETS } from './ResumePreview'

export default function TemplateGallery({ onSelect, onClose, initialTemplate = 'modern', initialColor = '#1A2F5E', mode = 'create' }) {
  const [selected, setSelected] = useState(initialTemplate)
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [resumeTitle, setResumeTitle] = useState('')
  const [hoveredTemplate, setHoveredTemplate] = useState(null)

  const handleConfirm = () => {
    if (mode === 'create' && !resumeTitle.trim()) return
    onSelect({
      templateId: selected,
      color: selectedColor,
      title: resumeTitle.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Choose a Template' : 'Change Template'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {mode === 'create' ? 'Pick a layout, then name your resume.' : 'Switching templates keeps all your data.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>

        {/* Color picker row */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accent Color:</span>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                title={preset.label}
                onClick={() => setSelectedColor(preset.value)}
                className={`w-7 h-7 rounded-full transition-all ${
                  selectedColor === preset.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: preset.value }}
              />
            ))}
            {/* Custom color picker */}
            <label title="Custom color" className="relative w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:scale-110 transition-all overflow-hidden">
              <span className="text-gray-400 text-lg leading-none">+</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedColor }} />
            <span className="text-xs font-mono text-gray-500">{selectedColor}</span>
          </div>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATES.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                color={selectedColor}
                isSelected={selected === tmpl.id}
                isHovered={hoveredTemplate === tmpl.id}
                onSelect={() => setSelected(tmpl.id)}
                onHover={(v) => setHoveredTemplate(v ? tmpl.id : null)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 bg-white">
          {mode === 'create' ? (
            <>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder="Name your resume (e.g. Software Dev Resume)"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-yellow"
                autoFocus
              />
              <button
                onClick={handleConfirm}
                disabled={!resumeTitle.trim()}
                className="px-5 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Create Resume →
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 flex-1">
                Selected: <span className="font-semibold text-gray-800">{TEMPLATES.find(t => t.id === selected)?.label}</span>
              </p>
              <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors"
              >
                Apply Template
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual template card with miniature preview
// ---------------------------------------------------------------------------
const RESUME_WIDTH = 816

function TemplateCard({ template, color, isSelected, isHovered: _isHovered, onSelect, onHover }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(0.33)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / RESUME_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <button
      ref={containerRef}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'border-brand-yellow shadow-lg shadow-yellow-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Tag badge */}
      <div
        className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-brand-yellow text-brand-black' : 'bg-gray-900 text-white'
        }`}
      >
        {template.tag}
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center shadow">
          <svg className="w-3 h-3 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Miniature preview — scales resume to exactly fill card width */}
      <div className="relative overflow-hidden bg-white" style={{ height: '260px' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${RESUME_WIDTH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}>
          <ResumePreview resume={template.id} sampleMode color={color} />
        </div>
      </div>

      {/* Card footer */}
      <div className={`px-4 py-3 border-t ${isSelected ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        <p className="font-bold text-gray-900 text-sm">{template.label}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-tight">{template.description}</p>
      </div>
    </button>
  )
}
