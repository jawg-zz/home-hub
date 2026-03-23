'use client'

import useSWR from 'swr'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type ChartData = {
  date: string
  usage: number
  cost: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EnergyChart({ data: initialData }: { data: ChartData[] }) {
  const { data, error, isLoading } = useSWR<ChartData[]>(
    '/api/energy',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Revalidate every 60 seconds
    }
  )

  if (error) {
    return (
      <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#ff6b35' }}>Failed to load energy data</p>
      </div>
    )
  }

  const chartData = data || initialData

  return (
    <>
      {/* Usage Chart */}
      <div className="card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '20px',
            height: '20px',
            border: '2px solid #333',
            borderTop: '2px solid #00d4aa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Daily Usage (kWh)</h2>
        <div 
          style={{ width: '100%', height: '300px' }}
          role="img"
          aria-label={`Energy usage chart showing ${chartData.length} days of data. Average usage: ${(chartData.reduce((sum, d) => sum + d.usage, 0) / chartData.length).toFixed(1)} kWh per day.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
      <div className="card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '20px',
            height: '20px',
            border: '2px solid #333',
            borderTop: '2px solid #00d4aa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Daily Cost (KES)</h2>
        <div 
          style={{ width: '100%', height: '300px' }}
          role="img"
          aria-label={`Energy cost chart showing ${chartData.length} days of data. Average cost: KES ${(chartData.reduce((sum, d) => sum + d.cost, 0) * 150 / chartData.length).toFixed(0)} per day.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
