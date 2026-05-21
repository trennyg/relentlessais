'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MumbaiClock from '@/components/ui/MumbaiClock'
import { NAV_LINKS } from '@/lib/constants'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Scroll state for background blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // GSAP: hide on scroll down, show on scroll up
  useEffect(() => {
    if (!navRef.current) return
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      if (y < 80) gsap.to(navRef.current, { y: 0, duration: 0.35, ease: 'power2.out' })
      else if (y > lastY) gsap.to(navRef.current, { y: '-100%', duration: 0.35, ease: 'power2.out' })
      else gsap.to(navRef.current, { y: 0, duration: 0.35, ease: 'power2.out' })
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section via IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-50% 0px -50% 0px' }
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
          backgroundColor: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #1A1A1A' : '1px solid transparent',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Wordmark */}
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#F0EDE6' }}>RELENTLESS </span>
              <span style={{ color: '#38BDF8' }}>AIS</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
            {NAV_LINKS.map(link => {
              const id = link.href.replace('#', '')
              const active = activeSection === id
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => go(e, link.href)}
                  style={{
                    position: 'relative',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 14,
                    color: active ? '#38BDF8' : '#666',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    paddingBottom: 2,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F0EDE6' }}
                  onMouseLeave={e => { e.currentTarget.style.color = active ? '#38BDF8' : '#666' }}
                >
                  {link.label}
                  {/* Underline — scaleX 0→1 from left on hover */}
                  <span style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0,
                    height: 1, backgroundColor: '#38BDF8',
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.2s ease',
                  }} />
                </a>
              )
            })}

            {/* Mumbai clock — desktop only */}
            <MumbaiClock />

            {/* CTA */}
            <a
              href="#contact"
              onClick={e => go(e, '#contact')}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: '#38BDF8',
                color: '#080808',
                padding: '8px 20px',
                borderRadius: 2,
                textDecoration: 'none',
                transition: 'filter 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
            >
              Get in Touch →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 1.5, backgroundColor: '#F0EDE6',
                transition: 'transform 0.3s, opacity 0.3s',
                transform: i === 0 && mobileOpen ? 'rotate(45deg) translateY(6.5px)' : i === 2 && mobileOpen ? 'rotate(-45deg) translateY(-6.5px)' : 'none',
                opacity: i === 1 && mobileOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              backgroundColor: '#080808',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40,
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 28 }}
              aria-label="Close menu"
            >
              ✕
            </button>
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={e => go(e, link.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 48, color: '#F0EDE6', textDecoration: 'none' }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              onClick={e => go(e, '#contact')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.08 }}
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 18, backgroundColor: '#38BDF8', color: '#080808', padding: '14px 36px', borderRadius: 2, textDecoration: 'none' }}
            >
              Get in Touch →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
