'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  subject: 'math' | 'english'
  level: string
  image_url: string | null
  total_lessons: number
  duration: string | null
  instructor_name: string | null
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('id,title,description,subject,level,image_url,total_lessons,duration,instructor_name')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
      if (!error && data) setCourses(data as Course[])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  if (loading) return <div className="text-center text-gray-600">Loading courses…</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img
              src={course.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {course.level}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.duration || '—'}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.total_lessons} lessons</span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span>Instructor: {course.instructor_name || '—'}</span>
            </div>

            <Link href={`/courses/${course.id}`} className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block">
              View Course
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}


