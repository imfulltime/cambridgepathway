'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { createSupabaseClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [saving, setSaving] = useState(false)
  const [gradeLevel, setGradeLevel] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  const toggleSubject = (s: string) => {
    setSubjects((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      await supabase.from('students').upsert({
        user_id: user.id,
        grade_level: gradeLevel || 'grade-9',
        subjects: subjects.length ? subjects : ['Mathematics']
      }, { onConflict: 'user_id' })
      router.replace('/dashboard')
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome{userProfile?.firstName ? `, ${userProfile.firstName}` : ''}!</h1>
        <p className="text-gray-600 mb-6">Tell us a bit more so we can personalize your experience.</p>
        {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
        <div className="space-y-4 bg-white p-6 rounded-xl border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade level</label>
            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select grade</option>
              <option value="grade-9">Grade 9 (Year 10)</option>
              <option value="grade-10">Grade 10 (Year 11)</option>
              <option value="grade-11">Grade 11 (Year 12)</option>
              <option value="grade-12">Grade 12 (Year 13)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {['Mathematics', 'English Literature', 'English Language'].map((s) => (
                <button key={s} type="button" onClick={() => toggleSubject(s)} className={`px-3 py-1 rounded border ${subjects.includes(s) ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-700 border-gray-200'}`}>{s}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Saving…' : 'Continue'}</button>
        </div>
      </div>
    </div>
  )
}


