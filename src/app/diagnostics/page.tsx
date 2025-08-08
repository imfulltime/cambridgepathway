'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'

export default function DiagnosticsPage() {
  const supabase = createSupabaseClient()
  const [env, setEnv] = useState<any>(null)
  const [authHealth, setAuthHealth] = useState<any>(null)
  const [coursesCount, setCoursesCount] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
    })
    const run = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`
        const res = await fetch(url!, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } })
        setAuthHealth({ status: res.status, ok: res.ok })
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch auth health')
      }
      const { count } = await supabase.from('courses').select('*', { count: 'exact', head: true })
      setCoursesCount(count ?? null)
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Diagnostics</h1>
        {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-2">Environment</div>
          <pre className="text-sm text-gray-700">{JSON.stringify(env, null, 2)}</pre>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-2">Auth Health</div>
          <pre className="text-sm text-gray-700">{JSON.stringify(authHealth, null, 2)}</pre>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-2">Courses Count</div>
          <div className="text-sm text-gray-700">{coursesCount ?? '—'}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


