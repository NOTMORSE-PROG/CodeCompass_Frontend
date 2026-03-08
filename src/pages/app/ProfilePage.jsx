import { useState, useEffect } from 'react'
import useAuthStore from '../../stores/authStore'
import { profileApi } from '../../api/profile'
import { PencilIcon, CheckIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'Django', 'Node.js', 'Java', 'C++',
  'SQL', 'HTML/CSS', 'Git', 'Machine Learning', 'Data Analysis',
  'Networking', 'Linux', 'Cloud (AWS/GCP)', 'Mobile Development',
]

const CAREER_OPTIONS = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist / Analyst', 'Machine Learning Engineer', 'DevOps / Cloud Engineer',
  'Mobile Developer', 'Cybersecurity Analyst', 'UI/UX Designer',
  'IT Project Manager', 'Network Engineer', 'Database Administrator',
]

const PROGRAMS = ['BSCS', 'BSIT', 'BSIS', 'BSCE', 'Undecided']

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Student fields
  const [yearLevel, setYearLevel] = useState('')
  const [program, setProgram] = useState('')
  const [targetCareer, setTargetCareer] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // Mentor fields
  const [headline, setHeadline] = useState('')
  const [mentorType, setMentorType] = useState('industry')
  const [isVerified, setIsVerified] = useState(false)

  const isStudent = user?.role === 'incoming_student' || user?.role === 'undergraduate'
  const isMentor = user?.role === 'mentor'

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (isStudent) {
          const { data } = await profileApi.getStudentProfile()
          setYearLevel(data.yearLevel || '')
          setProgram(data.program || '')
          setTargetCareer(data.targetCareer || '')
          setSelectedSkills(data.currentSkills || [])
          setBio(data.bio || '')
          setLinkedinUrl(data.linkedinUrl || '')
          setGithubUrl(data.githubUrl || '')
        } else if (isMentor) {
          const { data } = await profileApi.getOwnMentorProfile()
          setHeadline(data.headline || '')
          setMentorType(data.mentorType || 'industry')
          setIsVerified(data.isVerified || false)
        }
      } catch {
        /* profile may not exist yet */
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isStudent, isMentor])

  const toggleSkill = (skill) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isStudent) {
        await profileApi.updateStudentProfile({
          year_level: yearLevel,
          program,
          target_career: targetCareer,
          current_skills: selectedSkills,
          bio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
        })
      } else if (isMentor) {
        await profileApi.updateOwnMentorProfile({ headline, mentor_type: mentorType })
      }
      toast.success('Profile saved!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const roleLabel = {
    incoming_student: 'Incoming Student',
    undergraduate: 'Undergraduate Student',
    mentor: 'Mentor',
    admin: 'Admin',
  }[user?.role] || 'User'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-black">My Profile</h1>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
            editing
              ? 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark'
              : 'border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
          }`}
        >
          {editing ? (
            <><CheckIcon className="w-4 h-4" />{isSaving ? 'Saving...' : 'Save Changes'}</>
          ) : (
            <><PencilIcon className="w-4 h-4" />Edit Profile</>
          )}
        </button>
      </div>

      {/* Avatar + basic info */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-black text-2xl">{user?.fullName?.[0] || '?'}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-black">{user?.fullName || 'Student'}</h2>
            <p className="text-brand-gray-mid text-sm">{user?.email}</p>
            <span className="badge-yellow text-xs mt-1 inline-block">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Student profile */}
      {isStudent && (
        <>
          <div className="card mb-4">
            <h3 className="font-bold text-brand-black mb-4">Academic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Year Level</label>
                <select
                  disabled={!editing}
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select year level</option>
                  {user?.role === 'incoming_student' && <option value="incoming">Incoming / K-12 Graduate</option>}
                  {user?.role === 'undergraduate' && ['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Program</label>
                <select
                  disabled={!editing}
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select program</option>
                  {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Target Career Path</label>
              <select
                disabled={!editing}
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select target career</option>
                {CAREER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Bio</label>
              <textarea
                disabled={!editing}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none
                           disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  disabled={!editing}
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow
                             disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">GitHub URL</label>
                <input
                  type="url"
                  disabled={!editing}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow
                             disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <h3 className="font-bold text-brand-black mb-1">Current Skills</h3>
            <p className="text-brand-gray-mid text-xs mb-4">
              {editing ? 'Click the skills you already know.' : 'Edit your profile to update your skills.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  disabled={!editing}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border disabled:cursor-not-allowed ${
                    selectedSkills.includes(skill)
                      ? 'bg-brand-yellow border-brand-yellow text-brand-black'
                      : 'bg-white border-gray-200 text-brand-gray-mid'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mentor profile */}
      {isMentor && (
        <div className="card mb-4">
          <h3 className="font-bold text-brand-black mb-4">Mentor Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Headline</label>
              <input
                type="text"
                disabled={!editing}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Engineer @ Accenture PH | 5 years experience"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow
                           disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Mentor Type</label>
              <select
                disabled={!editing}
                value={mentorType}
                onChange={(e) => setMentorType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="industry">Industry Professional</option>
                <option value="professor">Professor / Academic</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg border ${
            isVerified ? 'bg-green-50 border-green-200' : 'bg-brand-yellow-pale border-brand-yellow/30'
          }`}>
            <p className="text-sm font-medium text-brand-black">
              Verification Status: {isVerified ? '✅ Verified' : '⏳ Pending Approval'}
            </p>
            <p className="text-xs text-brand-gray-mid mt-0.5">
              {isVerified
                ? 'Your mentor profile is verified. Students can now find and connect with you.'
                : 'Awaiting admin verification. You will be notified via email once approved.'}
            </p>
          </div>
        </div>
      )}

      {/* Account settings */}
      <div className="card">
        <h3 className="font-bold text-brand-black mb-4">Account Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200
                             hover:border-brand-yellow transition-colors text-sm text-brand-black">
            Change Password
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200
                             hover:bg-red-50 transition-colors text-sm text-red-500">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
