'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { User as AppUser } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
})

export const useLanguage = () => useContext(LanguageContext)

// Simple translation object - in production, this would be loaded from files
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Forum',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'hero.title': 'Master Cambridge Curriculum',
    'hero.subtitle': 'Learn IGCSE Math and English with our comprehensive online platform',
    'hero.cta': 'Start Learning Today',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.courses': 'Cursos',
    'nav.dashboard': 'Panel',
    'nav.forum': 'Foro',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'hero.title': 'Domina el Currículo de Cambridge',
    'hero.subtitle': 'Aprende Matemáticas y Inglés IGCSE con nuestra plataforma integral en línea',
    'hero.cta': 'Comienza a Aprender Hoy',
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('en')

  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Load language preference
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Skip if using placeholder Supabase config
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        return
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      if (data) {
        setUserProfile({
          id: data.id,
          email: data.email,
          role: data.role,
          firstName: data.first_name,
          lastName: data.last_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          profileImage: data.profile_image,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    </AuthContext.Provider>
  )
}
