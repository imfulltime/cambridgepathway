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

            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Video Lesson
                </h2>
                {lesson.video_url ? (
                  <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <iframe 
                      className="w-full h-full" 
                      src={lesson.video_url} 
                      allowFullScreen
                      title={`Video for ${lesson.title}`}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 font-medium">Video content coming soon</p>
                      <p className="text-sm text-gray-400 mt-1">Interactive video lessons will be available here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Lesson Notes
              </h2>
              {lesson.content ? (
                <div className="prose max-w-none text-gray-700">
                  <div className="space-y-4">
                    {lesson.content.split('\n').map((paragraph, idx) => (
                      paragraph.trim() && <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Detailed lesson notes will be available here</p>
                  <p className="text-sm text-gray-400 mt-1">Comprehensive explanations, examples, and key concepts</p>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Downloads & Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.worksheet_url ? (
                  <a 
                    href={lesson.worksheet_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Practice Worksheet</p>
                      <p className="text-sm text-gray-500">PDF Download</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-500">Practice Worksheet</p>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  <div>
                    <p className="font-medium text-gray-500">Additional Resources</p>
                    <p className="text-sm text-gray-400">Reference materials</p>
                  </div>
                </div>
              </div>
            </div>

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


