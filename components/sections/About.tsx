'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { STATS, Stat } from '@/lib/constants'
import MotherboardBg from '@/components/ui/MotherboardBg'

function useCountUp(
  target: number,
  duration = 1500,
  active = false,
  shouldReduce = false,
) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active || shouldReduce) {
      setCount(target)
      return
    }
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setCount(target)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration, shouldReduce])

  return count
}

function StatBlock({
  stat,
  shouldReduce,
}: {
  stat: Stat
  shouldReduce: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isPct = stat.number.includes('%')
  const targetNum = parseInt(stat.number.replace('%', ''), 10)
  const count = useCountUp(targetNum, 1500, inView, shouldReduce)

  // Preserve leading-zero formatting (e.g. "04" → "04")
  const display = isPct
    ? `${count}%`
    : String(count).padStart(stat.number.length, '0')

  return (
    <div
      ref={ref}
      style={{
        borderLeft: '2px solid #1A1A1A',
        paddingLeft: 20,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
          color: '#38BDF8',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {display}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: 12,
          color: '#444',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {stat.label}
      </p>
    </div>
  )
}

export default function About() {
  const shouldReduce = useReducedMotion() ?? false
  const [mbOpacity, setMbOpacity] = useState(0)

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        backgroundColor: '#080808',
        padding: 'clamp(80px, 10vw, 120px) 24px',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setMbOpacity(1)}
      onMouseLeave={() => setMbOpacity(0)}
    >
      <MotherboardBg opacity={mbOpacity} />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* Left: copy */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: 11,
                color: '#38BDF8',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Who We Are
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                color: '#F0EDE6',
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              We are Relentless AIS.<br />A digital product studio.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 18,
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                We work with ambitious founders, financial firms, and creative
                professionals to build things that look exceptional and actually
                work.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 18,
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                We combine high-end design with real AI capability — because
                your business deserves both. Every project we take on gets our
                full attention, from the first pixel to the last line of code.
              </p>
            </div>
          </motion.div>

          {/* Right: stats 2×2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
            }}
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <StatBlock stat={stat} shouldReduce={shouldReduce} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
