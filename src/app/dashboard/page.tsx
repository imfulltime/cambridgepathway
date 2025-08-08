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

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalCourses || 0}</p>
                <p className="text-xs text-green-600 mt-1">📚 Enrolled</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.completedLessons || 0}/{dashboardData?.totalLessons || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {(dashboardData?.totalLessons || 0) - (dashboardData?.completedLessons || 0)} remaining
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">
                  {Math.round(((dashboardData?.completedLessons || 0) / (dashboardData?.totalLessons || 1)) * 100)}%
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(dashboardData?.totalLessons || 0) > 0 ? 
                      ((dashboardData?.completedLessons || 0) / (dashboardData?.totalLessons || 1)) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.averageScore || 0}%</p>
                <p className="text-xs mt-1">
                  {(dashboardData?.averageScore || 0) >= 80 ? (
                    <span className="text-green-600">🎯 Excellent!</span>
                  ) : (dashboardData?.averageScore || 0) >= 70 ? (
                    <span className="text-blue-600">👍 Good work</span>
                  ) : (dashboardData?.averageScore || 0) >= 60 ? (
                    <span className="text-yellow-600">📈 Keep improving</span>
                  ) : (
                    <span className="text-red-600">💪 Practice more</span>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.streak || 0} days</p>
                <p className="text-xs text-orange-600 mt-1">
                  {(dashboardData?.streak || 0) >= 7 ? '🔥 On fire!' : 
                   (dashboardData?.streak || 0) >= 3 ? '⚡ Great pace!' : '🌱 Keep going!'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Learning Activity</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              // Mock activity data - in real app, fetch from database
              const activity = Math.random() * 100
              return (
                <div key={day} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div className="h-20 bg-gray-100 rounded flex items-end justify-center">
                    <div 
                      className={`w-full rounded transition-all duration-300 ${
                        activity > 70 ? 'bg-green-500' : 
                        activity > 40 ? 'bg-yellow-500' : 
                        activity > 0 ? 'bg-gray-400' : 'bg-gray-200'
                      }`}
                      style={{ height: `${Math.max(activity, 5)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(activity)}%
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>This week's average: 68%</span>
            <span className="text-green-600">↗ +12% from last week</span>
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
