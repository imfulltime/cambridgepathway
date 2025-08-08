'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { BookOpen, CheckCircle, Play } from 'lucide-react'
import { useAuth } from '@/components/providers'

interface Course {
  id: string
  title: string
  description: string
  level: string
  image_url: string | null
}

interface Lesson {
  id: string
  title: string
  description: string | null
  order_index: number
  duration_minutes: number | null
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>()
  const courseId = params?.id
  const supabase = createSupabaseClient()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [{ data: courseData }, { data: lessonsData }] = await Promise.all([
        supabase.from('courses').select('id,title,description,level,image_url').eq('id', courseId).single(),
        supabase.from('lessons').select('id,title,description,order_index,duration_minutes').eq('course_id', courseId).order('order_index')
      ])
      setCourse((courseData as Course) || null)
      setLessons((lessonsData as Lesson[]) || [])
      if (user) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id)
          .in('lesson_id', (lessonsData || []).map((l: any) => l.id))
        const done = new Set<string>((progressData || []).filter((p: any) => p.completed).map((p: any) => p.lesson_id))
        setCompletedLessonIds(done)
      }
      setLoading(false)
    }
    if (courseId) fetchData()
  }, [courseId, user])

  const progressPercent = useMemo(() => {
    if (!lessons.length) return 0
    return Math.round((completedLessonIds.size / lessons.length) * 100)
  }, [lessons.length, completedLessonIds])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-600">Loading…</div>
        ) : !course ? (
          <div className="text-center text-gray-600">Course not found.</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${course.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80'})` }} />
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{progressPercent}% complete</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
              </div>
              <div className="divide-y">
                {lessons.map((lesson) => {
                  const isDone = completedLessonIds.has(lesson.id)
                  return (
                    <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {isDone ? <CheckCircle className="w-5 h-5 text-green-600" /> : <BookOpen className="w-5 h-5 text-primary-600" />}
                        <div>
                          <div className="font-medium text-gray-900">{lesson.order_index}. {lesson.title}</div>
                          <div className="text-sm text-gray-600 line-clamp-1">{lesson.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link href={`/courses/${course.id}/lesson/${lesson.order_index}`} className="inline-flex items-center text-primary-600 hover:text-primary-700">
                          Start <Play className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


