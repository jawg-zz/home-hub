import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await auth()
  
  const users = await prisma.user.findMany()

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: '#666' }}>Manage your account and preferences</p>
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
              <div style={{ color: '#666' }}>{session?.user?.email}</div>
            </div>
          </div>
          
          <form style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
                Display Name
              </label>
              <input type="text" defaultValue={session?.user?.name || ''} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
                Email
              </label>
              <input type="email" defaultValue={session?.user?.email || ''} style={{ width: '100%' }} disabled />
            </div>
            <button type="button" className="btn btn-primary" style={{ width: 'fit-content' }}>
              Save Changes
            </button>
          </form>
        </div>

        {/* Family Members */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>👨‍👩‍👧‍👦 Family Members</h2>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
            {users.map((user) => (
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
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{user.email}</div>
                </div>
                <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            + Add Family Member
          </button>
        </div>
      </div>

      {/* Home Assistant */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>🏠 Home Assistant Integration</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Connect to your Home Assistant instance to sync devices and control them from here.
        </p>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              HA URL
            </label>
            <input type="url" placeholder="http://homeassistant:8123" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌙 Dark Mode
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ☀️ Light Mode
          </button>
        </div>
      </div>
    </div>
  )
}
