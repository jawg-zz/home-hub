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
    orderBy: { updatedAt: 'desc' },
  })

  const today = new Date()
  const energyToday = await prisma.energyReading.findFirst({
    where: {
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    },
  })

  // Mock weather data (would typically come from an API)
  const weatherData = {
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    location: 'Nairobi, Kenya',
    icon: '⛅' // Could be dynamic based on condition
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <header className="welcome-header">
        <div className="greeting-section">
          <h1 className="welcome-title">
            Welcome back, <span className="highlight">{session?.user?.name || 'Home'}</span> 👋
          </h1>
          <p className="date-display">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="quick-actions-header">
          <button className="btn btn-secondary">Add Device</button>
          <button className="btn btn-primary">New Task</button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card primary-stat">
          <div className="stat-header">
            <span className="stat-label">Devices Online</span>
            <div className="stat-icon bg-primary-light">
              <span className="icon">💡</span>
            </div>
          </div>
          <div className="stat-value">
            <span className="primary-text">{onlineDevices}</span>
            <span className="stat-subtext">/ {deviceCount}</span>
          </div>
          <div className="stat-footer">
            <span className={`status-indicator ${onlineDevices > 0 ? 'status-active' : 'status-inactive'}`}></span>
            <span className="footer-text">{onlineDevices > 0 ? 'All systems operational' : 'No active devices'}</span>
          </div>
        </div>
        
        <div className="stat-card secondary-stat">
          <div className="stat-header">
            <span className="stat-label">Shopping Items</span>
            <div className="stat-icon bg-accent-light">
              <span className="icon">🛒</span>
            </div>
          </div>
          <div className="stat-value">
            <span className="accent-text">{shoppingItems}</span>
          </div>
          <div className="stat-footer">
            <span className={`status-indicator ${shoppingItems > 0 ? 'status-warning' : 'status-success'}`}></span>
            <span className="footer-text">{shoppingItems > 0 ? 'Items need attention' : 'All items checked'}</span>
          </div>
        </div>

        <div className="stat-card warning-stat">
          <div className="stat-header">
            <span className="stat-label">Pending Chores</span>
            <div className="stat-icon bg-warning-light">
              <span className="icon">🧹</span>
            </div>
          </div>
          <div className="stat-value">
            <span className={`${pendingChores > 0 ? 'warning-text' : 'success-text'}`}>{pendingChores}</span>
          </div>
          <div className="stat-footer">
            <span className={`status-indicator ${pendingChores > 0 ? 'status-warning' : 'status-success'}`}></span>
            <span className="footer-text">{pendingChores > 0 ? 'Chores awaiting completion' : 'No pending chores'}</span>
          </div>
        </div>

        <div className="stat-card neutral-stat">
          <div className="stat-header">
            <span className="stat-label">Energy Today</span>
            <div className="stat-icon bg-neutral-light">
              <span className="icon">⚡</span>
            </div>
          </div>
          <div className="stat-value">
            <span className="neutral-text">{energyToday?.usage.toFixed(1) || '0'}</span>
            <span className="stat-unit">kWh</span>
          </div>
          <div className="stat-footer">
            <span className={`status-indicator ${energyToday?.usage && energyToday.usage > 20 ? 'status-warning' : 'status-success'}`}></span>
            <span className="footer-text">{energyToday?.usage && energyToday.usage > 20 ? 'High usage' : 'Normal consumption'}</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Quick Actions Panel */}
        <section className="panel quick-actions-panel">
          <div className="panel-header">
            <h2 className="panel-title">Quick Actions</h2>
            <a href="/devices" className="view-all-link">View All →</a>
          </div>
          <div className="quick-actions-grid">
            <a href="/devices" className="action-card">
              <div className="action-icon primary-bg">
                <span className="icon">💡</span>
              </div>
              <div className="action-content">
                <h3 className="action-title">Control Devices</h3>
                <p className="action-description">Manage your smart devices</p>
              </div>
            </a>
            
            <a href="/household" className="action-card">
              <div className="action-icon accent-bg">
                <span className="icon">🛒</span>
              </div>
              <div className="action-content">
                <h3 className="action-title">Shopping List</h3>
                <p className="action-description">{shoppingItems} items to buy</p>
              </div>
            </a>

            <a href="/security" className="action-card">
              <div className="action-icon warning-bg">
                <span className="icon">📹</span>
              </div>
              <div className="action-content">
                <h3 className="action-title">Security Cameras</h3>
                <p className="action-description">Check security feeds</p>
              </div>
            </a>

            <a href="/energy" className="action-card">
              <div className="action-icon neutral-bg">
                <span className="icon">🔋</span>
              </div>
              <div className="action-content">
                <h3 className="action-title">Energy Usage</h3>
                <p className="action-description">Monitor consumption</p>
              </div>
            </a>
          </div>
        </section>

        {/* Recent Activity & Weather */}
        <div className="sidebar-grid">
          {/* Recent Activity */}
          <section className="panel recent-activity-panel">
            <div className="panel-header">
              <h2 className="panel-title">Recent Activity</h2>
              <a href="/devices" className="view-all-link">See All →</a>
            </div>
            <div className="activity-list">
              {recentDevices.length > 0 ? (
                recentDevices.map((device) => (
                  <div key={device.id} className="activity-item">
                    <div className="activity-device-info">
                      <div className="activity-icon">
                        {device.type === 'light' ? '💡' : 
                         device.type === 'lock' ? '🔒' : 
                         device.type === 'thermostat' ? '🌡️' : 
                         device.type === 'camera' ? '📷' : 
                         device.type === 'sensor' ? '📡' : '🔌'}
                      </div>
                      <div className="device-details">
                        <h4 className="device-name">{device.name}</h4>
                        <p className="device-location">{device.room?.name || device.room || 'Unknown Room'}</p>
                      </div>
                    </div>
                    <span className={`badge ${device.online ? 'badge-success' : 'badge-offline'}`}>
                      {device.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="icon">📋</span>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </section>

          {/* Weather Widget */}
          <section className="panel weather-panel">
            <div className="panel-header">
              <h2 className="panel-title">Weather</h2>
              <a href="#" className="view-all-link">Details →</a>
            </div>
            <div className="weather-content">
              <div className="current-weather">
                <div className="weather-main">
                  <span className="weather-icon">{weatherData.icon}</span>
                  <div className="weather-temp">
                    <span className="temp-value">{weatherData.temperature}</span>
                    <span className="temp-unit">°C</span>
                  </div>
                </div>
                <div className="weather-location">
                  <span className="location">{weatherData.location}</span>
                  <span className="condition">{weatherData.condition}</span>
                </div>
              </div>
              
              <div className="weather-details">
                <div className="weather-detail">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weatherData.humidity}%</span>
                </div>
                <div className="weather-detail">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{weatherData.windSpeed} km/h</span>
                </div>
                <div className="weather-detail">
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">26°C</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}