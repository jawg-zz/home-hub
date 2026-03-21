import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()
  
  const deviceCount = await prisma.device.count()
  const onlineDevices = await prisma.device.count({ where: { online: true } })
  const shoppingItems = await prisma.shoppingItem.count({ where: { checked: false } })
  const pendingChores = await prisma.chore.count({ where: { completed: false } })

  // Get recent activity
  const recentDevices = await prisma.device.findMany({
    take: 4,
    orderBy: { updatedAt: 'desc' }
  })

  const today = new Date()
  const energyToday = await prisma.energyReading.findFirst({
    where: {
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    },
  })

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome back, {session?.user?.name || 'Home'} 👋
        </h1>
        <p style={{ color: '#666' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Devices Online
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00d4aa' }}>
            {onlineDevices} <span style={{ fontSize: '1rem', color: '#666', fontWeight: 400 }}>/ {deviceCount}</span>
          </div>
        </div>
        
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Shopping Items
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {shoppingItems}
          </div>
        </div>

        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Pending Chores
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: pendingChores > 0 ? '#ff6b35' : '#00d4aa' }}>
            {pendingChores}
          </div>
        </div>

        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Energy Today
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {energyToday?.usage.toFixed(1) || '0'} <span style={{ fontSize: '1rem', fontWeight: 400 }}>kWh</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Quick Actions */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <a href="/devices" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: '#151515',
              borderRadius: '8px',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <div style={{ fontWeight: 500 }}>Control Devices</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>Manage your smart devices</div>
              </div>
            </a>
            
            <a href="/household" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: '#151515',
              borderRadius: '8px',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1.5rem' }}>🛒</span>
              <div>
                <div style={{ fontWeight: 500 }}>Shopping List</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>{shoppingItems} items to buy</div>
              </div>
            </a>

            <a href="/security" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: '#151515',
              borderRadius: '8px',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1.5rem' }}>📹</span>
              <div>
                <div style={{ fontWeight: 500 }}>View Cameras</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>Check security feeds</div>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Devices</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentDevices.map((device) => (
              <div key={device.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#151515',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>
                    {device.type === 'light' ? '💡' : device.type === 'lock' ? '🔒' : device.type === 'thermostat' ? '🌡️' : '🔌'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{device.name}</div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>{device.room}</div>
                  </div>
                </div>
                <span className={`badge ${device.online ? 'badge-success' : 'badge-offline'}`}>
                  {device.online ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Weather</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>☀️</span>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>24°C</div>
              <div style={{ color: '#666' }}>Nairobi, Kenya</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', color: '#666' }}>
            <div>
              <div style={{ fontSize: '0.875rem' }}>Humidity</div>
              <div style={{ fontWeight: 500, color: '#e0e0e0' }}>65%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem' }}>Wind</div>
              <div style={{ fontWeight: 500, color: '#e0e0e0' }}>12 km/h</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem' }}>Condition</div>
              <div style={{ fontWeight: 500, color: '#e0e0e0' }}>Partly Cloudy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
