'use client'

import { useState } from 'react'

type Item = {
  id: string
  name: string
  quantity: string | null
  checked: boolean
}

export default function ShoppingList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems)
  const [newItem, setNewItem] = useState('')

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    
    const res = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItem }),
    })
    const item = await res.json()
    setItems([item, ...items])
    setNewItem('')
  }

  const toggleItem = async (id: string, checked: boolean) => {
    await fetch(`/api/shopping/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked: !checked }),
    })
    setItems(items.map(i => i.id === id ? { ...i, checked: !checked } : i))
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div>
      <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {items.map((item) => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: '#151515',
            borderRadius: '8px',
            opacity: item.checked ? 0.5 : 1,
          }}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id, item.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ 
              flex: 1, 
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? '#666' : '#e0e0e0',
            }}>
              {item.name}
              {item.quantity && <span style={{ color: '#666', marginLeft: '0.5rem' }}>{item.quantity}</span>}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
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
        {items.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No items yet</p>
        )}
      </div>
    </div>
  )
}
