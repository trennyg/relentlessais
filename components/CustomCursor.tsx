'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef(0)
  const isGrown = useRef(false)

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(hover: none)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return
    cursor.style.opacity = '1'

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = (e: Event) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [data-cursor="grow"]')) {
        isGrown.current = true
      }
    }

    const onLeave = (e: Event) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [data-cursor="grow"]')) {
        isGrown.current = false
      }
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.12)
      posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.12)

      if (cursor) {
        const size = isGrown.current ? 40 : 16
        const op = isGrown.current ? 0.35 : 0.85
        cursor.style.left = `${posRef.current.x}px`
        cursor.style.top = `${posRef.current.y}px`
        cursor.style.width = `${size}px`
        cursor.style.height = `${size}px`
        cursor.style.opacity = `${op}`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        borderRadius: '50%',
        backgroundColor: '#38BDF8',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference',
        transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
        opacity: 0,
        width: 16,
        height: 16,
      }}
      aria-hidden="true"
    />
  )
}
