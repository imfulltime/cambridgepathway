'use client'

import Link from 'next/link'
import { CheckCircle, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-gray-600 mb-6">
          We sent you a verification link. Please check your inbox and click the link to activate your account.
        </p>
        <div className="flex items-center justify-center text-green-600 mb-6">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Haven't received it? Check your spam folder.</span>
        </div>
        <Link href="/auth/login" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          Back to login
        </Link>
      </div>
    </div>
  )
}


