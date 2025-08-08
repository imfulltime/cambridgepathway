'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import Link from 'next/link'

interface Question {
  id: string
  type: 'multiple_choice' | 'short_answer'
  question_text: string
  options: string[] | null
  correct_answer: string
  points: number
}

export default function QuizPage() {
  const params = useParams<{ id: string; order: string }>()
  const courseId = params?.id
  const order = Number(params?.order)
  const supabase = createSupabaseClient()
  const { user } = useAuth()
  const router = useRouter()
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [results, setResults] = useState<Record<string, { correct: boolean; explanation?: string }>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      // find lesson for order to obtain quiz
      const { data: lesson } = await supabase.from('lessons').select('id').eq('course_id', courseId).eq('order_index', order).single()
      if (!lesson) return
      const { data: quiz } = await supabase.from('quizzes').select('id').eq('lesson_id', (lesson as any).id).single()
      if (!quiz) return
      setQuizId((quiz as any).id)
      const { data: qs } = await supabase.from('questions').select('id,type,question_text,options,correct_answer,points').eq('quiz_id', (quiz as any).id).order('order_index')
      setQuestions((qs as Question[]) || [])
    }
    if (courseId && order) fetchQuiz()
  }, [courseId, order])

  const totalPoints = useMemo(() => questions.reduce((sum, q) => sum + (q.points || 1), 0), [questions])

  const handleSubmit = async () => {
    if (!user || !quizId) return
    setSubmitting(true)
    
    // auto-score and create detailed results
    let earned = 0
    const answerRows: any[] = []
    const resultData: Record<string, { correct: boolean; explanation?: string }> = {}
    
    for (const q of questions) {
      const a = answers[q.id]?.trim() || ''
      const correct = q.correct_answer
      const isCorrect = q.type === 'multiple_choice' ? a === correct : a.toLowerCase() === correct.toLowerCase()
      
      if (isCorrect) earned += q.points || 1
      
      // Store result with explanation
      resultData[q.id] = {
        correct: isCorrect,
        explanation: isCorrect 
          ? "Correct! Well done." 
          : `Incorrect. The correct answer is: ${correct}${q.type === 'multiple_choice' ? '' : ' (case insensitive)'}`
      }
      
      answerRows.push({ 
        question_id: q.id, 
        answer_text: a, 
        is_correct: isCorrect, 
        points_earned: isCorrect ? (q.points || 1) : 0 
      })
    }
    
    const percent = Math.round((earned / (totalPoints || 1)) * 100)
    setScore(percent)
    setResults(resultData)
    setShowResults(true)
    
    // Save to database
    const { data: attempt } = await supabase.from('quiz_attempts').insert({ 
      user_id: user.id, 
      quiz_id: quizId, 
      score: percent, 
      total_points: totalPoints, 
      completed: true, 
      time_spent_minutes: 0 
    }).select('id').single()
    
    if (attempt?.id) {
      for (const row of answerRows) {
        await supabase.from('quiz_answers').insert({ ...row, attempt_id: attempt.id })
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!quizId ? (
          <div className="text-center text-gray-600">No quiz found for this lesson.</div>
        ) : (
          <div className="space-y-6">
            <div>
              <Link href={`/courses/${courseId}`} className="text-primary-600 hover:text-primary-700">← Back to course</Link>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Lesson Quiz</h1>
              <div className="text-sm text-gray-500">
                {questions.length} questions • {totalPoints} points total
              </div>
            </div>

            {!showResults ? (
              // Quiz Questions
              <>
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="font-medium text-gray-900 flex-1">
                        <span className="text-primary-600 font-semibold">Q{idx + 1}.</span> {q.question_text}
                      </div>
                      <div className="ml-4 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {q.points} pt{q.points !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {q.type === 'multiple_choice' && Array.isArray(q.options) ? (
                      <div className="space-y-3">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name={q.id} 
                              value={opt} 
                              checked={answers[q.id] === opt} 
                              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                              className="text-primary-600"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3">
                        <input 
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-primary-500" 
                          placeholder="Type your answer here..." 
                          value={answers[q.id] || ''} 
                          onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} 
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center justify-between bg-white rounded-xl border shadow-sm p-6">
                  <div className="text-sm text-gray-600">
                    Make sure to review your answers before submitting.
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitting || Object.keys(answers).length === 0} 
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? 'Submitting…' : 'Submit Quiz'}
                  </button>
                </div>
              </>
            ) : (
              // Results View
              <>
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      {(score || 0) >= 80 ? (
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (score || 0) >= 60 ? (
                        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                    <div className="text-3xl font-bold text-primary-600 mb-2">{score || 0}%</div>
                    <p className="text-gray-600">
                      {(score || 0) >= 80 ? 'Excellent work!' : (score || 0) >= 60 ? 'Good effort! Review the topics below.' : 'Keep practicing! Review the material and try again.'}
                    </p>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Review Your Answers</h3>
                  {questions.map((q, idx) => {
                    const result = results[q.id]
                    const userAnswer = answers[q.id] || 'No answer'
                    
                    return (
                      <div key={q.id} className={`bg-white rounded-xl border shadow-sm p-6 ${result?.correct ? 'border-green-200' : 'border-red-200'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="font-medium text-gray-900 flex-1">
                            <span className="text-primary-600 font-semibold">Q{idx + 1}.</span> {q.question_text}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result?.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result?.correct ? '✓ Correct' : '✗ Incorrect'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Your answer: </span>
                            <span className={result?.correct ? 'text-green-600' : 'text-red-600'}>{userAnswer}</span>
                          </div>
                          {result?.explanation && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {result.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <Link 
                    href={`/courses/${courseId}`} 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Back to Course
                  </Link>
                  <button 
                    onClick={() => {
                      setShowResults(false)
                      setScore(null)
                      setResults({})
                      setAnswers({})
                    }}
                    className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


