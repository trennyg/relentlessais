'use client'
import { useState, useEffect } from 'react'

export default function MumbaiClock({ small = false }: { small?: boolean }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      // IST = UTC + 5:30
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const ist = new Date(utc + 5.5 * 3600000)
      const h = String(ist.getHours()).padStart(2, '0')
      const m = String(ist.getMinutes()).padStart(2, '0')
      const s = String(ist.getSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: small ? 9 : 10,
          color: '#38BDF8',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        MUMBAI
      </span>
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: small ? 11 : 13,
          color: '#666',
          letterSpacing: '0.05em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {time || '00:00:00'}
      </span>
    </div>
  )
}
