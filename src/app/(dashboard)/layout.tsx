import { ReactNode } from 'react'
import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/devices', label: 'Devices', icon: '💡' },
  { href: '/household', label: 'Household', icon: '👨‍👩‍👧‍👦' },
  { href: '/security', label: 'Security', icon: '🔒' },
  { href: '/energy', label: 'Energy', icon: '⚡' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#0f0f0f',
        borderRight: '1px solid #1a1a1a',
        padding: '1.5rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>🏠</span>
            <span style={{
              background: 'linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Home Hub
            </span>
          </Link>
        </div>

        <nav style={{ marginBottom: '2rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#888',
                textDecoration: 'none',
                marginBottom: '0.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '1.5rem',
          borderTop: '1px solid #1a1a1a' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#0f0f0f',
            }}>
              {session.user?.name?.[0] || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {session.user?.name || 'User'}
              </div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>
                {session.user?.email}
              </div>
            </div>
          </div>
          
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button type="submit" style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#666',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        background: '#0a0a0a',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
