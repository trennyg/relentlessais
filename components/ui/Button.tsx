'use client'
import { motion } from 'framer-motion'
import React from 'react'

interface ButtonProps {
  variant?: 'filled' | 'ghost'
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function Button({
  variant = 'filled',
  children,
  onClick,
  href,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    fontFamily: 'var(--font-dm-sans)',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 2,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
  }

  const filled: React.CSSProperties = { backgroundColor: '#38BDF8', color: '#080808' }
  const ghost: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#F0EDE6',
    border: '1px solid #1A1A1A',
  }

  const style = { ...base, ...(variant === 'filled' ? filled : ghost) }

  const motionProps = {
    whileHover: { scale: 1.02, filter: 'brightness(1.1)' },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  }

  if (href) {
    return (
      <motion.a href={href} style={style} className={className} {...motionProps}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
