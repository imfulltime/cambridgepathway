'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import { 
  User, 
  Settings, 
  Trophy, 
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Clock,
  BarChart3,
  Brain,
  Zap,
  ChevronRight,
  Edit3,
  Camera
} from 'lucide-react'
import Link from 'next/link'

interface UserStats {
  totalCourses: number
  completedLessons: number
  totalLessons: number
  averageScore: number
  timeSpent: number
  streak: number
  level: number
  xp: number
  nextLevelXp: number
}

interface SkillData {
  subject: string
  proficiency: number
  level: string
  recentProgress: number
  strengths: string[]
  areasToImprove: string[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
}

interface CourseRecommendation {
  id: string
  title: string
  subject: string
  difficulty: string
  matchScore: number
  reason: string
  estimatedTime: string
}

export default function ProfilePage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<SkillData[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    if (!user) return
    
    try {
      setLoading(true)

      // Fetch user statistics
      const [
        { data: enrollments },
        { data: progress },
        { data: quizAttempts }
      ] = await Promise.all([
        supabase.from('enrollments').select('*').eq('user_id', user.id),
        supabase.from('progress').select('*').eq('user_id', user.id),
        supabase.from('quiz_attempts').select('*').eq('user_id', user.id).eq('completed', true)
      ])

      // Calculate statistics
      const totalCourses = enrollments?.length || 0
      const completedLessons = progress?.filter(p => p.completed).length || 0
      const totalLessons = progress?.length || 0
      const averageScore = quizAttempts?.length 
        ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
        : 0
      const timeSpent = progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0
      
      // Calculate level and XP
      const xp = completedLessons * 10 + (quizAttempts?.reduce((sum, q) => sum + q.score, 0) || 0)
      const level = Math.floor(xp / 500) + 1
      const nextLevelXp = level * 500

      setStats({
        totalCourses,
        completedLessons,
        totalLessons,
        averageScore,
        timeSpent,
        streak: 5, // Mock streak for now
        level,
        xp,
        nextLevelXp
      })

      // Mock skill data (in real app, calculate from performance)
      setSkills([
        {
          subject: 'Mathematics',
          proficiency: 75,
          level: 'Intermediate',
          recentProgress: 15,
          strengths: ['Algebra', 'Geometry'],
          areasToImprove: ['Statistics', 'Calculus']
        },
        {
          subject: 'English Literature',
          proficiency: 60,
          level: 'Beginner',
          recentProgress: 10,
          strengths: ['Reading Comprehension'],
          areasToImprove: ['Essay Writing', 'Poetry Analysis']
        }
      ])

      // Mock achievements
      setAchievements([
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          earned: completedLessons > 0,
          earnedDate: completedLessons > 0 ? '2024-01-15' : undefined
        },
        {
          id: '2',
          title: 'Quiz Master',
          description: 'Score 90% or higher on 5 quizzes',
          icon: '🏆',
          earned: false,
          progress: quizAttempts?.filter(q => q.score >= 90).length || 0,
          maxProgress: 5
        },
        {
          id: '3',
          title: 'Streak Keeper',
          description: 'Study for 7 consecutive days',
          icon: '🔥',
          earned: false,
          progress: 5,
          maxProgress: 7
        },
        {
          id: '4',
          title: 'Knowledge Seeker',
          description: 'Complete 25 lessons',
          icon: '📚',
          earned: completedLessons >= 25,
          progress: completedLessons,
          maxProgress: 25
        }
      ])

      // Mock course recommendations
      setRecommendations([
        {
          id: '1',
          title: 'Advanced Algebra',
          subject: 'Mathematics',
          difficulty: 'Intermediate',
          matchScore: 95,
          reason: 'Based on your strong algebra performance',
          estimatedTime: '6 weeks'
        },
        {
          id: '2',
          title: 'Essay Writing Mastery',
          subject: 'English',
          difficulty: 'Beginner',
          matchScore: 88,
          reason: 'Recommended to improve writing skills',
          estimatedTime: '4 weeks'
        }
      ])

    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 80) return 'text-green-600 bg-green-100'
    if (proficiency >= 60) return 'text-blue-600 bg-blue-100'
    if (proficiency >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getProficiencyLabel = (proficiency: number) => {
    if (proficiency >= 80) return 'Advanced'
    if (proficiency >= 60) return 'Intermediate'
    if (proficiency >= 40) return 'Beginner'
    return 'Novice'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h2>
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
              Go to login
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
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h1>
                  <p className="text-gray-600 capitalize">{userProfile?.role}</p>
                  {stats && (
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                        Level {stats.level}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Zap className="w-4 h-4 mr-1 text-blue-500" />
                        {stats.xp} XP
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Target className="w-4 h-4 mr-1 text-green-500" />
                        {stats.streak} day streak
                      </div>
                    </div>
                  )}
                </div>
                <Link 
                  href="/profile/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* XP Progress Bar */}
              {stats && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress to Level {stats.level + 1}</span>
                    <span>{stats.xp - (stats.level - 1) * 500}/{stats.nextLevelXp - (stats.level - 1) * 500} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((stats.xp - (stats.level - 1) * 500) / (stats.nextLevelXp - (stats.level - 1) * 500)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'skills', name: 'Skills & Progress', icon: Brain },
              { id: 'achievements', name: 'Achievements', icon: Award },
              { id: 'recommendations', name: 'Recommendations', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                        <p className="text-sm text-green-600 mt-1">📚 Enrolled</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-primary-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.completedLessons}</p>
                        <p className="text-sm text-blue-600 mt-1">
                          {stats.totalLessons - stats.completedLessons} remaining
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          {stats.averageScore >= 80 ? '🎯 Excellent!' : '📈 Keep improving'}
                        </p>
                      </div>
                      <Trophy className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Study Time</p>
                        <p className="text-3xl font-bold text-gray-900">{Math.round(stats.timeSpent / 60)}h</p>
                        <p className="text-sm text-purple-600 mt-1">This month</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link 
                      href="/courses"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                        <span className="font-medium">Browse Courses</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">View Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>

                    <Link 
                      href="/forum"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Join Discussion</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{skill.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(skill.proficiency)}`}>
                        {getProficiencyLabel(skill.proficiency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Proficiency Chart */}
                      <div className="lg:col-span-2">
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Proficiency</span>
                            <span>{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                skill.proficiency >= 80 ? 'bg-green-500' :
                                skill.proficiency >= 60 ? 'bg-blue-500' :
                                skill.proficiency >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                            <ul className="space-y-1">
                              {skill.strengths.map((strength, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-700 mb-2">Areas to Improve</h4>
                            <ul className="space-y-1">
                              {skill.areasToImprove.map((area, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Recent Progress */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Recent Progress</h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">+{skill.recentProgress}%</div>
                          <div className="text-sm text-gray-500">This week</div>
                        </div>
                        <div className="mt-4">
                          <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                            Take Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`bg-white rounded-xl border shadow-sm p-6 transition-all ${
                      achievement.earned ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`text-3xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          {achievement.earned && (
                            <span className="text-yellow-600 font-medium text-sm">Earned!</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                        
                        {achievement.progress !== undefined && achievement.maxProgress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {achievement.earned && achievement.earnedDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600">{rec.subject} • {rec.difficulty}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">{rec.matchScore}%</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Est. {rec.estimatedTime}</span>
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                            Start Course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
