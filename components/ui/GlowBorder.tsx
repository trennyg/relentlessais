'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

const OVERFLOW       = 120
const ORBIT_DURATION = 4
const TRAIL_FRACTION = 0.35
const N_TRAIL        = 60

interface GlowBorderProps {
  children:  React.ReactNode
  className?: string
}

// ── Point on card perimeter at normalised position t (0..1, clockwise) ───────
function perimPoint(t: number, w: number, h: number): [number, number] {
  const norm  = ((t % 1) + 1) % 1
  const perim = 2 * (w + h)
  const dist  = norm * perim
  if (dist < w)         return [dist,          0             ]   // top   L→R
  if (dist < w + h)     return [w,             dist - w      ]   // right T→B
  if (dist < 2*w + h)   return [w-(dist-w-h),  h             ]   // bot   R→L
  return                       [0,              h-(dist-2*w-h)]   // left  B→T
}

export default function GlowBorder({ children, className }: GlowBorderProps) {
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const isHoveredRef = useRef(false)
  const opacityRef   = useRef(0)        // drives canvas.style.opacity (comet only)
  const shouldReduce = useReducedMotion() ?? false

  // ── rAF loop — draws only the comet; CSS border is always handled by the div ──
  const drawFrame = useCallback((timestamp: number) => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w  = wrapper.offsetWidth
    const h  = wrapper.offsetHeight
    const cw = w + OVERFLOW * 2
    const ch = h + OVERFLOW * 2
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width  = cw
      canvas.height = ch
    }

    ctx.clearRect(0, 0, cw, ch)

    // ── Head position (4 s orbit) ─────────────────────────────────────────
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const headT =
      ((timestamp - startTimeRef.current) / 1000 % ORBIT_DURATION) / ORBIT_DURATION

    // ── Trail: index 0 = tail, index N = head ────────────────────────────
    const pts: [number, number][] = []
    for (let i = 0; i <= N_TRAIL; i++) {
      const t = headT - TRAIL_FRACTION + (i / N_TRAIL) * TRAIL_FRACTION
      const [px, py] = perimPoint(t, w, h)
      pts.push([px + OVERFLOW, py + OVERFLOW])
    }
    const [hx, hy] = pts[N_TRAIL]

    // Colour helper: blue body → white tip in final 10%
    const trailColor = (p: number, scale: number): string => {
      const alpha     = p * scale
      const whiteness = Math.max(0, (p - 0.90) / 0.10)
      const r = Math.round(56  + (255 - 56)  * whiteness)
      const g = Math.round(189 + (255 - 189) * whiteness)
      const b = Math.round(248 + (255 - 248) * whiteness)
      return `rgba(${r},${g},${b},${alpha.toFixed(3)})`
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap  = 'round'
    ctx.lineJoin = 'round'

    // Pass 1 — broad ambient glow (single path, blurred)
    ctx.save()
    ctx.filter      = 'blur(20px)'
    ctx.lineWidth   = 10
    ctx.strokeStyle = 'rgba(56,189,248,0.45)'
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i <= N_TRAIL; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.stroke()
    ctx.restore()

    // Pass 2 — medium glow, per-segment alpha
    ctx.save()
    ctx.filter    = 'blur(5px)'
    ctx.lineWidth = 4
    for (let i = 0; i < N_TRAIL; i++) {
      ctx.strokeStyle = trailColor(i / N_TRAIL, 0.85)
      ctx.beginPath()
      ctx.moveTo(pts[i][0], pts[i][1])
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
      ctx.stroke()
    }
    ctx.restore()

    // Pass 3 — sharp core, per-segment
    ctx.lineWidth = 2
    for (let i = 0; i < N_TRAIL; i++) {
      ctx.strokeStyle = trailColor(i / N_TRAIL, 1.0)
      ctx.beginPath()
      ctx.moveTo(pts[i][0], pts[i][1])
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
      ctx.stroke()
    }

    // ── Hot point — 4 radial gradients, additive bloom ───────────────────
    ctx.globalCompositeOperation = 'lighter'

    const l4 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 120)
    l4.addColorStop(0, 'rgba(56,189,248,0.08)'); l4.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l4; ctx.beginPath(); ctx.arc(hx, hy, 120, 0, Math.PI * 2); ctx.fill()

    const l3 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 60)
    l3.addColorStop(0, 'rgba(56,189,248,0.3)');  l3.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l3; ctx.beginPath(); ctx.arc(hx, hy, 60, 0, Math.PI * 2); ctx.fill()

    const l2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 24)
    l2.addColorStop(0, 'rgba(56,189,248,0.7)');  l2.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l2; ctx.beginPath(); ctx.arc(hx, hy, 24, 0, Math.PI * 2); ctx.fill()

    const l1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8)
    l1.addColorStop(0, 'rgba(255,255,255,0.9)'); l1.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = l1; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill()

    // ── Fade comet canvas in/out — border stays visible via CSS ──────────
    opacityRef.current = isHoveredRef.current
      ? Math.min(1, opacityRef.current + 0.06)
      : Math.max(0, opacityRef.current - 0.04)
    canvas.style.opacity = String(opacityRef.current)

    if (opacityRef.current > 0 || isHoveredRef.current) {
      rafRef.current = requestAnimationFrame(drawFrame)
    }
  }, [])

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true
    startTimeRef.current = 0
    // Snap CSS border to hover brightness instantly
    if (wrapperRef.current) wrapperRef.current.style.borderColor = 'rgba(56,189,248,0.4)'
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(drawFrame)
  }, [drawFrame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    el.style.transform =
      `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false
    if (wrapperRef.current) {
      // Snap CSS border back instantly
      wrapperRef.current.style.borderColor = 'rgba(56,189,248,0.2)'
      wrapperRef.current.style.transform =
        'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    }
    // drawFrame self-cancels as canvas opacity reaches 0
  }, [])

  // ── Mount: init canvas pixel size, cleanup on unmount ────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (canvas && wrapper) {
      canvas.width  = wrapper.offsetWidth  + OVERFLOW * 2
      canvas.height = wrapper.offsetHeight + OVERFLOW * 2
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Reduced-motion fallback ───────────────────────────────────────────────
  if (shouldReduce) {
    return (
      <div
        className={className}
        style={{
          position:     'relative',
          background:   '#111111',
          border:       '1px solid rgba(56,189,248,0.2)',
          borderRadius: 2,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position:       'relative',
        background:     '#111111',
        // CSS owns the complete, unbroken border — canvas draws only the comet
        border:         '1px solid rgba(56,189,248,0.2)',
        borderRadius:   2,
        transition:     'transform 0.15s ease',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        Canvas extends OVERFLOW px past each card edge so the hot-point halo
        bleeds into the page background.  opacity starts at 0 and is driven
        purely by the rAF loop — the CSS border above is always fully visible
        regardless of canvas opacity.
      */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'absolute',
          top:           -OVERFLOW,
          left:          -OVERFLOW,
          width:         `calc(100% + ${OVERFLOW * 2}px)`,
          height:        `calc(100% + ${OVERFLOW * 2}px)`,
          pointerEvents: 'none',
          zIndex:        10,
          opacity:       0,
        }}
      />
      {children}
    </div>
  )
}
