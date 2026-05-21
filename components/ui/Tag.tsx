import React from 'react'

interface TagProps {
  children: React.ReactNode
  className?: string
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: 10,
        color: '#666',
        border: '1px solid #1A1A1A',
        borderRadius: 2,
        padding: '3px 8px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}
