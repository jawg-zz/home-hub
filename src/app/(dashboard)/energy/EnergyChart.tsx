'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type ChartData = {
  date: string
  usage: number
  cost: number
}

export default function EnergyChart({ data }: { data: ChartData[] }) {
  return (
    <>
      {/* Usage Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Daily Usage (kWh)</h2>
        <div 
          style={{ width: '100%', height: '300px' }}
          role="img"
          aria-label={`Energy usage chart showing ${data.length} days of data. Average usage: ${(data.reduce((sum, d) => sum + d.usage, 0) / data.length).toFixed(1)} kWh per day.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#e0e0e0' }}
                formatter={(value: unknown) => {
                  if (value === undefined || value === null) return ['', ''];
                  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                  return [`${numValue.toFixed(1)} kWh`, 'Usage'];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#00d4aa" 
                strokeWidth={2}
                fill="url(#colorUsage)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Daily Cost (KES)</h2>
        <div 
          style={{ width: '100%', height: '300px' }}
          role="img"
          aria-label={`Energy cost chart showing ${data.length} days of data. Average cost: KES ${(data.reduce((sum, d) => sum + d.cost, 0) * 150 / data.length).toFixed(0)} per day.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
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
    </>
  )
}
