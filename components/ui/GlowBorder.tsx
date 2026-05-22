'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

interface GlowBorderProps {
  children: React.ReactNode
  className?: string
}

export default function GlowBorder({ children, className }: GlowBorderProps) {
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number>(0)
  const startTimeRef  = useRef<number>(0)   // rAF timestamp when orbit began
  const isHoveredRef  = useRef(false)
  const opacityRef    = useRef(0)
  const shouldReduce  = useReducedMotion() ?? false

  // ── Draw one frame ────────────────────────────────────────────────────────
  const drawFrame = useCallback((timestamp: number) => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Keep canvas pixel resolution in sync with DOM size
    const w = wrapper.offsetWidth
    const h = wrapper.offsetHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w
      canvas.height = h
    }

    ctx.clearRect(0, 0, w, h)

    // ── Perimeter position (clockwise, 2.5s full orbit) ──────────────────
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const t    = ((timestamp - startTimeRef.current) / 1000 % 2.5) / 2.5  // 0..1
    const perim = 2 * (w + h)
    const dist  = t * perim
    let x = 0, y = 0
    if (dist < w) {
      // Top: left → right
      x = dist; y = 0
    } else if (dist < w + h) {
      // Right: top → bottom
      x = w; y = dist - w
    } else if (dist < 2 * w + h) {
      // Bottom: right → left
      x = w - (dist - w - h); y = h
    } else {
      // Left: bottom → top
      x = 0; y = h - (dist - 2 * w - h)
    }

    // ── Glow dot — 3 stacked radial gradients, 'lighter' bloom ──────────
    ctx.globalCompositeOperation = 'lighter'

    // Outer soft halo  (r = 28)
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 28)
    halo.addColorStop(0, 'rgba(56,189,248,0.12)')
    halo.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(x, y, 28, 0, Math.PI * 2)
    ctx.fill()

    // Mid glow  (r = 12)
    const mid = ctx.createRadialGradient(x, y, 0, x, y, 12)
    mid.addColorStop(0, 'rgba(56,189,248,0.5)')
    mid.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = mid
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fill()

    // Bright core  (r = 4)
    const core = ctx.createRadialGradient(x, y, 0, x, y, 4)
    core.addColorStop(0, 'rgba(56,189,248,1.0)')
    core.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // ── Fade canvas in (~17 frames) / out (~25 frames at 60 fps) ─────────
    if (isHoveredRef.current) {
      opacityRef.current = Math.min(1, opacityRef.current + 0.06)
    } else {
      opacityRef.current = Math.max(0, opacityRef.current - 0.04)
    }
    canvas.style.opacity = String(opacityRef.current)

    // Keep looping while visible or still fading in
    if (opacityRef.current > 0 || isHoveredRef.current) {
      rafRef.current = requestAnimationFrame(drawFrame)
    }
  }, [])   // refs never change — empty dep array is correct here

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current  = true
    startTimeRef.current  = 0   // reset orbit to start fresh each hover
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(drawFrame)
  }, [drawFrame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left)  / r.width  - 0.5
    const y = (e.clientY - r.top)   / r.height - 0.5
    el.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false
    const el = wrapperRef.current
    if (el) el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    // drawFrame fades canvas to 0 and self-cancels
  }, [])

  // ── Init canvas size + cleanup ────────────────────────────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (canvas && wrapper) {
      canvas.width  = wrapper.offsetWidth
      canvas.height = wrapper.offsetHeight
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Reduced-motion: static glowing border, no animation ──────────────────
  if (shouldReduce) {
    return (
      <div
        className={className}
        style={{
          position:   'relative',
          background: '#111111',
          border:     '1px solid rgba(56,189,248,0.5)',
          borderRadius: 2,
        }}
      >
        {children}
      </div>
    )
  }

  // ── Full animated version ─────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position:        'relative',
        background:      '#111111',
        border:          '1px solid rgba(56,189,248,0.4)',
        borderRadius:    2,
        transition:      'transform 0.15s ease',
        transformStyle:  'preserve-3d',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Canvas overlay — paints travelling glow dot, never receives pointer events */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'absolute',
          inset:         0,
          width:         '100%',
          height:        '100%',
          pointerEvents: 'none',
          zIndex:        10,
          opacity:       0,
        }}
      />
      {children}
    </div>
  )
}
