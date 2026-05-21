'use client'

import { useEffect, useRef } from 'react'

export default function ScrollScanReveal() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion — skip everything, leave page fully visible
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const main   = document.querySelector('main') as HTMLElement | null
    const line   = lineRef.current
    if (!main || !line) return

    let targetY  = window.scrollY + window.innerHeight
    let currentY = window.scrollY + window.innerHeight // first screen immediately visible
    let rafId    = 0
    let dirty    = true

    const applyReveal = (y: number) => {
      const docH = document.body.scrollHeight

      if (y >= docH - 10) {
        // Bottom reached — clear mask, hide line
        main.style.maskImage       = ''
        main.style.webkitMaskImage = ''
      } else {
        const mask = `linear-gradient(to bottom, black 0px, black ${y}px, transparent ${y + 2}px, transparent 100%)`
        main.style.maskImage       = mask
        main.style.webkitMaskImage = mask
        line.style.transform       = `translateY(${y}px)`
      }
    }

    // Apply immediately so first screen is visible without flash
    applyReveal(currentY)

    const loop = () => {
      if (dirty) {
        targetY = window.scrollY + window.innerHeight
        dirty   = false
      }
      const delta = targetY - currentY
      if (Math.abs(delta) > 0.25) {
        currentY += delta * 0.08
        applyReveal(currentY)
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    const onScroll = () => { dirty = true }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      if (main) {
        main.style.maskImage       = ''
        main.style.webkitMaskImage = ''
      }
    }
  }, [])

  // Nuclear line: position fixed, own z-index 99999 — nothing can clip or override it.
  // RAF sets transform + opacity directly on this element.
  return (
    <div
      ref={lineRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '4px',
        background:    '#38BDF8',
        boxShadow:     '0 0 10px #38BDF8, 0 0 30px #38BDF8, 0 0 60px #38BDF8',
        zIndex:        99999,
        pointerEvents: 'none',
        willChange:    'transform',
        opacity:       1,
      }}
      aria-hidden="true"
    />
  )
}
