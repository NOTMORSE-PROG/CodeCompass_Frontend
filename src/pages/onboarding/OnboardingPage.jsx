/**
 * Onboarding quiz flow.
 * Step-by-step questions → AI roadmap generation.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onboardingApi } from '../../api/onboarding'
import useAuthStore from '../../stores/authStore'
import useRoadmapStore from '../../stores/roadmapStore'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const { user, setOnboarded } = useAuthStore()
  const { generateRoadmap, isGenerating } = useRoadmapStore()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [phase, setPhase] = useState('quiz') // 'quiz' | 'generating' | 'done'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      await onboardingApi.start()
      const { data } = await onboardingApi.questions()
      setQuestions(data.results || data)
      setLoading(false)
    }
    init()
  }, [])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  const handleAnswer = (value) => {
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = async () => {
    if (!responses[currentQuestion?.id]) {
      toast.error('Please answer the question before continuing.')
      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // Submit all responses and complete onboarding
      const formattedResponses = Object.entries(responses).map(([questionId, answerValue]) => ({
        question: parseInt(questionId),
        answer_value: answerValue,
      }))

      await onboardingApi.submitResponses(formattedResponses)
      await onboardingApi.complete()
      setOnboarded()

      // Now generate the roadmap
      setPhase('generating')
      const roadmap = await generateRoadmap()
      if (roadmap) {
        navigate(`/app/roadmap`, { replace: true })
      } else {
        navigate('/app/dashboard', { replace: true })
      }
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-gray-mid">Loading your questions...</p>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-brand-black mb-2">
          Building your roadmap...
        </h2>
        <p className="text-brand-gray-mid">
          Our AI is crafting your personalized learning path. This will only take a moment!
        </p>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="card shadow-xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-brand-gray-mid mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-yellow h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-yellow uppercase tracking-wide mb-2">
          {currentQuestion.category?.replace('_', ' ')}
        </p>
        <h3 className="text-xl font-bold text-brand-black leading-snug">
          {currentQuestion.questionText || currentQuestion.question_text}
        </h3>
        {(currentQuestion.questionTextTagalog || currentQuestion.question_text_tagalog) && (
          <p className="text-brand-gray-mid text-sm mt-1 italic">
            {currentQuestion.questionTextTagalog || currentQuestion.question_text_tagalog}
          </p>
        )}
      </div>

      {/* Answer options */}
      <div className="space-y-2 mb-8">
        {(currentQuestion.options || []).map((option) => {
          const value = option.value || option
          const label = option.label || option
          const isSelected = responses[currentQuestion.id] === value

          return (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                isSelected
                  ? 'border-brand-yellow bg-brand-yellow text-brand-black font-semibold'
                  : 'border-gray-200 bg-white text-brand-black hover:border-brand-yellow hover:bg-brand-yellow-pale'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="px-6 py-2.5 rounded-lg border border-gray-200 text-brand-gray-mid
                     hover:border-brand-yellow hover:text-brand-black transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-2.5 rounded-lg bg-brand-yellow text-brand-black font-bold
                     hover:bg-brand-yellow-dark active:scale-95 transition-all"
        >
          {currentIndex === questions.length - 1 ? 'Finish & Generate Roadmap!' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
