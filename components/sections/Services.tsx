'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { SERVICES } from '@/lib/constants'
import ServiceCard from '@/components/ui/ServiceCard'

export default function Services() {
  const shouldReduce = useReducedMotion() ?? false

  return (
    <section
      id="services"
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
          What We Do
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
          Three things.<br />Done exceptionally.
        </motion.h2>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              className="corner-trace-wrapper"
              style={{ transition: 'transform 0.15s ease', transformStyle: 'preserve-3d' }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                e.currentTarget.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)`
              }}
            >
              <ServiceCard service={service} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
