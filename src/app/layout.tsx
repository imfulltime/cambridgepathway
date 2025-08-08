import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CambridgePathway - Learn Cambridge Curriculum Online',
  description: 'Master IGCSE Math and English with our comprehensive online learning platform designed for students in non-English speaking countries.',
  keywords: ['Cambridge', 'IGCSE', 'Math', 'English', 'Online Learning', 'Education'],
  authors: [{ name: 'CambridgePathway Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}