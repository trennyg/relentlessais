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
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number>(0)
  const startTimeRef  = useRef<number>(0)
  const isHoveredRef  = useRef(false)
  const cometAlphaRef = useRef(0)   // 0..1 — comet fade via ctx.globalAlpha
  const cardW         = useRef(0)   // cached by ResizeObserver, never read from DOM in rAF
  const cardH         = useRef(0)
  const shouldReduce  = useReducedMotion() ?? false

  // ── rAF drawing loop ──────────────────────────────────────────────────────
  const drawFrame = useCallback(
    (timestamp: number) => {
      const canvas  = canvasRef.current
      const wrapper = wrapperRef.current
      if (!canvas || !wrapper) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w  = cardW.current
      const h  = cardH.current
      const cw = w + OVERFLOW * 2
      const ch = h + OVERFLOW * 2
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width  = cw
        canvas.height = ch
      }

      ctx.clearRect(0, 0, cw, ch)

      // ── Comet — only when partially/fully visible ─────────────────────────
      const ca = cometAlphaRef.current
      if (ca > 0) {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const headT =
          ((timestamp - startTimeRef.current) / 1000 % ORBIT_DURATION) / ORBIT_DURATION

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

        // Apply comet fade via globalAlpha — paintBorder is already done at 1
        ctx.globalAlpha = ca
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

        // Hot point — 4 radial gradients, additive bloom
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

        // Reset globalAlpha after comet drawing
        ctx.globalAlpha = 1
      }

      // ── Advance comet alpha ───────────────────────────────────────────────
      cometAlphaRef.current = isHoveredRef.current
        ? Math.min(1, cometAlphaRef.current + 0.06)
        : Math.max(0, cometAlphaRef.current - 0.04)

      // Keep looping while comet is visible; stop at rest (border persists on canvas)
      if (isHoveredRef.current || cometAlphaRef.current > 0) {
        rafRef.current = requestAnimationFrame(drawFrame)
      }
    },
    [],
  )

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true
    startTimeRef.current = 0
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(drawFrame)
  }, [drawFrame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const rawX = (e.clientX - r.left) / r.width  - 0.5
    const rawY = (e.clientY - r.top)  / r.height - 0.5
    const x = Math.max(-0.5, Math.min(0.5, rawX))
    const y = Math.max(-0.5, Math.min(0.5, rawY))
    el.style.transform =
      `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false
    if (wrapperRef.current) {
      wrapperRef.current.style.transform =
        'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    }
    // drawFrame continues while cometAlphaRef.current > 0 then self-cancels;
    // the canvas retains the border at rest color from the last painted frame.
  }, [])

  // ── ResizeObserver: keep canvas pixel dims in sync with wrapper ───────────
  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const syncCanvas = () => {
      const w  = wrapper.offsetWidth
      const h  = wrapper.offsetHeight
      // Cache dimensions — drawFrame reads these refs, never the DOM
      cardW.current = w
      cardH.current = h
      const cw = w + OVERFLOW * 2
      const ch = h + OVERFLOW * 2
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width  = cw
        canvas.height = ch
      }
      // Trigger one rAF so the comet repaints at the correct size if active
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(drawFrame)
    }

    syncCanvas()
    const ro = new ResizeObserver(syncCanvas)
    ro.observe(wrapper)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [drawFrame])

  // ── Reduced-motion fallback ───────────────────────────────────────────────
  if (shouldReduce) {
    return (
      <div
        className={className}
        style={{
          position:     'relative',
          background:   '#111111',
          border:       '1px solid rgba(56,189,248,0.25)',
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
        border:         '1px solid rgba(56,189,248,0.25)',
        borderRadius:   2,
        transition:     'transform 0.15s ease',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        Canvas extends OVERFLOW px past each card edge (negative top/left)
        so the hot-point halo bleeds into the page background.
        opacity: 1 permanently — fade handled via ctx.globalAlpha on comet draws.
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
          opacity:       1,
        }}
      />
      {children}
    </div>
  )
}
