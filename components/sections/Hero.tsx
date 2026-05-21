'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import MotherboardBg from '@/components/ui/MotherboardBg'
import { TYPING_WORDS } from '@/lib/constants'

// Typing animation hook
function useTypingEffect(words: string[], shouldReduce: boolean) {
  const [displayText, setDisplayText] = useState(words[0])
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(words[0].length)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (shouldReduce) return // static if reduced motion preferred
    const currentWord = words[wordIndex]

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && charIndex < currentWord.length) {
      // typing forward
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex + 1))
        setCharIndex(c => c + 1)
      }, 80)
    } else if (!isDeleting && charIndex === currentWord.length) {
      // pause at full word
      timeout = setTimeout(() => setIsDeleting(true), 1800)
    } else if (isDeleting && charIndex > 0) {
      // deleting
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex - 1))
        setCharIndex(c => c - 1)
      }, 45)
    } else if (isDeleting && charIndex === 0) {
      // pause then next word
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setWordIndex(i => (i + 1) % words.length)
      }, 300)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, wordIndex, words, shouldReduce])

  return { displayText, showCursor }
}

export default function Hero() {
  const shouldReduce = useReducedMotion() ?? false
  const { displayText } = useTypingEffect(TYPING_WORDS, shouldReduce)
  const [mbOpacity, setMbOpacity] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onWheel = () => setScrolled(true)
    const onScroll = () => { if (window.scrollY > 50) setScrolled(true) }
    window.addEventListener('wheel', onWheel, { once: true, passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('scroll', onScroll) }
  }, [])

  // Word animation variants
  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
  }

  const words1 = ['We', 'build', 'digital']
  const words2 = ['products', 'that']

  return (
    <section
      className="grain"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
        overflow: 'hidden',
        backgroundColor: '#080808',
      }}
      onMouseEnter={() => setMbOpacity(1)}
      onMouseLeave={() => setMbOpacity(0)}
    >
      {/* Radial gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56,189,248,0.04), transparent)',
        zIndex: 0,
      }} />

      {/* Motherboard background */}
      <MotherboardBg opacity={mbOpacity} />

      {/* Content z-index 1 */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%', textAlign: 'center' }}>
        {/* Section label */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 11,
            color: '#38BDF8',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          Digital Product Studio
        </motion.p>

        {/* Headline line 1 */}
        <h1 style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: '#F0EDE6',
          marginBottom: 0,
        }}>
          <span style={{ display: 'block' }}>
            {words1.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                initial={shouldReduce ? false : 'hidden'}
                animate={shouldReduce ? false : 'visible'}
                variants={shouldReduce ? undefined : wordVariants}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span style={{ display: 'block' }}>
            {words2.map((word, i) => (
              <motion.span
                key={i}
                custom={i + 3}
                initial={shouldReduce ? false : 'hidden'}
                animate={shouldReduce ? false : 'visible'}
                variants={shouldReduce ? undefined : wordVariants}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
            {' '}
            <motion.span
              custom={5}
              initial={shouldReduce ? false : 'hidden'}
              animate={shouldReduce ? false : 'visible'}
              variants={shouldReduce ? undefined : wordVariants}
              style={{ display: 'inline-block', color: '#38BDF8' }}
            >
              think.
            </motion.span>
          </span>
        </h1>

        {/* Sub-headline with typing animation */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shouldReduce ? 0 : 0.7, duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 18,
            color: '#666',
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          We build{' '}
          <span style={{ color: '#38BDF8' }}>
            {shouldReduce ? 'products that think' : displayText}
          </span>
          {!shouldReduce && (
            <span className="blink" style={{ color: '#38BDF8', marginLeft: 1 }}>|</span>
          )}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduce ? 0 : 1.0, duration: 0.3 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 40 }}
        >
          <a
            href="#work"
            onClick={e => { e.preventDefault(); document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' }) }}
            style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500,
              backgroundColor: '#38BDF8', color: '#080808',
              padding: '13px 28px', borderRadius: 2, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'filter 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
          >
            See Our Work →
          </a>
          <a
            href="#contact"
            onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
            style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500,
              backgroundColor: 'transparent', color: '#F0EDE6',
              border: '1px solid #1A1A1A', padding: '13px 28px', borderRadius: 2,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#38BDF8'; e.currentTarget.style.color = '#38BDF8' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#F0EDE6' }}
          >
            Get In Touch
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: '#333', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <motion.div
          style={{ width: 1, backgroundColor: '#333', originY: 0 }}
          animate={{ height: [0, 32, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
