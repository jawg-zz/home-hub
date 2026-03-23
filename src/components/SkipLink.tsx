'use client'

export default function SkipLink() {
  return (
    <a 
      href="#main-content" 
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1rem',
        background: 'var(--primary)',
        color: '#0f0f0f',
        textDecoration: 'none',
        borderRadius: '4px',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '1rem'
        e.currentTarget.style.top = '1rem'
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px'
      }}
    >
      Skip to main content
    </a>
  )
}
