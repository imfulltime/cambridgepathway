'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrading: number;
  upcomingSessions: number;
}

interface CourseData {
  id: string;
  title: string;
  subject: string;
  level: string;
  enrolledStudents: number;
  completionRate: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'question' | 'enrollment';
  studentName: string;
  courseName: string;
  details: string;
  timestamp: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    upcomingSessions: 0,
  });
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    const supabase = createSupabaseClient();
    
    try {
      // Get teacher profile
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (!teacher) return;

      // Get assigned courses
      const { data: courseAssignments } = await supabase
        .from('course_instructors')
        .select(`
          course_id,
          courses (
            id, title, subject, level
          )
        `)
        .eq('teacher_id', teacher.id);

      const courseIds = courseAssignments?.map(ca => ca.course_id) || [];

      // Get enrollments for assigned courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, user_id')
        .in('course_id', courseIds);

      // Get progress data
      const { data: progress } = await supabase
        .from('progress')
        .select('course_id, user_id, completed, score')
        .in('course_id', courseIds);

      // Get pending submissions for grading
      const { data: pendingSubmissions } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          assignments!inner (
            course_id
          )
        `)
        .in('assignments.course_id', courseIds)
        .eq('status', 'submitted');

      // Get upcoming sessions
      const { data: upcomingSessions } = await supabase
        .from('class_sessions')
        .select('id')
        .eq('teacher_id', teacher.id)
        .gte('session_date', new Date().toISOString())
        .eq('is_published', true);

      // Process course data
      const coursesData = courseAssignments?.map(ca => {
        const course = ca.courses;
        const courseEnrollments = enrollments?.filter(e => e.course_id === ca.course_id) || [];
        const courseProgress = progress?.filter(p => p.course_id === ca.course_id) || [];
        
        const completedCount = courseProgress.filter(p => p.completed).length;
        const totalLessons = courseProgress.length;
        const completionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
        
        const scores = courseProgress.filter(p => p.score !== null).map(p => p.score || 0);
        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        return {
          id: course.id,
          title: course.title,
          subject: course.subject,
          level: course.level,
          enrolledStudents: courseEnrollments.length,
          completionRate: Math.round(completionRate),
          averageScore: Math.round(averageScore),
        };
      }) || [];

      setCourses(coursesData);

      // Calculate stats
      const uniqueStudents = new Set(enrollments?.map(e => e.user_id) || []).size;
      setStats({
        totalCourses: courseIds.length,
        totalStudents: uniqueStudents,
        pendingGrading: pendingSubmissions?.length || 0,
        upcomingSessions: upcomingSessions?.length || 0,
      });

      // Get recent forum posts in teacher's courses
      const { data: recentPosts } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          created_at,
          users (first_name, last_name),
          courses (title)
        `)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(5);

      const activityData: RecentActivity[] = recentPosts?.map(post => ({
        id: post.id,
        type: 'question' as const,
        studentName: `${post.users?.first_name} ${post.users?.last_name}`,
        courseName: post.courses?.title || '',
        details: post.title,
        timestamp: post.created_at,
      })) || [];

      setRecentActivity(activityData);

      // Get announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .in('target_audience', ['teachers', 'all'])
        .order('published_at', { ascending: false })
        .limit(5);

      setAnnouncements(announcementsData || []);

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to teachers.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your courses, students, and track progress</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-2 0V3a2 2 0 012-2h2a2 2 0 012 2v2M9 5a2 2 0 012 2v2a2 2 0 01-2 2m-2 0a2 2 0 00-2 2v2a2 2 0 002 2h2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingGrading}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V5a2 2 0 112 2m-8 2v4a2 2 0 002 2h4a2 2 0 002-2v-4m-8 0V9a2 2 0 112 2m0 0v4a2 2 0 01-2 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingSessions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Create New Course
                </button>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No courses assigned yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Contact admin to get course assignments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {course.subject}
                              </span>
                              <span>{course.level}</span>
                              <span>{course.enrolledStudents} students</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-600">Completion Rate</p>
                                <div className="flex items-center mt-1">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full" 
                                      style={{ width: `${course.completionRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{course.completionRate}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Average Score</p>
                                <p className="text-lg font-semibold text-gray-900">{course.averageScore}%</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2">
                            <Link
                              href={`/teacher/courses/${course.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Manage
                            </Link>
                            <Link
                              href={`/teacher/grades/${course.id}`}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Grades
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {activity.type === 'question' && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.studentName}</span>
                            {' '}posted a question in{' '}
                            <span className="font-medium">{activity.courseName}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📝 Create Assignment
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📅 Schedule Session
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📢 Post Announcement
                </button>
                <Link
                  href="/forum"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  💬 View Forum
                </Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📊 View Analytics
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              </div>
              <div className="p-6">
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No announcements</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-green-400 pl-4">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-sm">No upcoming sessions</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                  Schedule New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
