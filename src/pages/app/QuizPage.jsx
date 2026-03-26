/**
 * QuizPage — full-screen, no sidebar.
 * Receives { roadmapId, nodeId, resource } via React Router location.state.
 * One question at a time, 15-second timer, manual Next button (enabled when answered).
 * Timer expiry auto-advances (records null for unanswered question).
 * Results shown inline after submit — no modal.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { roadmapApi } from '../../api/roadmaps'

function fireSmallConfetti() {
  confetti({
    particleCount: 40,
    spread: 45,
    origin: { x: 0.5, y: 0.55 },
    scalar: 0.8,
    ticks: 150,
  })
}

export default function QuizPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { roadmapId, nodeId, resource } = location.state ?? {}

  const [quizStatus, setQuizStatus] = useState('loading')
  // 'loading' | 'questions' | 'submitting' | 'passed' | 'failed'
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})        // { '0': 'b', '3': null } — null = timed out
  const [result, setResult] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  // Redirect if no state provided (direct URL visit)
  useEffect(() => {
    if (!roadmapId || !nodeId || !resource) {
      navigate('/app/roadmap', { replace: true })
      return
    }
    startQuiz()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (quizStatus !== 'questions') return
    if (timeLeft <= 0) {
      handleAutoAdvance()
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [quizStatus, timeLeft, currentQuestion]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Quiz lifecycle ────────────────────────────────────────────────────────────
  async function startQuiz() {
    setQuizStatus('loading')
    setAnswers({})
    setCurrentQuestion(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setResult(null)
    try {
      const { data } = await roadmapApi.startAssessment(roadmapId, nodeId, resource.id)
      setSessionId(data.sessionId)
      setQuestions(data.questions)
      setQuizStatus('questions')
    } catch {
      toast.error('Could not generate quiz. Returning to roadmap.')
      navigate('/app/roadmap', { replace: true })
    }
  }

  // Timer expired — record whatever was selected (or null) and advance
  function handleAutoAdvance() {
    const newAnswers = { ...answers, [String(currentQuestion)]: selectedAnswer ?? null }
    setAnswers(newAnswers)
    advance(newAnswers)
  }

  // Next / Submit button — only callable when selectedAnswer is set
  function handleNext() {
    if (!selectedAnswer) return
    const newAnswers = { ...answers, [String(currentQuestion)]: selectedAnswer }
    setAnswers(newAnswers)
    advance(newAnswers)
  }

  // Shared advance logic — pass updated answers directly to avoid stale state
  function advance(newAnswers) {
    const next = currentQuestion + 1
    if (next >= questions.length) {
      handleSubmitFinal(newAnswers)
    } else {
      setCurrentQuestion(next)
      setTimeLeft(15)
      setSelectedAnswer(null)
    }
  }

  async function handleSubmitFinal(finalAnswers) {
    setQuizStatus('submitting')
    try {
      const { data } = await roadmapApi.submitAssessment(
        roadmapId, nodeId, resource.id, sessionId, finalAnswers
      )
      setResult(data)
      setQuizStatus(data.passed ? 'passed' : 'failed')
      if (data.passed) fireSmallConfetti()
    } catch {
      toast.error('Submission failed. Returning to roadmap.')
      navigate('/app/roadmap', { replace: true })
    }
  }

  // ── Navigation after quiz ─────────────────────────────────────────────────────
  function handleBackPassed() {
    navigate('/app/roadmap', {
      state: {
        quizPassed: true,
        resourceId: resource.id,
        results: result.results,
        questions,
      },
    })
  }

  function handleBackFailed() {
    navigate('/app/roadmap')
  }

  function handleLeaveQuiz() {
    navigate('/app/roadmap')
  }

  function handleRetry() {
    startQuiz()
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  if (quizStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-gray-mid">Generating your quiz...</p>
        </div>
      </div>
    )
  }

  if (quizStatus === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-gray-mid">Checking your answers...</p>
        </div>
      </div>
    )
  }

  if (quizStatus === 'passed' || quizStatus === 'failed') {
    return <QuizResults
      quizStatus={quizStatus}
      result={result}
      questions={questions}
      onBackPassed={handleBackPassed}
      onBackFailed={handleBackFailed}
      onRetry={handleRetry}
    />
  }

  // ── Active quiz ───────────────────────────────────────────────────────────────
  const q = questions[currentQuestion]
  const timerPct = (timeLeft / 15) * 100
  const timerBarColor = timeLeft >= 8 ? 'bg-green-400' : timeLeft >= 4 ? 'bg-brand-yellow' : 'bg-red-400'
  const timerTextColor = timeLeft >= 8 ? 'text-green-600' : timeLeft >= 4 ? 'text-yellow-600' : 'text-red-500'
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">

      {/* ── Header: progress + leave ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-brand-black">
          Question {currentQuestion + 1}
          <span className="text-gray-400 font-normal"> of {questions.length}</span>
        </span>
        <button
          onClick={handleLeaveQuiz}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          Leave Quiz
        </button>
      </div>

      {/* Progress bar (question progress) */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-brand-yellow transition-all duration-500"
          style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        />
      </div>

      {/* Timer bar (green → yellow → red) */}
      <div className="h-1.5 bg-gray-100">
        <div
          className={`h-1.5 transition-all duration-1000 ${timerBarColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-10">
        <div className="w-full max-w-2xl">

          {/* Timer digit */}
          <div className="flex justify-end mb-4">
            <span className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${timerTextColor}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
            <p className="text-sm sm:text-base font-semibold text-brand-black leading-snug">
              {q.question}
            </p>
          </div>

          {/* Option buttons */}
          <div className="space-y-2.5 sm:space-y-3 mb-6">
            {Object.entries(q.options).map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedAnswer(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl
                  border-2 text-left text-sm sm:text-base font-medium transition-all
                  active:scale-[0.99] bg-white ${
                  selectedAnswer === key
                    ? 'border-brand-yellow bg-yellow-50 text-brand-black'
                    : 'border-gray-200 text-gray-700 hover:border-brand-yellow'
                }`}
              >
                <span className={`w-7 h-7 rounded-md flex items-center justify-center
                  text-xs font-bold flex-shrink-0 ${
                  selectedAnswer === key
                    ? 'bg-brand-yellow text-brand-black'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {key.toUpperCase()}
                </span>
                {text}
              </button>
            ))}
          </div>

          {/* Next / Submit button — disabled until answer selected */}
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="w-full py-3.5 bg-brand-yellow text-brand-black font-bold text-sm sm:text-base
                       rounded-xl hover:opacity-90 active:scale-[0.99] transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next →'}
          </button>

        </div>
      </div>
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────────────────

function QuizResults({ quizStatus, result, questions, onBackPassed, onBackFailed, onRetry }) {
  const passed = quizStatus === 'passed'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

        {/* Result banner */}
        {passed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 sm:p-6 mb-6 flex items-center gap-4">
            <span className="text-3xl sm:text-4xl">✓</span>
            <div>
              <p className="text-lg sm:text-xl font-bold text-green-700">Quiz Passed!</p>
              <p className="text-sm text-green-600 mt-0.5">
                {result.correctCount} / {result.totalQuestions} correct · {result.score}%
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 mb-6 flex items-center gap-4">
            <span className="text-3xl sm:text-4xl">✗</span>
            <div>
              <p className="text-lg sm:text-xl font-bold text-red-700">Not Quite</p>
              <p className="text-sm text-red-600 mt-0.5">
                {result.correctCount} / {result.totalQuestions} correct · need {result.passThreshold}% to pass
              </p>
            </div>
          </div>
        )}

        {/* Per-question breakdown — all shown, no collapse */}
        <div className="space-y-4 mb-6">
          {result.results.map((r, i) => {
            const q = questions[i]
            const options = q?.options ?? {}
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Question header */}
                <div className={`px-4 py-3 flex items-start gap-2 ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`mt-0.5 font-bold text-sm flex-shrink-0 ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
                    {r.correct ? '✓' : '✗'}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">
                    Q{i + 1}. {q?.question}
                  </p>
                </div>
                {/* Options */}
                <div className="px-4 py-3 space-y-1.5">
                  {Object.entries(options).map(([key, text]) => {
                    const isCorrect = key === r.correctAnswer
                    const isYourWrong = key === r.yourAnswer && !isCorrect
                    let cls = 'border-gray-100 bg-gray-50 text-gray-400'
                    if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800'
                    if (isYourWrong) cls = 'border-red-400 bg-red-50 text-red-700'
                    return (
                      <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${cls}`}>
                        <span className="font-bold uppercase flex-shrink-0">{key}.</span>
                        <span className="flex-1">{text}</span>
                        {isCorrect && (
                          <span className="flex-shrink-0 text-green-600 font-bold">✓ correct</span>
                        )}
                        {isYourWrong && (
                          <span className="flex-shrink-0 text-red-500 font-bold">your answer</span>
                        )}
                        {r.yourAnswer === null && isCorrect && (
                          <span className="flex-shrink-0 text-gray-400 font-bold">(timed out)</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Explanation */}
                {r.explanation && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-600 leading-relaxed">💡 {r.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action buttons — stack on mobile, side-by-side on sm+ */}
        {passed ? (
          <button
            onClick={onBackPassed}
            className="w-full py-3 sm:py-3.5 bg-brand-yellow text-brand-black font-bold rounded-xl
                       hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Back to Lesson
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3 sm:py-3.5 bg-brand-yellow text-brand-black font-bold rounded-xl
                         hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={onBackFailed}
              className="flex-1 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 font-bold
                         rounded-xl hover:bg-gray-50 transition-all"
            >
              Back to Lesson
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
