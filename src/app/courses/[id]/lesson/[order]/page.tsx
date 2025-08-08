'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  description: string | null
  content: string | null
  video_url: string | null
  worksheet_url: string | null
  order_index: number
}

export default function LessonPage() {
  const params = useParams<{ id: string; order: string }>()
  const courseId = params?.id
  const order = Number(params?.order)
  const supabase = createSupabaseClient()
  const { user } = useAuth()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('lessons')
        .select('id,title,description,content,video_url,worksheet_url,order_index')
        .eq('course_id', courseId)
        .eq('order_index', order)
        .single()
      setLesson((data as Lesson) || null)
      setLoading(false)
    }
    if (courseId && order) fetchLesson()
  }, [courseId, order])

  const handleMarkComplete = async () => {
    if (!user || !lesson) return
    setMarking(true)
    await supabase.from('progress').upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lesson.id,
      completed: true,
      last_accessed: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    setMarking(false)
    router.push(`/courses/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-600">Loading…</div>
        ) : !lesson ? (
          <div className="text-center text-gray-600">Lesson not found.</div>
        ) : (
          <div className="space-y-6">
            <div>
              <Link href={`/courses/${courseId}`} className="text-primary-600 hover:text-primary-700">← Back to course</Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600">{lesson.description}</p>

            {/* Video placeholder */}
            {lesson.video_url ? (
              <div className="aspect-video w-full bg-black">
                <iframe className="w-full h-full" src={lesson.video_url} allowFullScreen />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gray-200 rounded" />
            )}

            {/* Content */}
            {lesson.content && (
              <div className="prose max-w-none">
                <p>{lesson.content}</p>
              </div>
            )}

            {/* Worksheet */}
            {lesson.worksheet_url && (
              <a href={lesson.worksheet_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 hover:text-primary-700">Download worksheet (PDF)</a>
            )}

            <div className="flex items-center space-x-3">
              <button onClick={handleMarkComplete} disabled={marking} className="bg-primary-600 text-white px-5 py-2 rounded disabled:opacity-50">{marking ? 'Saving…' : 'Mark as complete'}</button>
              <Link href={`/courses/${courseId}/quiz/${order}`} className="text-primary-600 hover:text-primary-700">Take quiz for this lesson →</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


