import { ReactNode } from 'react'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { ToastProvider } from '@/components/Toast'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  const signOutAction = async () => {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <ToastProvider>
      <a 
        href="#main-content" 
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '1rem',
          background: 'var(--primary)',
          color: '#0f0f0f',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '1rem'
          e.currentTarget.style.top = '1rem'
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px'
        }}
      >
        Skip to main content
      </a>
      <DashboardNav session={session} signOutAction={signOutAction}>
        {children}
      </DashboardNav>
    </ToastProvider>
  )
}
