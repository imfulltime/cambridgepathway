'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface UserSettings {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  location?: string
  bio?: string
  gradeLevel?: string
  subjects: string[]
  profileImage?: string
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  courseReminders: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  privacy: {
    showProfile: boolean
    showProgress: boolean
    allowMessages: boolean
  }
}

const subjects = [
  'Mathematics',
  'English Literature', 
  'English Language',
  'Science',
  'History',
  'Geography',
  'Art',
  'Music',
  'Computer Science',
  'Business Studies'
]

const gradeLevels = [
  'Grade 9 (IGCSE Year 1)',
  'Grade 10 (IGCSE Year 2)', 
  'Grade 11 (A-Level Year 1)',
  'Grade 12 (A-Level Year 2)',
  'University Preparation',
  'Adult Learner'
]

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (user && userProfile) {
      loadSettings()
    }
  }, [user, userProfile])

  const loadSettings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get student data if user is a student
      let studentData = null
      if (userProfile?.role === 'student') {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single()
        studentData = data
      }

      setSettings({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        location: '',
        bio: '',
        gradeLevel: studentData?.grade_level || '',
        subjects: studentData?.subjects || [],
        profileImage: userProfile?.profileImage || '',
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        courseReminders: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        privacy: {
          showProfile: true,
          showProgress: true,
          allowMessages: true
        }
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates })
    }
  }

  const saveSettings = async () => {
    if (!settings || !user) return

    try {
      setSaving(true)
      
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: settings.firstName,
          last_name: settings.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update student data if applicable
      if (userProfile?.role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .upsert({
            user_id: user.id,
            grade_level: settings.gradeLevel,
            subjects: settings.subjects,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        if (studentError) throw studentError
      }

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error saving settings: ' + error.message)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage('New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      setMessage('Password must be at least 6 characters long')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      setPasswords({ current: '', new: '', confirm: '' })
      setMessage('Password updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error updating password: ' + error.message)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      // Note: In a real app, you'd typically soft-delete or deactivate accounts
      // rather than hard delete due to data protection regulations
      setMessage('Account deletion requested. Please contact support to complete the process.')
    } catch (error: any) {
      setMessage('Error processing deletion request: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!settings) return null

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'account', name: 'Account', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/profile"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors`}
                >
                  <section.icon className="w-5 h-5 mr-3" />
                  {section.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border">
              
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {settings.firstName[0]}{settings.lastName[0]}
                      </div>
                      <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50">
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-500">Upload a photo to personalize your account</p>
                      <div className="flex space-x-3 mt-2">
                        <button className="text-sm text-primary-600 hover:text-primary-700">Upload</button>
                        <button className="text-sm text-gray-600 hover:text-gray-700">Remove</button>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => updateSettings({ firstName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => updateSettings({ lastName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => updateSettings({ phone: e.target.value })}
                        placeholder="Optional"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Academic Info */}
                  {userProfile?.role === 'student' && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level
                          </label>
                          <select
                            value={settings.gradeLevel || ''}
                            onChange={(e) => updateSettings({ gradeLevel: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                          >
                            <option value="">Select Grade Level</option>
                            {gradeLevels.map((level) => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subjects of Interest
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                            {subjects.map((subject) => (
                              <label key={subject} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.subjects.includes(subject)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      updateSettings({ subjects: [...settings.subjects, subject] })
                                    } else {
                                      updateSettings({ subjects: settings.subjects.filter(s => s !== subject) })
                                    }
                                  }}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{subject}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={settings.bio || ''}
                      onChange={(e) => updateSettings({ bio: e.target.value })}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Course Reminders</h3>
                        <p className="text-sm text-gray-500">Get reminded about upcoming lessons and deadlines</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.courseReminders}
                          onChange={(e) => updateSettings({ courseReminders: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Weekly Digest</h3>
                        <p className="text-sm text-gray-500">Weekly summary of your progress and activities</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.weeklyDigest}
                          onChange={(e) => updateSettings({ weeklyDigest: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="mt-8 flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* Privacy & Security Section */}
              {activeSection === 'privacy' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
                  
                  {/* Privacy Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Show Profile</h4>
                          <p className="text-sm text-gray-500">Allow others to see your profile information</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showProfile}
                            onChange={(e) => updateSettings({ 
                              privacy: { ...settings.privacy, showProfile: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Show Progress</h4>
                          <p className="text-sm text-gray-500">Allow others to see your learning progress</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showProgress}
                            onChange={(e) => updateSettings({ 
                              privacy: { ...settings.privacy, showProgress: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:border-primary-500 focus:ring-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>

                      <button
                        onClick={changePassword}
                        disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                        className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{saving ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Section */}
              {activeSection === 'account' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Management</h2>
                  
                  {/* Account Info */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{userProfile?.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Member Since:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(userProfile?.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Status:</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-3">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          onClick={deleteAccount}
                          disabled={saving}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{saving ? 'Processing...' : 'Delete Account'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                        className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                        className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="mt-8 flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
