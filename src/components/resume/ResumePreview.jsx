/**
 * ResumePreview — five professional, research-backed resume templates.
 * Each accepts { content, color } props for full accent customization.
 * Wrapped in forwardRef for react-to-print PDF export.
 *
 * Template design follows 2025 standards:
 *  - Standard ATS section headings
 *  - System-safe fonts (Arial/Georgia)
 *  - SVG contact icons (no emoji)
 *  - Dark body text for ATS readability
 *
 * SAMPLE_CONTENT, TEMPLATES and COLOR_PRESETS are intentionally exported
 * alongside the default component for use in TemplateGallery and ResumePage.
 */
/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Sample content for gallery thumbnails
// ---------------------------------------------------------------------------
export const SAMPLE_CONTENT = {
  personalInfo: {
    name: 'Juan dela Cruz',
    title: 'Full Stack Developer',
    email: 'juan@email.com',
    phone: '+63 912 345 6789',
    location: 'Manila, Philippines',
    linkedin: 'linkedin.com/in/juan',
    github: 'github.com/juan',
  },
  summary:
    'Full-stack developer with 3 years of experience building scalable web applications using React and Django. Passionate about clean code, great UX, and impactful software.',
  experience: [
    {
      id: '1',
      title: 'Software Developer',
      company: 'Tech Corp',
      location: 'Manila',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      bullets: [
        'Built REST APIs serving 50K+ daily active users, reducing latency by 35%',
        'Reduced page load time by 40% through Redis caching strategy',
        'Led a team of 3 developers on mobile platform migration project',
      ],
    },
    {
      id: '2',
      title: 'Junior Developer',
      company: 'Startup PH',
      location: 'Makati',
      startDate: 'Jun 2021',
      endDate: 'Dec 2021',
      current: false,
      bullets: [
        'Developed React dashboards for business analytics',
        'Integrated payment gateway APIs for e-commerce platform',
      ],
    },
  ],
  education: [
    {
      id: '1',
      school: 'University of the Philippines',
      degree: 'BS Computer Science',
      field: '',
      startDate: '2017',
      endDate: '2021',
      gpa: '3.8',
    },
  ],
  skills: {
    technical: ['React', 'Django', 'Python', 'PostgreSQL', 'TypeScript'],
    soft: ['Leadership', 'Communication', 'Problem-solving'],
    tools: ['Git', 'Docker', 'AWS', 'Figma'],
  },
  projects: [
    {
      id: '1',
      name: 'CodeCompass',
      description: 'AI-powered career guide for CCS students in the Philippines',
      tech: ['React', 'Django', 'Groq AI'],
      link: '',
    },
  ],
  certifications: [
    { id: '1', name: 'AWS Certified Developer', issuer: 'Amazon', date: '2023' },
  ],
}

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------
export const TEMPLATES = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Dark sidebar with structured main column. Clean and tech-forward.',
    tag: 'Most Popular',
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Bold accent header bar. Commands attention for senior-level roles.',
    tag: 'Professional',
  },
  {
    id: 'classic',
    label: 'Classic',
    description: 'Traditional centered serif layout. Trusted across all industries.',
    tag: 'ATS Safe',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Ultra-clean and spacious. Let your achievements speak.',
    tag: 'Clean',
  },
  {
    id: 'sidebar-blue',
    label: 'Blueprint',
    description: 'Light sidebar with strong accent border. Balanced and structured.',
    tag: 'Creative',
  },
]

export const COLOR_PRESETS = [
  { label: 'Navy', value: '#1A2F5E' },
  { label: 'Slate', value: '#374151' },
  { label: 'Emerald', value: '#065F46' },
  { label: 'Indigo', value: '#3730A3' },
  { label: 'Rose', value: '#9F1239' },
]

// ---------------------------------------------------------------------------
// SVG Icon components — print-safe, no external dependencies
// ---------------------------------------------------------------------------
function MailIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function PhoneIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.33 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.12 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MapPinIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function LinkedInIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GitHubIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{ flexShrink: 0, display: 'block' }}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GlobeIcon({ s = 9, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// Renders icon + text row; skips when text is empty
function ContactRow({ icon, text, className = '' }) {
  if (!text) return null
  return (
    <div className={`flex items-start gap-1.5 ${className}`}>
      <span style={{ marginTop: '1px' }}>{icon}</span>
      <span style={{ fontSize: '10px', lineHeight: '1.4', wordBreak: 'break-all' }}>{text}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 1 — Modern (dark sidebar + structured main)
// ---------------------------------------------------------------------------
function ModernTemplate({ content, color = '#1A2F5E' }) {
  const {
    personalInfo: p = {},
    summary,
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
  } = content

  return (
    <div style={{
      display: 'flex', minHeight: '1056px', backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.55',
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: '240px', flexShrink: 0, backgroundColor: color, color: '#fff',
        padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        {/* Name & title */}
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1.15', color: '#fff', letterSpacing: '-0.01em' }}>
            {p.name || 'Your Name'}
          </div>
          {p.title && (
            <div style={{ fontSize: '10px', marginTop: '5px', color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {p.title}
            </div>
          )}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'rgba(255,255,255,0.78)' }}>
            <ContactRow icon={<MailIcon c="rgba(255,255,255,0.55)" />} text={p.email} />
            <ContactRow icon={<PhoneIcon c="rgba(255,255,255,0.55)" />} text={p.phone} />
            <ContactRow icon={<MapPinIcon c="rgba(255,255,255,0.55)" />} text={p.location} />
            <ContactRow icon={<LinkedInIcon c="rgba(255,255,255,0.55)" />} text={p.linkedin} />
            <ContactRow icon={<GitHubIcon c="rgba(255,255,255,0.55)" />} text={p.github} />
            <ContactRow icon={<GlobeIcon c="rgba(255,255,255,0.55)" />} text={p.website} />
          </div>
        </div>

        {/* Skills */}
        {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              Skills
            </div>
            {skills.technical?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>Technical</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {skills.technical.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '9px', padding: '2px 7px', borderRadius: '3px',
                      backgroundColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.88)', fontWeight: 500,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools?.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Tools</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{skills.tools.join(' · ')}</div>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Soft Skills</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{skills.soft.join(', ')}</div>
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              Certifications
            </div>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ marginBottom: '7px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>{cert.name}</div>
                {cert.issuer && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '28px 24px', color: '#1a1a1a' }}>
        {summary && (
          <ModernSection title="Professional Summary" color={color}>
            <p style={{ color: '#444', lineHeight: '1.65' }}>{summary}</p>
          </ModernSection>
        )}

        {experience.length > 0 && (
          <ModernSection title="Professional Experience" color={color}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11.5px', color: '#111' }}>{exp.title}</span>
                  <span style={{ fontSize: '9.5px', color: '#888', flexShrink: 0, marginLeft: '8px' }}>
                    {exp.startDate}{exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.company && (
                  <div style={{ fontSize: '10px', fontWeight: 600, color, marginBottom: '4px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                )}
                <ul style={{ margin: '2px 0 0', padding: 0, listStyle: 'none' }}>
                  {(exp.bullets || []).map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: '7px', marginBottom: '2px', color: '#444' }}>
                      <span style={{ flexShrink: 0, color, fontSize: '9px', lineHeight: '1.8', fontWeight: 700 }}>▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ModernSection>
        )}

        {education.length > 0 && (
          <ModernSection title="Education" color={color}>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                  <span style={{ fontSize: '9.5px', color: '#888', flexShrink: 0, marginLeft: '8px' }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                </div>
                <div style={{ color: '#555', fontSize: '10.5px' }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</div>
              </div>
            ))}
          </ModernSection>
        )}

        {projects.length > 0 && (
          <ModernSection title="Projects" color={color}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.tech?.length > 0 && <span style={{ fontSize: '10px', color: '#666' }}> · {proj.tech.join(', ')}</span>}
                {proj.description && <p style={{ margin: '2px 0 0', color: '#555' }}>{proj.description}</p>}
              </div>
            ))}
          </ModernSection>
        )}
      </div>
    </div>
  )
}

function ModernSection({ title, color, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color, whiteSpace: 'nowrap', margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1px', backgroundColor: color, opacity: 0.2 }} />
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 2 — Executive (bold header bar, single column)
// ---------------------------------------------------------------------------
function ExecutiveTemplate({ content, color = '#1A2F5E' }) {
  const {
    personalInfo: p = {},
    summary,
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
  } = content

  return (
    <div style={{
      minHeight: '1056px', backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.55', color: '#1a1a1a',
    }}>
      {/* Header */}
      <div style={{ backgroundColor: color, padding: '30px 36px 26px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: '1.1', letterSpacing: '-0.02em', margin: 0 }}>
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <div style={{ fontSize: '11px', marginTop: '5px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
            {p.title}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '12px' }}>
          {p.email && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MailIcon c="rgba(255,255,255,0.6)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.email}</span></div>}
          {p.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><PhoneIcon c="rgba(255,255,255,0.6)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.phone}</span></div>}
          {p.location && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPinIcon c="rgba(255,255,255,0.6)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.location}</span></div>}
          {p.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LinkedInIcon c="rgba(255,255,255,0.6)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.linkedin}</span></div>}
          {p.github && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><GitHubIcon c="rgba(255,255,255,0.7)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.github}</span></div>}
          {p.website && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><GlobeIcon c="rgba(255,255,255,0.6)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.website}</span></div>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {summary && (
          <ExecSection title="Professional Summary" color={color}>
            <p style={{ color: '#444', lineHeight: '1.65' }}>{summary}</p>
          </ExecSection>
        )}

        {experience.length > 0 && (
          <ExecSection title="Professional Experience" color={color}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11.5px' }}>
                    {exp.title}
                    {exp.company && <span style={{ fontWeight: 400, color: '#555' }}> — {exp.company}</span>}
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#888', flexShrink: 0, marginLeft: '8px' }}>
                    {exp.startDate}{exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.location && <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#888', marginBottom: '4px' }}>{exp.location}</div>}
                <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                  {(exp.bullets || []).map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '2px', color: '#444' }}>
                      <span style={{ flexShrink: 0, color, fontSize: '8px', lineHeight: '2', fontWeight: 900 }}>◆</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ExecSection>
        )}

        {(education.length > 0 || skills.technical?.length > 0 || skills.tools?.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {education.length > 0 && (
              <ExecSection title="Education" color={color}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                    <div style={{ color: '#555' }}>{edu.school}</div>
                    <div style={{ fontSize: '9.5px', color: '#888' }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</div>
                  </div>
                ))}
              </ExecSection>
            )}
            {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
              <ExecSection title="Skills" color={color}>
                {skills.technical?.length > 0 && <p style={{ marginBottom: '4px' }}><strong>Technical:</strong> {skills.technical.join(', ')}</p>}
                {skills.tools?.length > 0 && <p style={{ marginBottom: '4px' }}><strong>Tools:</strong> {skills.tools.join(', ')}</p>}
                {skills.soft?.length > 0 && <p><strong>Soft Skills:</strong> {skills.soft.join(', ')}</p>}
              </ExecSection>
            )}
          </div>
        )}

        {projects.length > 0 && (
          <ExecSection title="Projects" color={color}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.tech?.length > 0 && <span style={{ color: '#666' }}> — {proj.tech.join(', ')}</span>}
                {proj.description && <p style={{ margin: '2px 0 0', color: '#555' }}>{proj.description}</p>}
              </div>
            ))}
          </ExecSection>
        )}

        {certifications.length > 0 && (
          <ExecSection title="Certifications" color={color}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {certifications.map((cert) => (
                <span key={cert.id} style={{
                  fontSize: '10px', padding: '3px 11px', borderRadius: '20px',
                  border: `1.5px solid ${color}`, color, fontWeight: 500,
                }}>
                  {cert.name}{cert.issuer ? ` · ${cert.issuer}` : ''}{cert.date ? ` (${cert.date})` : ''}
                </span>
              ))}
            </div>
          </ExecSection>
        )}
      </div>
    </div>
  )
}

function ExecSection({ title, color, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color, whiteSpace: 'nowrap', margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1.5px', backgroundColor: color, opacity: 0.18 }} />
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 3 — Classic (traditional serif, single column)
// ---------------------------------------------------------------------------
function ClassicTemplate({ content, color = '#1A2F5E' }) {
  const {
    personalInfo: p = {},
    summary,
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
  } = content

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean)

  return (
    <div style={{
      minHeight: '1056px', backgroundColor: '#fff', padding: '36px 40px',
      fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '11px', lineHeight: '1.6', color: '#111',
    }}>
      {/* Centered header */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color, margin: '0 0 4px' }}>
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#555', margin: '0 0 6px' }}>{p.title}</p>
        )}
        {contactParts.length > 0 && (
          <p style={{ fontSize: '10px', color: '#666', margin: '0 0 10px' }}>
            {contactParts.join('  |  ')}
          </p>
        )}
        {/* Double rule */}
        <div style={{ height: '2.5px', backgroundColor: color }} />
        <div style={{ height: '1px', backgroundColor: '#d1d5db', marginTop: '2px' }} />
      </div>

      {summary && (
        <ClassicSection title="Professional Summary" color={color}>
          <p style={{ color: '#333', lineHeight: '1.7' }}>{summary}</p>
        </ClassicSection>
      )}

      {experience.length > 0 && (
        <ClassicSection title="Professional Experience" color={color}>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                <span>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</span>
                <span style={{ fontWeight: 400, fontSize: '10px', color: '#666', flexShrink: 0, marginLeft: '8px' }}>
                  {exp.startDate}{exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}
                </span>
              </div>
              {exp.location && <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#777', margin: '1px 0 3px' }}>{exp.location}</p>}
              <ul style={{ margin: '3px 0 0 12px', padding: 0, listStyle: 'none' }}>
                {(exp.bullets || []).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '2px', color: '#333' }}>
                    <span style={{ flexShrink: 0, color: '#888' }}>—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ClassicSection>
      )}

      {education.length > 0 && (
        <ClassicSection title="Education" color={color}>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                <span>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span style={{ fontWeight: 400, fontSize: '10px', color: '#666', flexShrink: 0, marginLeft: '8px' }}>
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
                </span>
              </div>
              <p style={{ color: '#555', margin: '1px 0 0' }}>{edu.school}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </ClassicSection>
      )}

      {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
        <ClassicSection title="Skills" color={color}>
          {skills.technical?.length > 0 && <p style={{ margin: '0 0 2px' }}><strong>Technical:</strong> {skills.technical.join(', ')}</p>}
          {skills.tools?.length > 0 && <p style={{ margin: '0 0 2px' }}><strong>Tools & Platforms:</strong> {skills.tools.join(', ')}</p>}
          {skills.soft?.length > 0 && <p style={{ margin: 0 }}><strong>Soft Skills:</strong> {skills.soft.join(', ')}</p>}
        </ClassicSection>
      )}

      {projects.length > 0 && (
        <ClassicSection title="Projects" color={color}>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '7px' }}>
              <span style={{ fontWeight: 700 }}>{proj.name}</span>
              {proj.tech?.length > 0 && <span style={{ color: '#555' }}> ({proj.tech.join(', ')})</span>}
              {proj.description && <p style={{ margin: '2px 0 0', color: '#444' }}>{proj.description}</p>}
            </div>
          ))}
        </ClassicSection>
      )}

      {certifications.length > 0 && (
        <ClassicSection title="Certifications" color={color}>
          {certifications.map((cert) => (
            <p key={cert.id} style={{ margin: '0 0 2px' }}>
              <strong>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#555' }}> — {cert.issuer}</span>}
              {cert.date && <span style={{ color: '#888', fontSize: '10px' }}> ({cert.date})</span>}
            </p>
          ))}
        </ClassicSection>
      )}
    </div>
  )
}

function ClassicSection({ title, color = '#374151', children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{
        fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
        color, borderBottom: `1.5px solid ${color}`, paddingBottom: '3px', marginBottom: '8px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 4 — Minimal (ultra-clean, generous whitespace)
// ---------------------------------------------------------------------------
function MinimalTemplate({ content, color = '#374151' }) {
  const {
    personalInfo: p = {},
    summary,
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
  } = content

  const primaryContact = [p.email, p.phone, p.location].filter(Boolean)
  const links = [p.linkedin, p.github, p.website].filter(Boolean)

  return (
    <div style={{
      minHeight: '1056px', backgroundColor: '#fff', padding: '44px 50px',
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.6', color: '#1a1a1a',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 300, color: '#111', letterSpacing: '-0.02em', lineHeight: '1.1', margin: '0 0 5px' }}>
          {p.name || 'Your Name'}
        </h1>
        {p.title && <p style={{ fontSize: '12px', fontWeight: 600, color, margin: '0 0 8px' }}>{p.title}</p>}
        {primaryContact.length > 0 && (
          <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px' }}>{primaryContact.join(' · ')}</p>
        )}
        {links.length > 0 && (
          <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{links.join(' · ')}</p>
        )}
      </div>

      {summary && (
        <MinSection title="About" color={color}>
          <p style={{ color: '#444', lineHeight: '1.7' }}>{summary}</p>
        </MinSection>
      )}

      {experience.length > 0 && (
        <MinSection title="Experience" color={color}>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '11.5px' }}>{exp.title}</span>
                <span style={{ fontSize: '9.5px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>
                  {exp.startDate}{exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}
                </span>
              </div>
              {exp.company && <p style={{ color: '#777', margin: '2px 0 6px', fontSize: '10.5px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {(exp.bullets || []).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '3px', color: '#444' }}>
                    <span style={{ flexShrink: 0, color: '#ccc' }}>–</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </MinSection>
      )}

      {education.length > 0 && (
        <MinSection title="Education" color={color}>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span style={{ fontSize: '9.5px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
              </div>
              <p style={{ color: '#777', margin: '1px 0 0' }}>{edu.school}{edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </MinSection>
      )}

      {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
        <MinSection title="Skills" color={color}>
          {skills.technical?.length > 0 && <p style={{ margin: '0 0 3px' }}><strong>Technical — </strong><span style={{ color: '#555' }}>{skills.technical.join(', ')}</span></p>}
          {skills.tools?.length > 0 && <p style={{ margin: '0 0 3px' }}><strong>Tools — </strong><span style={{ color: '#555' }}>{skills.tools.join(', ')}</span></p>}
          {skills.soft?.length > 0 && <p style={{ margin: 0 }}><strong>Soft — </strong><span style={{ color: '#555' }}>{skills.soft.join(', ')}</span></p>}
        </MinSection>
      )}

      {projects.length > 0 && (
        <MinSection title="Projects" color={color}>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>{proj.name}</span>
              {proj.tech?.length > 0 && <span style={{ color: '#999' }}>  ·  {proj.tech.join(', ')}</span>}
              {proj.description && <p style={{ margin: '2px 0 0', color: '#555' }}>{proj.description}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {certifications.length > 0 && (
        <MinSection title="Certifications" color={color}>
          {certifications.map((cert) => (
            <p key={cert.id} style={{ margin: '0 0 2px', color: '#555' }}>
              {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}{cert.date ? ` (${cert.date})` : ''}
            </p>
          ))}
        </MinSection>
      )}
    </div>
  )
}

function MinSection({ title, color = '#374151', children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '3px', height: '13px', borderRadius: '2px', flexShrink: 0, backgroundColor: color }} />
        <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color, margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 5 — Blueprint (light sidebar with accent border)
// ---------------------------------------------------------------------------
function SidebarBlueTemplate({ content, color = '#1A2F5E' }) {
  const {
    personalInfo: p = {},
    summary,
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
  } = content

  const sidebarBg = color + '0C' // ~5% opacity

  return (
    <div style={{
      display: 'flex', minHeight: '1056px', backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.55',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '235px', flexShrink: 0, padding: '28px 18px',
        backgroundColor: sidebarBg, borderRight: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column', gap: '18px',
      }}>
        {/* Name & title */}
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, lineHeight: '1.2', color, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {p.name || 'Your Name'}
          </h1>
          {p.title && <p style={{ fontSize: '10px', fontWeight: 500, color: '#555', margin: 0 }}>{p.title}</p>}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color, marginBottom: '7px', opacity: 0.7 }}>
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: '#555' }}>
            <ContactRow icon={<MailIcon c={color} s={8} />} text={p.email} />
            <ContactRow icon={<PhoneIcon c={color} s={8} />} text={p.phone} />
            <ContactRow icon={<MapPinIcon c={color} s={8} />} text={p.location} />
            <ContactRow icon={<LinkedInIcon c={color} s={8} />} text={p.linkedin} />
            <ContactRow icon={<GitHubIcon c={color} s={8} />} text={p.github} />
            <ContactRow icon={<GlobeIcon c={color} s={8} />} text={p.website} />
          </div>
        </div>

        {/* Skills */}
        {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color, marginBottom: '7px', opacity: 0.7 }}>
              Skills
            </div>
            {skills.technical?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#999', letterSpacing: '0.06em', marginBottom: '5px' }}>Technical</div>
                {skills.technical.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, backgroundColor: color }} />
                    <span style={{ fontSize: '10px', color: '#444' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {skills.tools?.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#999', letterSpacing: '0.06em', marginBottom: '4px' }}>Tools</div>
                <p style={{ fontSize: '10px', color: '#555', margin: 0 }}>{skills.tools.join(', ')}</p>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#999', letterSpacing: '0.06em', marginBottom: '4px' }}>Soft Skills</div>
                <p style={{ fontSize: '10px', color: '#555', margin: 0 }}>{skills.soft.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Education in sidebar */}
        {education.length > 0 && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color, marginBottom: '7px', opacity: 0.7 }}>
              Education
            </div>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: 600, fontSize: '10.5px', color: '#111', margin: '0 0 1px' }}>{edu.degree}</p>
                {edu.field && <p style={{ fontSize: '10px', color: '#555', margin: '0 0 1px' }}>{edu.field}</p>}
                <p style={{ fontSize: '10px', color: '#666', margin: '0 0 1px' }}>{edu.school}</p>
                <p style={{ fontSize: '9.5px', color: '#999', margin: 0 }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}{edu.gpa ? ` · ${edu.gpa}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications in sidebar */}
        {certifications.length > 0 && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color, marginBottom: '7px', opacity: 0.7 }}>
              Certifications
            </div>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ marginBottom: '7px' }}>
                <p style={{ fontWeight: 600, fontSize: '10px', color: '#111', margin: '0 0 1px' }}>{cert.name}</p>
                {cert.issuer && <p style={{ fontSize: '9.5px', color: '#777', margin: 0 }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '28px 24px', color: '#1a1a1a' }}>
        {summary && (
          <BlueprintSection title="Professional Summary" color={color}>
            <p style={{ color: '#444', lineHeight: '1.65' }}>{summary}</p>
          </BlueprintSection>
        )}

        {experience.length > 0 && (
          <BlueprintSection title="Work Experience" color={color}>
            {experience.map((exp) => (
              <div key={exp.id} style={{
                marginBottom: '14px', paddingLeft: '10px',
                borderLeft: `2px solid ${color}20`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11.5px' }}>{exp.title}</span>
                  <span style={{ fontSize: '9.5px', color: '#888', flexShrink: 0, marginLeft: '8px' }}>
                    {exp.startDate}{exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.company && (
                  <div style={{ fontSize: '10px', fontWeight: 600, color, marginBottom: '4px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                )}
                <ul style={{ margin: '2px 0 0', padding: 0, listStyle: 'none' }}>
                  {(exp.bullets || []).map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: '7px', marginBottom: '2px', color: '#444' }}>
                      <span style={{ flexShrink: 0, color, fontSize: '10px', lineHeight: '1.5', fontWeight: 700 }}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </BlueprintSection>
        )}

        {projects.length > 0 && (
          <BlueprintSection title="Projects" color={color}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.tech?.length > 0 && <span style={{ fontSize: '10px', color: '#666' }}> · {proj.tech.join(', ')}</span>}
                {proj.description && <p style={{ margin: '2px 0 0', color: '#555' }}>{proj.description}</p>}
              </div>
            ))}
          </BlueprintSection>
        )}
      </div>
    </div>
  )
}

function BlueprintSection({ title, color, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '4px', height: '16px', borderRadius: '2px', flexShrink: 0, backgroundColor: color }} />
        <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color, margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1px', backgroundColor: color, opacity: 0.12 }} />
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
const TEMPLATE_MAP = {
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  'sidebar-blue': SidebarBlueTemplate,
}

const ResumePreview = forwardRef(function ResumePreview(
  { resume, sampleMode = false, color: colorOverride },
  ref
) {
  const content = sampleMode ? SAMPLE_CONTENT : (resume?.content || {})
  const templateId = sampleMode ? resume : (resume?.template_name || 'modern')
  const color = colorOverride || content?._styling?.primaryColor || '#1A2F5E'
  const Template = TEMPLATE_MAP[templateId] || ModernTemplate

  return (
    <div ref={ref} style={{ width: '816px', backgroundColor: '#fff' }}>
      <Template content={content} color={color} />
    </div>
  )
})

export default ResumePreview
