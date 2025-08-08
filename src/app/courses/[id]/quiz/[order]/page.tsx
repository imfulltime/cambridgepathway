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
    // auto-score simple types
    let earned = 0
    const answerRows: any[] = []
    for (const q of questions) {
      const a = answers[q.id]?.trim() || ''
      const correct = q.correct_answer
      const isCorrect = q.type === 'multiple_choice' ? a === correct : a.toLowerCase() === correct.toLowerCase()
      if (isCorrect) earned += q.points || 1
      answerRows.push({ question_id: q.id, answer_text: a, is_correct: isCorrect, points_earned: isCorrect ? (q.points || 1) : 0 })
    }
    const percent = Math.round((earned / (totalPoints || 1)) * 100)
    setScore(percent)
    const { data: attempt } = await supabase.from('quiz_attempts').insert({ user_id: user.id, quiz_id: quizId, score: percent, total_points: totalPoints, completed: true, time_spent_minutes: 0 }).select('id').single()
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
            <h1 className="text-2xl font-bold text-gray-900">Lesson Quiz</h1>
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-xl border p-4">
                <div className="font-medium text-gray-900">{idx + 1}. {q.question_text}</div>
                {q.type === 'multiple_choice' && Array.isArray(q.options) ? (
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2">
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <input className="w-full border rounded px-3 py-2" placeholder="Your answer" value={answers[q.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />
                  </div>
                )}
              </div>
            ))}
            <button onClick={handleSubmit} disabled={submitting} className="bg-primary-600 text-white px-5 py-2 rounded disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit'}</button>
            {score !== null && (
              <div className="text-lg font-semibold">Your score: {score}%</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


