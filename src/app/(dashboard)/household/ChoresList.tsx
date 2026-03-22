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

  const addChore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChore.trim()) return
    
    const res = await fetch('/api/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newChore }),
    })
    const chore = await res.json()
    setChores([chore, ...chores])
    setNewChore('')
  }

  const toggleChore = async (id: string, completed: boolean) => {
    await fetch(`/api/chores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    setChores(chores.map(c => c.id === id ? { ...c, completed: !completed } : c))
  }

  const deleteChore = async (id: string) => {
    await fetch(`/api/chores/${id}`, { method: 'DELETE' })
    setChores(chores.filter(c => c.id !== id))
  }

  return (
    <div>
      <form onSubmit={addChore} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newChore}
          onChange={(e) => setNewChore(e.target.value)}
          placeholder="Add chore..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">Add</button>
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
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ 
              flex: 1, 
              textDecoration: chore.completed ? 'line-through' : 'none',
              color: chore.completed ? '#666' : '#e0e0e0',
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
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '0.25rem',
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
      opacity: deleteLoading === chore.id ? 0.5 : 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {chores.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No chores yet</p>
        )}
      </div>
    </div>
  )
}
() => deleteChore(chore.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {chores.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No chores yet</p>
        )}
      </div>
    </div>
  )
}
