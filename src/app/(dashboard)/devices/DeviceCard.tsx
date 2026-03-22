'use client'

import { useState } from 'react'

type Device = {
  id: string
  name: string
  type: string
  room: string
  status: string
  value: number
  online: boolean
}

export default function DeviceCard({ device }: { device: Device }) {
  const [isOn, setIsOn] = useState(device.status === 'on' || device.status === 'locked')
  const [loading, setLoading] = useState(false)

  const toggleDevice = async () => {
    setLoading(true)
    try {
      const newStatus = isOn ? 'off' : 'on'
      await fetch(`/api/devices/${device.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setIsOn(!isOn)
    } catch {
      console.error('Failed to toggle device')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = () => {
    switch (device.type) {
      case 'light': return '💡'
      case 'lock': return isOn ? '🔒' : '🔓'
      case 'thermostat': return '🌡️'
      case 'plug': return '🔌'
      case 'garage': return '🚗'
      case 'sprinkler': return '💦'
      default: return '📟'
    }
  }

  return (
    <div className="card" style={{ 
      opacity: device.online ? 1 : 0.5,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{getIcon()}</span>
        <span className={`badge ${device.online ? 'badge-success' : 'badge-offline'}`}>
          {device.online ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <h3 style={{ marginBottom: '0.25rem' }}>{device.name}</h3>
      <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1rem' }}>{device.room}</p>
      
      {device.type === 'light' && isOn && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Brightness</span>
            <span>{device.value}%</span>
          </div>
          <div style={{ 
            height: '4px', 
            background: '#333', 
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{ 
              height: '100%', 
              width: `${device.value}%`, 
              background: '#00d4aa',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {device.type === 'thermostat' && (
        <div style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
          {device.value}°C
        </div>
      )}

      <button
        onClick={toggleDevice}
        disabled={!device.online || loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: isOn ? '#00d4aa' : '#1a1a1a',
          color: isOn ? '#0f0f0f' : '#666',
          border: isOn ? 'none' : '1px solid #333',
          borderRadius: '8px',
          fontWeight: 500,
          cursor: !device.online || loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? '...' : isOn ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  )
}
 >
        {loading ? 'Loading...' : isOn ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  )
}
