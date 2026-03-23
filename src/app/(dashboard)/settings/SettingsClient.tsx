'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'

type User = {
  id: string
  name: string | null
  email: string
  role: string
}

type SessionUser = {
  name?: string | null
  email?: string | null
}

export default function SettingsPage({ 
  session, 
  users 
}: { 
  session: { user?: SessionUser } | null
  users: User[] 
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [themeLoading, setThemeLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [name, setName] = useState(session?.user?.name || '')
  const { showToast } = useToast()

  const toggleTheme = async (newTheme: 'dark' | 'light') => {
    setThemeLoading(true)
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    setTimeout(() => {
      setThemeLoading(false)
      showToast(`Switched to ${newTheme} mode`, 'success')
    }, 300)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Failed to save profile:', error)
      showToast('Failed to update profile', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: '#999' }}>Manage your account and preferences</p>
      </header>

      <div className="grid grid-2">
        {/* Profile */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>👤 Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#0f0f0f',
            }}>
              {session?.user?.name?.[0] || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{session?.user?.name}</div>
              <div style={{ color: '#999' }}>{session?.user?.email}</div>
            </div>
          </div>
          
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
                Display Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
                Email
              </label>
              <input type="email" defaultValue={session?.user?.email || ''} style={{ width: '100%' }} disabled />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: 'fit-content' }}
              disabled={saveLoading}
            >
              {saveLoading ? 'Loading...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Family Members */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>👨‍👩‍👧‍👦 Family Members</h2>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
            {users.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem 1rem',
                color: '#999',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>No family members yet</p>
                <p style={{ fontSize: '0.875rem' }}>Add family members to share access</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#151515',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}>
                    {user.name?.[0] || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                    <div style={{ color: '#999', fontSize: '0.75rem' }}>{user.email}</div>
                  </div>
                  <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'}`}>
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            + Add Family Member
          </button>
        </div>
      </div>

      {/* Home Assistant */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>🏠 Home Assistant Integration</h2>
        <p style={{ color: '#999', marginBottom: '1rem' }}>
          Connect to your Home Assistant instance to sync devices and control them from here.
        </p>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
              HA URL
            </label>
            <input type="url" placeholder="http://homeassistant:8123" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
              Long-Lived Access Token
            </label>
            <input type="password" placeholder="Paste your token" style={{ width: '100%' }} />
          </div>
          <button type="button" className="btn btn-primary">
            Connect
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>🎨 Appearance</h2>
        <p style={{ color: '#999', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Choose your preferred theme. Changes apply immediately.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => toggleTheme('dark')}
            className={theme === 'dark' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={themeLoading}
          >
            🌙 Dark Mode {theme === 'dark' && '✓'}
          </button>
          <button 
            onClick={() => toggleTheme('light')}
            className={theme === 'light' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem'
            }}
            disabled={themeLoading}
          >
            ☀️ Light Mode {theme === 'light' && '✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
