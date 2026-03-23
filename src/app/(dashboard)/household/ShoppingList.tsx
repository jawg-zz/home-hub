'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'

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
  const { showToast } = useToast()

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
      showToast('Item added to shopping list', 'success')
    } catch (error) {
      console.error('Failed to add item:', error)
      showToast('Failed to add item', 'error')
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
      showToast(!checked ? 'Item checked off' : 'Item unchecked', 'success')
    } catch (error) {
      setItems(previousItems)
      console.error('Failed to toggle item:', error)
      showToast('Failed to update item', 'error')
    }
  }

  const deleteItem = async (id: string) => {
    const itemToDelete = items.find(i => i.id === id)
    if (!itemToDelete) return
    
    const previousItems = [...items]
    setDeleteLoading(id)
    setItems(items.filter(i => i.id !== id))
    
    try {
      const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      
      showToast('Item deleted', 'success', {
        label: 'Undo',
        onClick: async () => {
          setItems(previousItems)
          try {
            await fetch('/api/shopping', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: itemToDelete.name, quantity: itemToDelete.quantity }),
            })
          } catch {
            showToast('Failed to restore item', 'error')
          }
        }
      })
    } catch (error) {
      setItems(previousItems)
      console.error('Failed to delete item:', error)
      showToast('Failed to delete item', 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div>
      <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <label htmlFor="shopping-input" style={{ position: 'absolute', left: '-9999px' }}>
          Add new shopping item
        </label>
        <input
          id="shopping-input"
          ref={inputRef}
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          disabled={addLoading}
          aria-invalid={false}
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={addLoading}
          aria-busy={addLoading}
        >
          {addLoading ? 'Loading...' : 'Add'}
        </button>
      </form>

      <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: '#999',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Shopping list is empty</p>
            <p style={{ fontSize: '0.875rem' }}>Add items you need to buy</p>
          </div>
        ) : (
          items.map((item) => (
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
                  padding: '0.5rem',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: deleteLoading === item.id ? 0.5 : 1,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #00d4aa'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
              onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
