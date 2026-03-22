'use client'

import { prisma } from '@/lib/prisma'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

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
        <p style={{ color: '#666' }}>Monitor your home energy consumption</p>
      </header>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem' }}>This Month</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {Math.round(totalUsage)} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>kWh</span>
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem' }}>Estimated Cost</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff6b35' }}>
            KES {Math.round(totalCost * 150)}
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem' }}>Daily Average</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {avgDaily.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>kWh</span>
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#666', fontSize: '0.875rem' }}>Status</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00d4aa' }}>
            Normal
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>⚡ Daily Usage (kWh)</h2>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#e0e0e0' }}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#00d4aa" 
                fillOpacity={1} 
                fill="url(#colorUsage)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Chart */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>💰 Daily Cost (KES)</h2>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#e0e0e0' }}
                formatter={(value: unknown) => {
                  if (value === undefined || value === null) return ['', ''];
                  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                  return [`KES ${(numValue * 150).toFixed(0)}`, 'Cost'];
                }}
              />
              <Bar dataKey="cost" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>💡 Energy Saving Tips</h2>
        <div className="grid grid-3">
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
            <div style={{ fontWeight: 500 }}>Use LED Bulbs</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Switch to LED lights - they use 75% less energy</div>
          </div>
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌡️</div>
            <div style={{ fontWeight: 500 }}>Smart Thermostat</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Set schedules to reduce heating/cooling when away</div>
          </div>
          <div style={{ padding: '1rem', background: '#151515', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔌</div>
            <div style={{ fontWeight: 500 }}>Unplug Devices</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Standby power can account for 10% of your bill</div>
          </div>
        </div>
      </div>
    </div>
  )
}
