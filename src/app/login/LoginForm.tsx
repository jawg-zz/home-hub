'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validation
    let hasError = false
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      hasError = true
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      hasError = true
    }
    if (hasError) return

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#1a1a1a',
      padding: '2rem',
      borderRadius: '16px',
      border: '1px solid #2a2a2a',
    }}>
      {error && (
        <div style={{
          background: 'rgba(255, 107, 53, 0.1)',
          border: '1px solid #ff6b35',
          color: '#ff6b35',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          color: '#888',
          fontSize: '0.875rem',
        }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError('')
          }}
          required
          style={{ 
            width: '100%',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px #00d4aa'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          placeholder="you@example.com"
        />
        {emailError && (
          <div style={{ color: '#ff6b35', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {emailError}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          color: '#888',
          fontSize: '0.875rem',
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setPasswordError('')
          }}
          required
          style={{ 
            width: '100%',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px #00d4aa'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          placeholder="••••••••"
        />
        {passwordError && (
          <div style={{ color: '#ff6b35', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {passwordError}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '1rem',
          background: loading ? '#333' : '#00d4aa',
          color: loading ? '#666' : '#0f0f0f',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onFocus={(e) => {
          if (!loading) e.currentTarget.style.boxShadow = '0 0 0 2px #00d4aa'
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
