/**
 * Profile page — view and edit student/mentor profile info.
 */
import { useState } from 'react'
import useAuthStore from '../../stores/authStore'
import { PencilIcon, CheckIcon } from '@heroicons/react/24/solid'

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'Django', 'Node.js', 'Java', 'C++',
  'SQL', 'HTML/CSS', 'Git', 'Machine Learning', 'Data Analysis',
  'Networking', 'Linux', 'Cloud (AWS/GCP)', 'Mobile Development',
]

const CAREER_OPTIONS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist / Analyst',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
  'Mobile Developer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'IT Project Manager',
  'Network Engineer',
  'Database Administrator',
]

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [targetCareer, setTargetCareer] = useState('')

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const roleLabel = {
    incoming_student: 'Incoming Student',
    undergraduate: 'Undergraduate Student',
    mentor: 'Mentor',
    admin: 'Admin',
  }[user?.role] || 'User'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-black">My Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            editing
              ? 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark'
              : 'border border-gray-200 text-brand-gray-mid hover:border-brand-yellow'
          }`}
        >
          {editing ? (
            <><CheckIcon className="w-4 h-4" /> Save Changes</>
          ) : (
            <><PencilIcon className="w-4 h-4" /> Edit Profile</>
          )}
        </button>
      </div>

      {/* Avatar + basic info */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-black text-2xl">
              {user?.fullName?.[0] || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-black">{user?.fullName || 'Student'}</h2>
            <p className="text-brand-gray-mid text-sm">{user?.email}</p>
            <span className="badge-yellow text-xs mt-1 inline-block">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Student profile fields */}
      {(user?.role === 'incoming_student' || user?.role === 'undergraduate') && (
        <>
          <div className="card mb-4">
            <h3 className="font-bold text-brand-black mb-4">Academic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">
                  Year Level
                </label>
                <select
                  disabled={!editing}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select year level</option>
                  {user?.role === 'incoming_student' && <option>Incoming / K-12 Graduate</option>}
                  {user?.role === 'undergraduate' && (
                    <>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">
                  Program
                </label>
                <select
                  disabled={!editing}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select program</option>
                  <option>BSCS</option>
                  <option>BSIT</option>
                  <option>BSIS</option>
                  <option>BSCE</option>
                  <option>Undecided</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">
                Target Career Path
              </label>
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
          </div>

          {/* Skills */}
          <div className="card mb-4">
            <h3 className="font-bold text-brand-black mb-1">Current Skills</h3>
            <p className="text-brand-gray-mid text-xs mb-4">
              {editing ? 'I-click ang mga skills na alam mo na.' : 'Mag-edit para mag-update ng skills.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  disabled={!editing}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    selectedSkills.includes(skill)
                      ? 'bg-brand-yellow border-brand-yellow text-brand-black'
                      : 'bg-white border-gray-200 text-brand-gray-mid'
                  } disabled:cursor-not-allowed`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mentor profile fields */}
      {user?.role === 'mentor' && (
        <div className="card mb-4">
          <h3 className="font-bold text-brand-black mb-4">Mentor Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-gray-mid mb-1.5">Headline</label>
              <input
                type="text"
                disabled={!editing}
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
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-brand-black text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option>Industry Professional</option>
                <option>Professor / Academic</option>
                <option>Alumni</option>
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-brand-yellow-pale border border-brand-yellow/30 rounded-lg">
            <p className="text-sm font-medium text-brand-black">Verification Status</p>
            <p className="text-xs text-brand-gray-mid mt-0.5">
              Your mentor profile is pending admin verification. You'll be notified via email once approved.
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
