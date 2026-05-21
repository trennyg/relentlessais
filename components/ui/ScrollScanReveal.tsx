'use client'

import { useEffect, useRef } from 'react'

export default function ScrollScanReveal() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion — skip everything, leave page fully visible
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const main = document.querySelector('main') as HTMLElement | null
    if (!main || !lineRef.current) return

    const line = lineRef.current

    // ── State held in refs so no React re-renders are triggered ──────────
    // Target: scroll bottom edge of viewport in document space
    // Current: lerped toward target each frame
    let targetY  = window.scrollY + window.innerHeight
    let currentY = window.scrollY + window.innerHeight // start = full first screen visible
    let rafId    = 0
    let dirty    = true // process at least one frame on mount

    // ── Apply mask + move scan line ───────────────────────────────────────
    const applyReveal = (y: number) => {
      const docH = document.body.scrollHeight

      if (y >= docH - 10) {
        // Reached the bottom — remove mask entirely so nothing is clipped
        main.style.maskImage         = ''
        main.style.webkitMaskImage   = ''
        line.style.opacity           = '0'
      } else {
        // Gradient mask: black (opaque) above the line, transparent below
        const mask = `linear-gradient(to bottom, black 0px, black ${y}px, transparent ${y + 2}px, transparent 100%)`
        main.style.maskImage         = mask
        main.style.webkitMaskImage   = mask
        line.style.transform         = `translateY(${y}px)`
        line.style.opacity           = '1'
      }
    }

    // Apply initial position immediately so first screen is visible without flash
    applyReveal(currentY)

    // ── RAF loop ──────────────────────────────────────────────────────────
    const loop = () => {
      // Update target from dirty scroll events
      if (dirty) {
        targetY = window.scrollY + window.innerHeight
        dirty   = false
      }

      // Lerp: factor 0.08 → line trails scroll smoothly
      const delta = targetY - currentY
      if (Math.abs(delta) > 0.25) {
        currentY += delta * 0.08
        applyReveal(currentY)
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    // ── Scroll listener sets dirty flag only ─────────────────────────────
    const onScroll = () => { dirty = true }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      // Clean up mask when component unmounts
      if (main) {
        main.style.maskImage       = ''
        main.style.webkitMaskImage = ''
      }
    }
  }, [])

  return (
    <div
      ref={lineRef}
      style={{
        // Fixed in viewport; transform places it in document space
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        60,
        background:    'transparent',
        border:        '1px solid rgba(56,189,248,0.25)',
        pointerEvents: 'none',
        zIndex:        40,
        willChange:    'transform',
        // Hidden until first frame positions it correctly
        opacity:       0,
      }}
      aria-hidden="true"
    >
      {/* Glowing horizontal scan line — centred inside the 60px band */}
      <div
        style={{
          position:  'absolute',
          top:       '50%',
          left:      0,
          right:     0,
          height:    2,
          transform: 'translateY(-50%)',
          background: 'linear-gradient(to right, transparent 0%, rgba(56,189,248,0.6) 20%, rgba(56,189,248,0.6) 80%, transparent 100%)',
          filter:    'blur(3px)',
        }}
      />

      {/* Crisp 1 px core on top of the blurred glow */}
      <div
        style={{
          position:  'absolute',
          top:       '50%',
          left:      0,
          right:     0,
          height:    1,
          transform: 'translateY(-50%)',
          background: 'linear-gradient(to right, transparent 0%, rgba(56,189,248,0.9) 20%, rgba(56,189,248,0.9) 80%, transparent 100%)',
        }}
      />

      {/* Glowing dot at right end */}
      <div
        style={{
          position:        'absolute',
          top:             '50%',
          right:           24,
          transform:       'translateY(-50%)',
          width:           8,
          height:          8,
          borderRadius:    '50%',
          backgroundColor: '#38BDF8',
          boxShadow:       '0 0 12px #38BDF8, 0 0 24px rgba(56,189,248,0.4)',
        }}
      />
    </div>
  )
}
