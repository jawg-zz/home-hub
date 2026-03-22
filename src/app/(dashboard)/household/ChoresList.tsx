'use client'

import { useState } from 'react'

type Chore = {
  id: string
  title: string
  assignedTo: string | null
  completed: boolean
}

export default function ChoresList({ chores: initialChores }: { chores: Chore[] }) {
  const [chores, setChores] = useState(initialChores)
  const [newChore, setNewChore] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const addChore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChore.trim() || addLoading) return
    
    setAddLoading(true)
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newChore }),
      })
      if (!res.ok) throw new Error('Failed to add chore')
      const chore = await res.json()
      setChores([chore, ...chores])
      setNewChore('')
    } catch (error) {
      console.error('Failed to add chore:', error)
      alert('Failed to add chore')
    } finally {
      setAddLoading(false)
    }
  }

  const toggleChore = async (id: string, completed: boolean) => {
    const previousChores = [...chores]
    setChores(chores.map(c => c.id === id ? { ...c, completed: !completed } : c))
    
    try {
      const res = await fetch(`/api/chores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (!res.ok) throw new Error('Failed to toggle chore')
    } catch (error) {
      setChores(previousChores)
      console.error('Failed to toggle chore:', error)
      alert('Failed to update chore')
    }
  }

  const deleteChore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chore?')) return
    
    const previousChores = [...chores]
    setDeleteLoading(id)
    setChores(chores.filter(c => c.id !== id))
    
    try {
      const res = await fetch(`/api/chores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete chore')
    } catch (error) {
      setChores(previousChores)
      console.error('Failed to delete chore:', error)
      alert('Failed to delete chore')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div>
      <form onSubmit={addChore} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newChore}
          onChange={(e) => setNewChore(e.target.value)}
          placeholder="Add chore..."
          disabled={addLoading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={addLoading}>
          {addLoading ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {chores.map((chore) => (
          <div key={chore.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: '#151515',
            borderRadius: '8px',
            opacity: chore.completed ? 0.5 : 1,
          }}>
            <input
              type="checkbox"
              checked={chore.completed}
              onChange={() => toggleChore(chore.id, chore.completed)}
              aria-label={`Mark ${chore.title} as ${chore.completed ? 'incomplete' : 'complete'}`}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ 
              flex: 1, 
              textDecoration: chore.completed ? 'line-through' : 'none',
              color: chore.completed ? '#999' : '#e0e0e0',
            }}>
              {chore.title}
            </span>
            {chore.assignedTo && (
              <span style={{ 
                background: '#222', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#888',
              }}>
                {chore.assignedTo}
              </span>
            )}
            <button
              onClick={() => deleteChore(chore.id)}
              aria-label={`Delete ${chore.title}`}
              disabled={deleteLoading === chore.id}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: deleteLoading === chore.id ? 'not-allowed' : 'pointer',
                padding: '0.25rem',
                opacity: deleteLoading === chore.id ? 0.5 : 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {chores.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No chores yet</p>
        )}
      </div>
    </div>
  )
}
