'use client'
import { useEffect } from 'react'

export default function ScrollScanReveal() {
  useEffect(() => {
    // Create scan line directly in DOM — bypasses all React/opacity/wrapper issues
    const line = document.createElement('div')
    line.id = 'ais-scan-line'
    line.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 3px;
      background: #38BDF8;
      box-shadow: 0 0 8px #38BDF8, 0 0 20px #38BDF8, 0 0 40px rgba(56,189,248,0.6);
      z-index: 999999;
      pointer-events: none;
      transition: none;
    `
    document.body.appendChild(line)

    const main = document.querySelector('main') as HTMLElement | null

    const update = () => {
      const y = window.scrollY + window.innerHeight
      line.style.transform = `translateY(${y}px)`
      if (main) {
        main.style.maskImage = `linear-gradient(to bottom, black ${y}px, transparent ${y}px)`
        main.style.webkitMaskImage = `linear-gradient(to bottom, black ${y}px, transparent ${y}px)`
      }
      requestAnimationFrame(update)
    }

    requestAnimationFrame(update)

    return () => {
      document.body.removeChild(line)
    }
  }, [])

  return null
}
