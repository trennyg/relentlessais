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
    <>
      {/* Keyframe for the sweeping highlight — injected locally, no globals.css touch */}
      <style>{`
        @keyframes scanSweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(350%); }
        }
      `}</style>

      <div
        ref={lineRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         '100%',
          height:        60,
          background:    'transparent',
          pointerEvents: 'none',
          zIndex:        40,
          willChange:    'transform',
          opacity:       0,
        }}
        aria-hidden="true"
      >
        {/* ── 2 px glowing line ────────────────────────────────── */}
        <div
          style={{
            position:  'absolute',
            top:       '50%',
            left:      0,
            width:     '100%',
            height:    2,
            transform: 'translateY(-50%)',
            background: 'linear-gradient(to right, #38BDF8 0%, rgba(56,189,248,0.8) 20%, rgba(56,189,248,1) 50%, rgba(56,189,248,0.8) 80%, #38BDF8 100%)',
            filter:    'blur(0.5px)',
            boxShadow: '0 0 6px #38BDF8, 0 0 12px #38BDF8, 0 0 24px rgba(56,189,248,0.6), 0 0 40px rgba(56,189,248,0.3)',
            overflow:  'hidden',
          }}
        >
          {/* Sweeping highlight — left → right → left, infinite alternate */}
          <div
            style={{
              position:  'absolute',
              top:       0,
              left:      0,
              width:     '40%',
              height:    '100%',
              background: 'linear-gradient(to right, transparent, rgba(56,189,248,0.9), white, rgba(56,189,248,0.9), transparent)',
              animation: 'scanSweep 2.5s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* ── Glow halo bleeding downward ──────────────────────── */}
        <div
          style={{
            position:  'absolute',
            top:       'calc(50% + 1px)',
            left:      0,
            width:     '100%',
            height:    8,
            background: 'linear-gradient(to bottom, rgba(56,189,248,0.15), transparent)',
          }}
        />

        {/* ── Glowing dot — left edge, vertically centred ──────── */}
        <div
          style={{
            position:     'absolute',
            top:          '50%',
            left:         16,
            transform:    'translateY(-50%)',
            width:        10,
            height:       10,
            borderRadius: '50%',
            background:   'white',
            boxShadow:    '0 0 6px #38BDF8, 0 0 14px #38BDF8, 0 0 28px rgba(56,189,248,0.8)',
          }}
        />
      </div>
    </>
  )
}
