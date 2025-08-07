'use client'

import Link from 'next/link'
import { ArrowRight, Play, BookOpen, Users, Award } from 'lucide-react'
import { useLanguage, useAuth } from '@/components/providers'

export function HeroSection() {
  const { t } = useLanguage()
  const { user } = useAuth()

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">{t('hero.title')}</span>
              <span className="block text-primary-600">Online</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl md:mt-8">
              {t('hero.subtitle')}
            </p>
            
            {/* Statistics */}
            <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">10+</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">1000+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                </Link>
              )}
              
              <Link
                href="/courses"
                className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200"
              >
                <Play className="mr-2 -ml-1 w-5 h-5" />
                View Demo
              </Link>
            </div>
          </div>

          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              {/* Hero Image/Video Placeholder */}
              <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                <img
                  className="w-full h-64 lg:h-80 object-cover"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                  alt="Students learning online"
                />
                <div className="absolute inset-0 bg-primary-600 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110">
                    <Play className="w-6 h-6 text-primary-600 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute top-4 -left-4 bg-white rounded-lg shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">IGCSE Math</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">100% Complete</div>
            </div>

            <div className="absolute bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-accent-600" />
                <span className="text-sm font-medium">Certificate</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Earned</div>
            </div>

            <div className="absolute -top-2 right-8 bg-white rounded-lg shadow-lg p-3 transform hover:scale-110 transition-transform duration-300">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium">Live Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
