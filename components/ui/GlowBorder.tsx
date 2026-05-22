'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

// Canvas extends this many px past every card edge so the 120px outer halo
// bleeds into the page background instead of being clipped.
const OVERFLOW       = 120
const ORBIT_DURATION = 4      // seconds per full clockwise orbit
const TRAIL_FRACTION = 0.35   // fraction of perimeter the tail spans
const N_TRAIL        = 60     // trail segments (quality vs. cost trade-off)

interface GlowBorderProps {
  children:  React.ReactNode
  className?: string
}

// ── Utility: point on the card perimeter at normalised position t (0..1 CW) ──
function perimPoint(t: number, w: number, h: number): [number, number] {
  const norm  = ((t % 1) + 1) % 1          // ensure 0..1, handle negatives
  const perim = 2 * (w + h)
  const dist  = norm * perim
  if (dist < w)         return [dist,          0         ]   // top   L→R
  if (dist < w + h)     return [w,             dist - w  ]   // right T→B
  if (dist < 2*w + h)   return [w-(dist-w-h),  h         ]   // bot   R→L
  return                       [0,              h-(dist-2*w-h)]  // left  B→T
}

export default function GlowBorder({ children, className }: GlowBorderProps) {
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const isHoveredRef = useRef(false)
  const opacityRef   = useRef(0)
  const shouldReduce = useReducedMotion() ?? false

  // ── Main rAF drawing function ─────────────────────────────────────────────
  const drawFrame = useCallback((timestamp: number) => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions; canvas is OVERFLOW px larger on every side
    const w  = wrapper.offsetWidth
    const h  = wrapper.offsetHeight
    const cw = w + OVERFLOW * 2
    const ch = h + OVERFLOW * 2
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width  = cw
      canvas.height = ch
    }

    ctx.clearRect(0, 0, cw, ch)

    // ── Head position along perimeter (4 s orbit) ─────────────────────────
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const headT =
      ((timestamp - startTimeRef.current) / 1000 % ORBIT_DURATION) / ORBIT_DURATION

    // ── Build trail point array — index 0 = tail end, N = head ───────────
    // All points are offset by OVERFLOW so they sit correctly on the canvas.
    const pts: [number, number][] = []
    for (let i = 0; i <= N_TRAIL; i++) {
      const t = headT - TRAIL_FRACTION + (i / N_TRAIL) * TRAIL_FRACTION
      const [px, py] = perimPoint(t, w, h)
      pts.push([px + OVERFLOW, py + OVERFLOW])
    }
    const [hx, hy] = pts[N_TRAIL]   // head on canvas coords

    // ─────────────────────────────────────────────────────────────────────
    // TRAIL — drawn source-over (no blowout) in 3 passes: broad blur →
    // medium blur → sharp core.  The last 10% of each pass fades blue→white.
    // ─────────────────────────────────────────────────────────────────────
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap  = 'round'
    ctx.lineJoin = 'round'

    // Helper: colour at trail position p (0=tail, 1=head), at given alpha scale
    const trailColor = (p: number, alphaScale: number): string => {
      const alpha    = p * alphaScale
      const whiteness = Math.max(0, (p - 0.90) / 0.10)   // 0 until 90%, then 0→1
      const r = Math.round(56  + (255 - 56)  * whiteness)
      const g = Math.round(189 + (255 - 189) * whiteness)
      const b = Math.round(248 + (255 - 248) * whiteness)
      return `rgba(${r},${g},${b},${alpha.toFixed(3)})`
    }

    // Pass 1 — broad ambient glow (blurred, single path, uniform tint)
    ctx.save()
    ctx.filter    = 'blur(20px)'
    ctx.lineWidth = 10
    ctx.strokeStyle = 'rgba(56,189,248,0.45)'
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i <= N_TRAIL; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.stroke()
    ctx.restore()

    // Pass 2 — medium glow (blurred, per-segment alpha + white tip)
    ctx.save()
    ctx.filter    = 'blur(5px)'
    ctx.lineWidth = 4
    for (let i = 0; i < N_TRAIL; i++) {
      const p = i / N_TRAIL
      ctx.strokeStyle = trailColor(p, 0.85)
      ctx.beginPath()
      ctx.moveTo(pts[i][0], pts[i][1])
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
      ctx.stroke()
    }
    ctx.restore()

    // Pass 3 — sharp core (no blur, per-segment, full blue→white)
    ctx.lineWidth = 2
    for (let i = 0; i < N_TRAIL; i++) {
      const p = i / N_TRAIL
      ctx.strokeStyle = trailColor(p, 1.0)
      ctx.beginPath()
      ctx.moveTo(pts[i][0], pts[i][1])
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
      ctx.stroke()
    }

    // ─────────────────────────────────────────────────────────────────────
    // HOT POINT — 4 stacked radial gradients with 'lighter' bloom
    // ─────────────────────────────────────────────────────────────────────
    ctx.globalCompositeOperation = 'lighter'

    // Layer 4: outer halo bleed  r = 120
    const l4 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 120)
    l4.addColorStop(0, 'rgba(56,189,248,0.08)')
    l4.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l4
    ctx.beginPath(); ctx.arc(hx, hy, 120, 0, Math.PI * 2); ctx.fill()

    // Layer 3: blue spread  r = 60
    const l3 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 60)
    l3.addColorStop(0, 'rgba(56,189,248,0.3)')
    l3.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l3
    ctx.beginPath(); ctx.arc(hx, hy, 60, 0, Math.PI * 2); ctx.fill()

    // Layer 2: blue mid  r = 24
    const l2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 24)
    l2.addColorStop(0, 'rgba(56,189,248,0.7)')
    l2.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = l2
    ctx.beginPath(); ctx.arc(hx, hy, 24, 0, Math.PI * 2); ctx.fill()

    // Layer 1: white-hot core  r = 8
    const l1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8)
    l1.addColorStop(0, 'rgba(255,255,255,0.9)')
    l1.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = l1
    ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill()

    // ── Canvas opacity — fade in ~17 frames, fade out ~25 frames @ 60 fps ─
    opacityRef.current = isHoveredRef.current
      ? Math.min(1, opacityRef.current + 0.06)
      : Math.max(0, opacityRef.current - 0.04)
    canvas.style.opacity = String(opacityRef.current)

    if (opacityRef.current > 0 || isHoveredRef.current) {
      rafRef.current = requestAnimationFrame(drawFrame)
    }
  }, [])   // all state via refs — empty dep array is correct

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true
    startTimeRef.current = 0   // reset orbit timing on each hover entry
    // Snap border to full brightness
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
      wrapperRef.current.style.borderColor = 'rgba(56,189,248,0.15)'
      wrapperRef.current.style.transform =
        'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    }
    // drawFrame self-cancels as opacity reaches 0
  }, [])

  // ── Mount: sync canvas size; unmount: cancel any live loop ───────────────
  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (canvas && wrapper) {
      canvas.width  = wrapper.offsetWidth  + OVERFLOW * 2
      canvas.height = wrapper.offsetHeight + OVERFLOW * 2
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Reduced-motion fallback — static subtle border, no canvas ────────────
  if (shouldReduce) {
    return (
      <div
        className={className}
        style={{
          position:     'relative',
          background:   '#111111',
          border:       '1px solid rgba(56,189,248,0.5)',
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
        position:       'relative',
        background:     '#111111',
        border:         '1px solid rgba(56,189,248,0.15)',   // subtle at rest
        borderRadius:   2,
        transition:     'transform 0.15s ease',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        Canvas is larger than the card by OVERFLOW px on every side.
        The negative offset lets the 120px outer halo bleed into the page.
        pointer-events: none keeps all card interactions intact.
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
