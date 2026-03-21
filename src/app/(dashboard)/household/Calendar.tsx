'use client'

import { useState } from 'react'

type Event = {
  id: string
  title: string
  date: Date
  description: string | null
}

export default function Calendar({ events: initialEvents }: { events: Event[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return initialEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#e0e0e0',
            cursor: 'pointer',
          }}
        >
          ← Prev
        </button>
        <h3 style={{ fontSize: '1.25rem' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#e0e0e0',
            cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#222', borderRadius: '8px', overflow: 'hidden' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ 
            background: '#1a1a1a', 
            padding: '0.75rem', 
            textAlign: 'center',
            fontWeight: 600,
            color: '#666',
            fontSize: '0.875rem',
          }}>
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayEvents = getEventsForDate(day.date)
          const isToday = day.date.toDateString() === today.toDateString()
          
          return (
            <div key={idx} style={{ 
              background: '#0f0f0f', 
              minHeight: '80px',
              padding: '0.5rem',
              opacity: day.isCurrentMonth ? 1 : 0.3,
            }}>
              <div style={{ 
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#00d4aa' : '#e0e0e0',
                marginBottom: '0.25rem',
              }}>
                {day.date.getDate()}
              </div>
              {dayEvents.slice(0, 2).map(event => (
                <div key={event.id} style={{
                  fontSize: '0.7rem',
                  background: '#1a1a1a',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
