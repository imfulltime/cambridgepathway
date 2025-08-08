'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function LiveDiagnosticsPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const addResult = (message: string) => {
    setResults(prev => [...prev, message])
  }

  const runDiagnostics = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Starting live deployment diagnostics...')
      
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      addResult(`📍 Current domain: ${window.location.origin}`)
      addResult(`🔗 Supabase URL: ${supabaseUrl || 'NOT SET'}`)
      addResult(`🔑 Supabase Key: ${supabaseKey ? `Set (${supabaseKey.length} chars)` : 'NOT SET'}`)
      
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        addResult('❌ Supabase URL is not configured properly')
        return
      }
      
      if (!supabaseKey) {
        addResult('❌ Supabase anonymous key is missing')
        return
      }
      
      // Test database connection
      try {
        const { data: courses, error: dbError } = await supabase
          .from('courses')
          .select('count')
          .limit(1)
        
        if (dbError) {
          addResult(`❌ Database error: ${dbError.message}`)
        } else {
          addResult('✅ Database connection successful')
        }
      } catch (err: any) {
        addResult(`❌ Database connection failed: ${err.message}`)
      }
      
      // Test auth health
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/health`)
        if (response.ok) {
          addResult('✅ Auth service is healthy')
        } else {
          addResult(`⚠️ Auth service responded with: ${response.status}`)
        }
      } catch (err: any) {
        addResult(`❌ Auth service unreachable: ${err.message}`)
      }
      
      // Test auth configuration
      try {
        const testEmail = `test-${Date.now()}@yourcompany.com`
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'testpassword123',
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email`,
            data: {
              first_name: 'Test',
              last_name: 'User',
              role: 'student'
            }
          }
        })
        
        if (authError) {
          if (authError.message.includes('Email address')) {
            addResult('✅ Auth is working (email validation active)')
          } else {
            addResult(`❌ Auth error: ${authError.message}`)
          }
        } else {
          addResult('✅ Auth signup test successful')
        }
      } catch (err: any) {
        addResult(`❌ Auth test failed: ${err.message}`)
      }
      
      addResult('🏁 Diagnostics complete!')
      
    } catch (error: any) {
      addResult(`💥 Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Live Deployment Diagnostics
          </h1>
          
          <div className="mb-4">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Diagnostics...' : 'Re-run Diagnostics'}
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            {results.length === 0 ? (
              <div>Ready to run diagnostics...</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
          
          {!loading && results.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Ensure Vercel environment variables are set</li>
                <li>2. Update Supabase Site URL and Redirect URLs</li>
                <li>3. Wait 2-3 minutes for Vercel deployment</li>
                <li>4. Test signup/login with a real email address</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
