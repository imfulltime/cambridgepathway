'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalCourses: number;
  activeEnrollments: number;
  totalLessons: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface UserGrowth {
  month: string;
  students: number;
  teachers: number;
  parents: number;
}

interface SystemLog {
  id: string;
  action: string;
  user_email: string;
  resource_type: string;
  details: any;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  level: string;
  instructor_name: string;
  enrollments: number;
  completion_rate: number;
  is_published: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    totalLessons: 0,
    systemHealth: 'good',
  });
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    const supabase = createSupabaseClient();
    
    try {
      // Get user statistics
      const { data: users } = await supabase
        .from('users')
        .select('role, created_at');

      const { data: students } = await supabase
        .from('students')
        .select('id');

      const { data: teachers } = await supabase
        .from('teachers')
        .select('id');

      const { data: courses } = await supabase
        .from('courses')
        .select('*');

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id');

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*');

      // Calculate stats
      const totalUsers = users?.length || 0;
      const totalStudents = users?.filter(u => u.role === 'student').length || 0;
      const totalTeachers = users?.filter(u => u.role === 'teacher').length || 0;
      const totalParents = users?.filter(u => u.role === 'parent').length || 0;
      
      setStats({
        totalUsers,
        totalStudents,
        totalTeachers,
        totalParents,
        totalCourses: courses?.length || 0,
        activeEnrollments: enrollments?.filter(e => e.is_active).length || 0,
        totalLessons: lessons?.length || 0,
        systemHealth: 'good', // TODO: Implement health check
      });

      // Get course data with enrollments
      const coursesWithData = await Promise.all(
        (courses || []).map(async (course) => {
          const { data: courseEnrollments } = await supabase
            .from('enrollments')
            .select('user_id')
            .eq('course_id', course.id)
            .eq('is_active', true);

          const { data: progress } = await supabase
            .from('progress')
            .select('completed, user_id')
            .eq('course_id', course.id);

          const uniqueUsers = new Set(progress?.map(p => p.user_id) || []).size;
          const completedCount = progress?.filter(p => p.completed).length || 0;
          const totalProgress = progress?.length || 0;
          const completionRate = totalProgress > 0 ? (completedCount / totalProgress) * 100 : 0;

          return {
            id: course.id,
            title: course.title,
            subject: course.subject,
            level: course.level,
            instructor_name: course.instructor_name,
            enrollments: courseEnrollments?.length || 0,
            completion_rate: Math.round(completionRate),
            is_published: course.is_published,
            created_at: course.created_at,
          };
        })
      );

      setCourses(coursesWithData);

      // Get recent system logs
      const { data: logs } = await supabase
        .from('system_logs')
        .select(`
          *,
          users (email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const systemLogsData = logs?.map(log => ({
        id: log.id,
        action: log.action,
        user_email: log.users?.email || 'System',
        resource_type: log.resource_type || '',
        details: log.details,
        created_at: log.created_at,
      })) || [];

      setSystemLogs(systemLogsData);

      // Generate user growth data (mock for now)
      const growth: UserGrowth[] = [
        { month: 'Jan', students: 25, teachers: 3, parents: 15 },
        { month: 'Feb', students: 45, teachers: 5, parents: 28 },
        { month: 'Mar', students: 78, teachers: 8, parents: 52 },
        { month: 'Apr', students: 120, teachers: 12, parents: 85 },
        { month: 'May', students: totalStudents, teachers: totalTeachers, parents: totalParents },
      ];
      setUserGrowth(growth);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform management and analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Course Management</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Create Course
                </button>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No courses created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {course.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                course.is_published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {course.subject}
                              </span>
                              <span>{course.level}</span>
                              <span>{course.enrollments} enrollments</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-xs text-gray-600">Completion Rate</p>
                                <div className="flex items-center mt-1">
                                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full" 
                                      style={{ width: `${course.completion_rate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{course.completion_rate}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Instructor</p>
                                <p className="text-sm font-medium">{course.instructor_name || 'Unassigned'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Edit
                            </button>
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                              Analytics
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Logs */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Activity</h2>
              </div>
              <div className="p-6">
                {systemLogs.length === 0 ? (
                  <p className="text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {systemLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="flex items-center space-x-3 text-sm">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <span className="font-medium">{log.user_email}</span>
                          <span className="text-gray-600"> {log.action} </span>
                          {log.resource_type && (
                            <span className="text-gray-600">a {log.resource_type}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString()}
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
            {/* System Health */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">All Systems Operational</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600">✓ Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Authentication</span>
                    <span className="text-green-600">✓ Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="text-green-600">✓ Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">API</span>
                    <span className="text-green-600">✓ Healthy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  👥 Manage Users
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📚 Add Course
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  👨‍🏫 Assign Teacher
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📢 Send Announcement
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📊 View Reports
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  ⚙️ System Settings
                </button>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {userGrowth.slice(-3).map((data, index) => (
                    <div key={data.month} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{data.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-600">{data.students}S</span>
                        <span className="text-green-600">{data.teachers}T</span>
                        <span className="text-purple-600">{data.parents}P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Platform Metrics</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Enrollments</span>
                  <span className="text-sm font-medium">{stats.activeEnrollments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Lessons</span>
                  <span className="text-sm font-medium">{stats.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Forum Posts</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quiz Attempts</span>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
