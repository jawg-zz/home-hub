'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error' | 'info', action?: Toast['action']) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', action?: Toast['action']) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, action }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '400px',
        }}
        aria-live={toasts.some(t => t.type === 'error') ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            style={{
              background: toast.type === 'error' ? '#2a1515' : toast.type === 'success' ? '#152a1a' : '#1a1a1a',
              border: `1px solid ${toast.type === 'error' ? '#ff6b35' : toast.type === 'success' ? '#00d4aa' : '#333'}`,
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.2s ease',
            }}
          >
            <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick()
                  removeToast(toast.id)
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #00d4aa',
                  color: '#00d4aa',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1rem',
                lineHeight: 1,
              }}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
