'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

const OVERFLOW       = 160   // canvas bleeds 160 px past each card edge
const ORBIT_DURATION = 4
const TRAIL_FRACTION = 0.35
const N_TRAIL        = 60

interface GlowBorderProps {
  children:  React.ReactNode
  className?: string
}

// ── Point on card perimeter at normalised t (0..1, clockwise) ────────────────
function perimPoint(t: number, w: number, h: number): [number, number] {
  const norm  = ((t % 1) + 1) % 1
  const perim = 2 * (w + h)
  const dist  = norm * perim
  if (dist < w)         return [dist,          0             ]   // top   L→R
  if (dist < w + h)     return [w,             dist - w      ]   // right T→B
  if (dist < 2*w + h)   return [w-(dist-w-h),  h             ]   // bot   R→L
  return                       [0,              h-(dist-2*w-h)]   // left  B→T
}

// ── Build the N_TRAIL+1 canvas-coord trail points for a given headT ───────────
function buildTrail(
  headT:    number,
  w:        number,
  h:        number,
  overflow: number,
): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= N_TRAIL; i++) {
    const t = headT - TRAIL_FRACTION + (i / N_TRAIL) * TRAIL_FRACTION
    const [px, py] = perimPoint(t, w, h)
    pts.push([px + overflow, py + overflow])
  }
  return pts
}

// ── Draw one comet (smoke + trail + hot-point bloom) ─────────────────────────
// ctx.globalAlpha must be pre-set by the caller for the comet-fade effect.
// pts:        N_TRAIL+1 canvas-coord points (tail → head)
// smokePts:   N_TRAIL+1 points for the TRAIL_FRACTION region behind the tail
// rgb:        body colour [r, g, b]
// alphaScale: relative intensity (1.0 = blue comet, 0.70 = ghost white comet)
//
// All blur via ctx.shadowBlur (GPU-composited) — no ctx.filter is used.
function drawComet(
  ctx:        CanvasRenderingContext2D,
  pts:        [number, number][],
  smokePts:   [number, number][],
  rgb:        [number, number, number],
  alphaScale: number,
): void {
  const [hx, hy] = pts[N_TRAIL]
  const [r0, g0, b0] = rgb
  const rStr = `${r0},${g0},${b0}`

  ctx.lineCap  = 'butt'
  ctx.lineJoin = 'round'

  // ── SMOKE / AFTERGLOW — drawn first so it sits underneath the comet ───────
  // Covers the TRAIL_FRACTION region behind the main tail.
  // Single path with gradient stroke; shadowBlur provides the soft bleed.
  {
    const sg = ctx.createLinearGradient(
      smokePts[0][0], smokePts[0][1],
      smokePts[N_TRAIL][0], smokePts[N_TRAIL][1],
    )
    sg.addColorStop(0, `rgba(${rStr},0)`)
    sg.addColorStop(1, `rgba(${rStr},${(0.06 * alphaScale).toFixed(3)})`)

    ctx.save()
    ctx.shadowBlur  = 30
    ctx.shadowColor = `rgba(${rStr},${(0.15 * alphaScale).toFixed(3)})`
    ctx.lineWidth   = 6
    ctx.strokeStyle = sg
    ctx.beginPath()
    ctx.moveTo(smokePts[0][0], smokePts[0][1])
    for (let i = 1; i <= N_TRAIL; i++) ctx.lineTo(smokePts[i][0], smokePts[i][1])
    ctx.stroke()
    ctx.restore()
  }

  // ── PASS 1: Broad ambient glow — single path, GPU shadowBlur ─────────────
  // Skip first 8 segments so near-zero-alpha tail pixels have no geometry
  // for the shadow to smear into a dot artefact.
  {
    const ag = ctx.createLinearGradient(
      pts[8][0], pts[8][1],
      pts[N_TRAIL][0], pts[N_TRAIL][1],
    )
    ag.addColorStop(0, `rgba(${rStr},0)`)
    ag.addColorStop(1, `rgba(${rStr},${(0.45 * alphaScale).toFixed(3)})`)

    ctx.save()
    ctx.shadowBlur  = 20
    ctx.shadowColor = `rgba(${rStr},${(0.50 * alphaScale).toFixed(3)})`
    ctx.lineWidth   = 10
    ctx.strokeStyle = ag
    ctx.beginPath()
    ctx.moveTo(pts[8][0], pts[8][1])
    for (let i = 9; i <= N_TRAIL; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.stroke()
    ctx.restore()
  }

  // ── PASS 2: Medium glow — single path, lighter shadowBlur ────────────────
  {
    const mg = ctx.createLinearGradient(
      pts[0][0], pts[0][1],
      pts[N_TRAIL][0], pts[N_TRAIL][1],
    )
    mg.addColorStop(0, `rgba(${rStr},0)`)
    mg.addColorStop(1, `rgba(${rStr},${(0.85 * alphaScale).toFixed(3)})`)

    ctx.save()
    ctx.shadowBlur  = 6
    ctx.shadowColor = `rgba(${rStr},${(0.40 * alphaScale).toFixed(3)})`
    ctx.lineWidth   = 4
    ctx.strokeStyle = mg
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i <= N_TRAIL; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.stroke()
    ctx.restore()
  }

  // ── PASS 3: Sharp core — per-segment, no shadow, blue body → white-hot tip ─
  ctx.shadowBlur = 0   // save/restore above restores 0, but be explicit
  ctx.lineWidth  = 2
  for (let i = 0; i < N_TRAIL; i++) {
    const p         = i / N_TRAIL
    const alpha     = p * alphaScale
    const whiteness = Math.max(0, (p - 0.90) / 0.10)
    const r = Math.round(r0 + (255 - r0) * whiteness)
    const g = Math.round(g0 + (255 - g0) * whiteness)
    const b = Math.round(b0 + (255 - b0) * whiteness)
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
    ctx.beginPath()
    ctx.moveTo(pts[i][0], pts[i][1])
    ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
    ctx.stroke()
  }

  // ── HOT-POINT BLOOM — 4 radial gradients, additive compositing ───────────
  ctx.shadowBlur = 0   // prevent shadow bleed into bloom gradients
  ctx.globalCompositeOperation = 'lighter'

  // Layer 4: outer halo bleed  r = 160
  const l4 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 160)
  l4.addColorStop(0, `rgba(${rStr},${(0.10 * alphaScale).toFixed(3)})`)
  l4.addColorStop(1, `rgba(${rStr},0)`)
  ctx.fillStyle = l4; ctx.beginPath(); ctx.arc(hx, hy, 160, 0, Math.PI * 2); ctx.fill()

  // Layer 3: spread  r = 80
  const l3 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 80)
  l3.addColorStop(0, `rgba(${rStr},${(0.30 * alphaScale).toFixed(3)})`)
  l3.addColorStop(1, `rgba(${rStr},0)`)
  ctx.fillStyle = l3; ctx.beginPath(); ctx.arc(hx, hy, 80, 0, Math.PI * 2); ctx.fill()

  // Layer 2: mid  r = 32
  const l2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 32)
  l2.addColorStop(0, `rgba(${rStr},${(0.70 * alphaScale).toFixed(3)})`)
  l2.addColorStop(1, `rgba(${rStr},0)`)
  ctx.fillStyle = l2; ctx.beginPath(); ctx.arc(hx, hy, 32, 0, Math.PI * 2); ctx.fill()

  // Layer 1: white-hot core  r = 10
  const l1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10)
  l1.addColorStop(0, `rgba(255,255,255,${(0.90 * alphaScale).toFixed(3)})`)
  l1.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = l1; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill()

  // Reset composite mode for next draw call
  ctx.globalCompositeOperation = 'source-over'
}

// ─────────────────────────────────────────────────────────────────────────────

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

      // ── Two comets — only drawn when partially/fully visible ──────────────
      const ca = cometAlphaRef.current
      if (ca > 0) {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const headT =
          ((timestamp - startTimeRef.current) / 1000 % ORBIT_DURATION) / ORBIT_DURATION

        // Comet A: blue — at headT
        const ptsA   = buildTrail(headT,                    w, h, OVERFLOW)
        const smokeA = buildTrail(headT       - TRAIL_FRACTION, w, h, OVERFLOW)
        // Comet B: ghost white — half perimeter behind
        const ptsB   = buildTrail(headT + 0.5,              w, h, OVERFLOW)
        const smokeB = buildTrail(headT + 0.5 - TRAIL_FRACTION, w, h, OVERFLOW)

        // Apply comet-fade to all draw calls via globalAlpha
        ctx.globalAlpha = ca
        ctx.globalCompositeOperation = 'source-over'

        drawComet(ctx, ptsA, smokeA, [56, 189, 248],  1.00)   // blue comet
        drawComet(ctx, ptsB, smokeB, [220, 230, 255], 0.70)   // ghost white comet

        ctx.globalAlpha = 1
      }

      // ── Advance comet alpha ───────────────────────────────────────────────
      cometAlphaRef.current = isHoveredRef.current
        ? Math.min(1, cometAlphaRef.current + 0.06)
        : Math.max(0, cometAlphaRef.current - 0.04)

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
    // drawFrame continues while cometAlphaRef.current > 0 then self-cancels
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
        Canvas extends OVERFLOW (160) px past each card edge via negative
        top/left so the hot-point halo bleeds into the page background.
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
