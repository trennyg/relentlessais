'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { TESTIMONIALS, Testimonial } from '@/lib/constants'

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #1A1A1A',
        borderRadius: 2,
        padding: 32,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: 72,
          color: '#38BDF8',
          lineHeight: 0.5,
          marginBottom: 24,
        }}
      >
        &ldquo;
      </div>

      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 16,
          color: '#F0EDE6',
          lineHeight: 1.7,
          marginBottom: 24,
        }}
      >
        {t.quote}
      </p>

      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 20 }}>
        <p
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            fontSize: 14,
            color: '#F0EDE6',
            marginBottom: 4,
          }}
        >
          {t.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 12,
            color: '#444',
            marginBottom: 16,
          }}
        >
          {t.role}
        </p>
        <span
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 10,
            color: '#444',
            border: '1px solid #1A1A1A',
            borderRadius: 2,
            padding: '3px 8px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}
        >
          {t.tag}
        </span>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const shouldReduce = useReducedMotion() ?? false

  return (
    <section
      id="testimonials"
      style={{
        backgroundColor: '#080808',
        padding: 'clamp(80px, 10vw, 120px) 24px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Section label */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 11,
            color: '#38BDF8',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          What Clients Say
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#F0EDE6',
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: 64,
          }}
        >
          Don&apos;t take<br />our word for it.
        </motion.h2>

        {/* Cards — responsive grid */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
