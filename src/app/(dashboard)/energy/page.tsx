import { prisma } from '@/lib/prisma'
import EnergyChart from './EnergyChart'

export default async function EnergyPage() {
  // Get energy data from database
  const readings = await prisma.energyReading.findMany({
    orderBy: { date: 'asc' },
    take: 30,
  })

  const chartData = readings.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    usage: Math.round(r.usage * 10) / 10,
    cost: Math.round(r.cost * 100) / 100,
  }))

  const totalUsage = readings.reduce((sum, r) => sum + r.usage, 0)
  const totalCost = readings.reduce((sum, r) => sum + r.cost, 0)
  const avgDaily = totalUsage / readings.length

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Energy</h1>
        <p style={{ color: '#999' }}>Monitor your home energy consumption</p>
      </header>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: '#999', fontSize: '0.875rem' }}>This Month</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {Math.round(totalUsage)} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>kWh</span>
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#999', fontSize: '0.875rem' }}>Estimated Cost</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff6b35' }}>
            KES {Math.round(totalCost * 150)}
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#999', fontSize: '0.875rem' }}>Daily Average</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {avgDaily.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>kWh</span>
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#999', fontSize: '0.875rem' }}>Status</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00d4aa' }}>
            Normal
          </div>
        </div>
      </div>

      {/* Charts */}
      <EnergyChart data={chartData} />

      {/* Tips */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>💡 Energy Saving Tips</h2>
        <div className="grid grid-3">
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
            <div style={{ fontWeight: 500 }}>Use LED Bulbs</div>
            <div style={{ color: '#999', fontSize: '0.875rem' }}>Switch to LED lights - they use 75% less energy</div>
          </div>
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌡️</div>
            <div style={{ fontWeight: 500 }}>Smart Thermostat</div>
            <div style={{ color: '#999', fontSize: '0.875rem' }}>Set schedules to reduce heating/cooling when away</div>
          </div>
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔌</div>
            <div style={{ fontWeight: 500 }}>Unplug Devices</div>
            <div style={{ color: '#999', fontSize: '0.875rem' }}>Standby power can account for 10% of your bill</div>
          </div>
        </div>
      </div>
    </div>
  )
}
