'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface StudentProgress {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  totalCourses: number;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  currentStreak: number;
  lastActivity: string;
  upcomingAssignments: number;
  recentGrades: Array<{
    itemName: string;
    score: number;
    maxScore: number;
    gradedAt: string;
  }>;
}

interface ParentStats {
  totalChildren: number;
  totalCourses: number;
  averageProgress: number;
  totalLearningTime: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    totalChildren: 0,
    totalCourses: 0,
    averageProgress: 0,
    totalLearningTime: 0,
  });
  const [children, setChildren] = useState<StudentProgress[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    const supabase = createSupabaseClient();
    
    try {
      // Get parent's students
      const { data: parentStudents } = await supabase
        .from('parent_students')
        .select(`
          student_id,
          users!parent_students_student_id_fkey (
            id, first_name, last_name
          ),
          students!parent_students_student_id_fkey (
            grade_level
          )
        `)
        .eq('parent_id', user!.id);

      if (!parentStudents) return;

      const studentIds = parentStudents.map(ps => ps.student_id);
      
      // Get progress data for all children
      const progressPromises = studentIds.map(async (studentId) => {
        const student = parentStudents.find(ps => ps.student_id === studentId);
        
        // Get enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', studentId);

        // Get total completed lessons
        const { data: progress } = await supabase
          .from('progress')
          .select('lesson_id, completed, score, time_spent_minutes')
          .eq('user_id', studentId);

        // Get total lessons from enrolled courses
        const courseIds = enrollments?.map(e => e.course_id) || [];
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .in('course_id', courseIds);

        // Get recent grades
        const { data: grades } = await supabase
          .from('gradebook')
          .select('item_name, score, max_score, graded_at')
          .eq('student_id', studentId)
          .order('graded_at', { ascending: false })
          .limit(5);

        // Get upcoming assignments count
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id')
          .in('course_id', courseIds)
          .gte('due_date', new Date().toISOString())
          .eq('is_published', true);

        const completedLessons = progress?.filter(p => p.completed).length || 0;
        const totalLessons = lessons?.length || 0;
        const averageScore = progress?.length > 0 
          ? progress.filter(p => p.score !== null).reduce((sum, p) => sum + (p.score || 0), 0) / progress.filter(p => p.score !== null).length
          : 0;
        const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;

        return {
          id: studentId,
          firstName: student?.users?.first_name || '',
          lastName: student?.users?.last_name || '',
          gradeLevel: student?.students?.grade_level || '',
          totalCourses: enrollments?.length || 0,
          completedLessons,
          totalLessons,
          averageScore: Math.round(averageScore),
          currentStreak: 0, // TODO: Calculate streak
          lastActivity: progress?.length > 0 ? progress[0].created_at : '',
          upcomingAssignments: assignments?.length || 0,
          recentGrades: grades || [],
        };
      });

      const childrenData = await Promise.all(progressPromises);
      setChildren(childrenData);

      // Calculate parent stats
      const totalChildren = childrenData.length;
      const totalCourses = childrenData.reduce((sum, child) => sum + child.totalCourses, 0);
      const averageProgress = totalChildren > 0 
        ? childrenData.reduce((sum, child) => sum + (child.totalLessons > 0 ? (child.completedLessons / child.totalLessons) * 100 : 0), 0) / totalChildren
        : 0;

      setStats({
        totalChildren,
        totalCourses,
        averageProgress: Math.round(averageProgress),
        totalLearningTime: 0, // TODO: Sum from all children
      });

      // Get announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .in('target_audience', ['parents', 'all'])
        .order('published_at', { ascending: false })
        .limit(5);

      setAnnouncements(announcementsData || []);

    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to parents.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your children's academic progress and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Children</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalChildren}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalLearningTime}h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Children's Progress</h2>
              </div>
              <div className="p-6">
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No children linked to your account.</p>
                    <p className="text-sm text-gray-400 mt-2">Contact support to link student accounts.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {children.map((child) => (
                      <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {child.firstName} {child.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">Grade: {child.gradeLevel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Avg Score</p>
                            <p className="text-xl font-semibold text-gray-900">{child.averageScore}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Courses</p>
                            <p className="text-lg font-semibold">{child.totalCourses}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Lessons</p>
                            <p className="text-lg font-semibold">{child.completedLessons}/{child.totalLessons}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Assignments</p>
                            <p className="text-lg font-semibold">{child.upcomingAssignments}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Streak</p>
                            <p className="text-lg font-semibold">{child.currentStreak} days</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{child.totalLessons > 0 ? Math.round((child.completedLessons / child.totalLessons) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${child.totalLessons > 0 ? (child.completedLessons / child.totalLessons) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Recent Grades */}
                        {child.recentGrades.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Recent Grades</p>
                            <div className="space-y-1">
                              {child.recentGrades.slice(0, 3).map((grade, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{grade.itemName}</span>
                                  <span className="font-medium">{grade.score}/{grade.maxScore}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      <div key={announcement.id} className="border-l-4 border-blue-400 pl-4">
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/forum"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  📋 View Community Forum
                </Link>
                <Link
                  href="/courses"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  📚 Browse Courses
                </Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📧 Contact Teachers
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  📊 Download Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}