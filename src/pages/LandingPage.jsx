/**
 * CodeCompass Landing Page
 * White background, yellow + black accents — TIP college branding.
 * Language: English
 */
import { Link } from 'react-router-dom'
import {
  MapIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

const FEATURES = [
  {
    icon: MapIcon,
    title: 'AI-Powered Roadmaps',
    desc: 'Personalized learning paths built by AI — based on your skills, goals, and CCS program.',
    color: 'bg-yellow-50 text-brand-yellow',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI Career Assistant',
    desc: 'Chat with CodeCompass AI anytime — get instant answers about careers, certifications, and learning paths.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: UserGroupIcon,
    title: 'Mentor Matching',
    desc: 'Connect with verified IT professionals, professors, and CCS alumni for real guidance.',
    color: 'bg-green-50 text-green-500',
  },
  {
    icon: BriefcaseIcon,
    title: 'PH Job Board',
    desc: 'Browse real IT jobs in the Philippines matched to your skills and career path.',
    color: 'bg-purple-50 text-purple-500',
  },
  {
    icon: AcademicCapIcon,
    title: 'Certification Tracker',
    desc: 'Track TESDA, Google, AWS, and CompTIA certifications. Know what to take next.',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: TrophyIcon,
    title: 'Gamification',
    desc: 'Earn XP, badges, and climb the leaderboard as you complete your learning goals.',
    color: 'bg-pink-50 text-pink-500',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Register and choose your role',
    desc: 'Are you an incoming student, undergraduate, or IT professional? Pick the path that fits you.',
  },
  {
    step: '02',
    title: 'Complete the onboarding quiz',
    desc: 'Just a few questions about your skills, interests, and career goals. There are no wrong answers!',
  },
  {
    step: '03',
    title: 'Get your personalized roadmap',
    desc: 'In seconds, see a complete step-by-step learning path designed to help you reach your dream career.',
  },
]

const ROLES = [
  {
    emoji: '🎓',
    title: 'Incoming Student',
    desc: 'Explore CCS programs, find the right university, and get a head start on your tech career.',
    cta: 'Start Exploring',
  },
  {
    emoji: '💻',
    title: 'Undergraduate',
    desc: 'Fill skill gaps, track certifications, find internships, and connect with mentors.',
    cta: 'Boost My Skills',
  },
  {
    emoji: '🧑‍💼',
    title: 'Mentor',
    desc: 'Give back to the CCS community. Guide the next generation of Filipino tech professionals.',
    cta: 'Become a Mentor',
  },
]



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <span className="text-brand-black font-black text-base">C</span>
            </div>
            <span className="text-brand-black font-extrabold text-xl tracking-tight">
              Code<span className="text-brand-yellow">Compass</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-brand-black transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-black transition-colors">How It Works</a>
            <a href="#for-who" className="hover:text-brand-black transition-colors">Who It's For</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-brand-black transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="bg-brand-yellow text-brand-black font-semibold text-sm px-4 py-2 rounded-lg
                         hover:bg-brand-yellow-dark active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/30
                        text-brand-black text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <SparklesIcon className="w-3.5 h-3.5 text-brand-yellow" />
          Powered by Groq AI · Free for all CCS students
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black leading-tight mb-6">
          Your AI Career Mentor
          <br />
          <span className="text-brand-yellow">for CCS Students</span>
          <br />
          in the Philippines
        </h1>

        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          CodeCompass gives you a personalized tech career roadmap, connects you with mentors,
          matches you with Philippine IT jobs, and guides you every step of the way.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/auth/register"
            className="flex items-center gap-2 bg-brand-yellow text-brand-black font-bold px-8 py-4 rounded-xl
                       hover:bg-brand-yellow-dark active:scale-95 transition-all text-base shadow-lg shadow-brand-yellow/30"
          >
            Get Started — It's Free!
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link
            to="/auth/login"
            className="flex items-center gap-2 border-2 border-gray-200 text-brand-black font-semibold px-8 py-4 rounded-xl
                       hover:border-brand-yellow hover:bg-yellow-50 transition-all text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          {[
            '✓ No credit card required',
            '✓ AI-powered career guidance',
            '✓ Real PH job listings',
            '✓ Verified mentors',
          ].map((item) => (
            <span key={item} className="flex items-center gap-1">{item}</span>
          ))}
        </div>
      </section>

      {/* ── Yellow divider strip ───────────────────────────────── */}
      <div className="h-1.5 bg-gradient-to-r from-brand-yellow via-brand-yellow-dark to-brand-yellow" />

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-brand-black mb-3">
              Everything you need, <span className="text-brand-yellow">one platform</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From finding the right university to landing your first tech job — CodeCompass guides every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-brand-yellow/30 transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-brand-black mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-brand-black mb-3">
              How does <span className="text-brand-yellow">CodeCompass</span> work?
            </h2>
            <p className="text-gray-500 text-lg">Just 3 steps — and you're ready to go!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                {/* Step number */}
                <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-yellow/30">
                  <span className="text-brand-black font-black text-xl">{step}</span>
                </div>
                <h3 className="font-bold text-brand-black text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ───────────────────────────────────────── */}
      <section id="for-who" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-brand-black mb-3">
              Who is <span className="text-brand-yellow">CodeCompass</span> for?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map(({ emoji, title, desc, cta }) => (
              <div key={title} className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center
                                          hover:border-brand-yellow hover:shadow-lg transition-all group">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="font-bold text-brand-black text-xl mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black font-semibold
                             text-sm px-5 py-2.5 rounded-lg hover:bg-brand-yellow-dark transition-all
                             group-hover:shadow-md"
                >
                  {cta}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="bg-brand-black py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to get started?{' '}
            <span className="text-brand-yellow">Let's go.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Free, no credit card required. Your tech career starts here.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black font-bold
                       px-10 py-4 rounded-xl hover:bg-brand-yellow-dark active:scale-95 transition-all
                       text-base shadow-lg shadow-brand-yellow/20"
          >
            Create an Account — It's Free!
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-brand-yellow hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-brand-black border-t border-brand-black-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-yellow rounded-md flex items-center justify-center">
              <span className="text-brand-black font-black text-xs">C</span>
            </div>
            <span className="text-white font-bold text-sm">
              Code<span className="text-brand-yellow">Compass</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs text-center">
            © 2026 CodeCompass — Built for CCS Students in the Philippines
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link to="/auth/register" className="hover:text-brand-yellow transition-colors">Register</Link>
            <Link to="/auth/login" className="hover:text-brand-yellow transition-colors">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
