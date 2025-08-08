'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Navigation } from '@/components/navigation'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Calendar,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'

interface DashboardData {
  totalCourses: number
  completedLessons: number
  totalLessons: number
  averageScore: number
  timeSpent: number
  streak: number
  upcomingAssessments: Array<{
    id: string
    title: string
    subject: string
    dueDate: string
    type: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    title: string
    timestamp: string
    progress?: number
  }>
  courses: Array<{
    id: string
    title: string
    subject: string
    progress: number
    lastAccessed: string
    nextLesson: string
  }>
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      // total courses
      const { data: courseData } = await supabase.from('courses').select('id').eq('is_published', true)
      // total/completed lessons for user
      const { data: totalLessons } = await supabase.from('lessons').select('id')
      const { data: completed } = await supabase
        .from('progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
      // recent activity from progress and quiz_attempts
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id,score,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      const { data: recentProg } = await supabase
        .from('progress')
        .select('id,updated_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(5)

      const recentActivity = [
        ...(recentProg || []).map((p: any) => ({ id: `p-${p.id}`, type: 'lesson_completed', title: 'Lesson completed', timestamp: p.updated_at, progress: 100 })),
        ...(attempts || []).map((a: any) => ({ id: `a-${a.id}`, type: 'quiz_attempted', title: 'Quiz Attempt', timestamp: a.created_at, progress: a.score })),
      ].slice(0, 5)

      setDashboardData({
        totalCourses: (courseData || []).length,
        completedLessons: (completed || []).length,
        totalLessons: (totalLessons || []).length,
        averageScore: Math.round(
          ((attempts || []).reduce((s: number, a: any) => s + (a.score || 0), 0) / Math.max(1, (attempts || []).length))
        ),
        timeSpent: 0,
        streak: 0,
        upcomingAssessments: [],
        recentActivity,
        courses: [],
      })
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Please log in to access your dashboard
            </h1>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your learning journey and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData?.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.completedLessons}/{dashboardData?.totalLessons}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData?.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData?.streak} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.subject}</p>
                        </div>
                        <span className="text-sm font-medium text-primary-600">
                          {course.progress}% complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Next: {course.nextLesson}
                        </p>
                        <Link
                          href={`/courses/${course.id}`}
                          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          Continue
                          <PlayCircle className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Assessments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Assessments</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.upcomingAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {assessment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assessment.subject}
                        </p>
                        <p className="text-xs text-orange-600">
                          Due: {new Date(assessment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'lesson_completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        {activity.progress && (
                          <p className="text-xs text-gray-500">
                            Score: {activity.progress}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Keep Learning!</h3>
              <p className="text-primary-100 text-sm mb-4">
                You're doing great! Continue your streak and unlock achievements.
              </p>
              <div className="space-y-2">
                <Link
                  href="/courses"
                  className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Browse All Courses
                </Link>
                <Link
                  href="/forum"
                  className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Join Discussion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
