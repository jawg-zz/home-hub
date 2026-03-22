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
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim() || addLoading) return
    
    setAddLoading(true)
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem }),
      })
      if (!res.ok) throw new Error('Failed to add item')
      const item = await res.json()
      setItems([item, ...items])
      setNewItem('')
    } catch (error) {
      console.error('Failed to add item:', error)
      alert('Failed to add item')
    } finally {
      setAddLoading(false)
    }
  }

  const toggleItem = async (id: string, checked: boolean) => {
    const previousItems = [...items]
    setItems(items.map(i => i.id === id ? { ...i, checked: !checked } : i))
    
    try {
      const res = await fetch(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !checked }),
      })
      if (!res.ok) throw new Error('Failed to toggle item')
    } catch (error) {
      setItems(previousItems)
      console.error('Failed to toggle item:', error)
      alert('Failed to update item')
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    const previousItems = [...items]
    setDeleteLoading(id)
    setItems(items.filter(i => i.id !== id))
    
    try {
      const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
    } catch (error) {
      setItems(previousItems)
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div>
      <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          disabled={addLoading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={addLoading}>
          {addLoading ? 'Adding...' : 'Add'}
        </button>
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
              aria-label={`Mark ${item.name} as ${item.checked ? 'unchecked' : 'checked'}`}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ 
              flex: 1, 
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? '#999' : '#e0e0e0',
            }}>
              {item.name}
              {item.quantity && <span style={{ color: '#999', marginLeft: '0.5rem' }}>{item.quantity}</span>}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              aria-label={`Delete ${item.name}`}
              disabled={deleteLoading === item.id}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: deleteLoading === item.id ? 'not-allowed' : 'pointer',
                padding: '0.25rem',
                opacity: deleteLoading === item.id ? 0.5 : 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No items yet</p>
        )}
      </div>
    </div>
  )
}
