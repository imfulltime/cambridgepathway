'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import Link from 'next/link'

interface StudentProgress {
  id: string
  firstName: string
  lastName: string
  email: string
  totalCourses: number
  completedLessons: number
  totalLessons: number
  averageScore: number
  lastActivity: string
  courses: Array<{
    id: string
    title: string
    progress: number
    lastAccessed: string
  }>
}

export default function ParentDashboard() {
  const { user, userProfile } = useAuth()
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || userProfile?.role !== 'parent') return

      try {
        // Get all students linked to this parent
        const { data: linkedStudents } = await supabase
          .from('parent_students')
          .select(`
            student_id,
            users!parent_students_student_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('parent_id', user.id)

        if (!linkedStudents) return

        const studentData: StudentProgress[] = []

        for (const link of linkedStudents) {
          const student = (link as any).users
          if (!student) continue

          // Get course enrollment data
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select(`
              course_id,
              courses (id, title)
            `)
            .eq('user_id', student.id)

          // Get progress data
          const { data: progress } = await supabase
            .from('progress')
            .select('course_id, lesson_id, completed, last_accessed')
            .eq('user_id', student.id)

          // Get quiz scores
          const { data: quizScores } = await supabase
            .from('quiz_attempts')
            .select('score')
            .eq('user_id', student.id)
            .eq('completed', true)

          // Calculate metrics
          const totalCourses = enrollments?.length || 0
          const completedLessons = progress?.filter(p => p.completed).length || 0
          const totalLessons = progress?.length || 0
          const averageScore = quizScores?.length 
            ? Math.round(quizScores.reduce((sum, q) => sum + q.score, 0) / quizScores.length)
            : 0

          // Get last activity
          const lastActivity = progress?.reduce((latest, p) => {
            return !latest || new Date(p.last_accessed) > new Date(latest) 
              ? p.last_accessed 
              : latest
          }, '') || ''

          // Course progress details
          const courseProgress = enrollments?.map((enrollment: any) => {
            const courseId = enrollment.course_id
            const courseTitle = enrollment.courses?.title || 'Unknown Course'
            const courseLessons = progress?.filter(p => p.course_id === courseId) || []
            const courseCompleted = courseLessons.filter(p => p.completed).length
            const courseTotal = courseLessons.length
            const progressPercent = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0
            const lastAccessed = courseLessons.reduce((latest, p) => {
              return !latest || new Date(p.last_accessed) > new Date(latest)
                ? p.last_accessed
                : latest
            }, '') || ''

            return {
              id: courseId,
              title: courseTitle,
              progress: progressPercent,
              lastAccessed
            }
          }) || []

          studentData.push({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            email: student.email,
            totalCourses,
            completedLessons,
            totalLessons,
            averageScore,
            lastActivity,
            courses: courseProgress
          })
        }

        setStudents(studentData)
      } catch (error) {
        console.error('Error fetching student data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [user, userProfile])

  if (!user || userProfile?.role !== 'parent') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to parent accounts.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your children's learning progress</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading student data...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Students Linked</h2>
            <p className="text-gray-600 mb-4">You haven't linked any student accounts yet.</p>
            <Link 
              href="/settings" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Link Student Account
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Student Header */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {student.firstName} {student.lastName}
                      </h2>
                      <p className="text-gray-600">{student.email}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{student.totalCourses}</div>
                        <div className="text-gray-600">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{student.completedLessons}/{student.totalLessons}</div>
                        <div className="text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{student.averageScore}%</div>
                        <div className="text-gray-600">Avg Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
                  {student.courses.length === 0 ? (
                    <p className="text-gray-500 italic">No enrolled courses</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {student.courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Last Activity */}
                          <div className="text-xs text-gray-500">
                            Last activity: {course.lastAccessed 
                              ? new Date(course.lastAccessed).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Summary */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="font-medium text-gray-900">
                      {student.lastActivity 
                        ? new Date(student.lastActivity).toLocaleDateString()
                        : 'No recent activity'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
