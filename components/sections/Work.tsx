'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { PROJECTS } from '@/lib/constants'
import ProjectCard from '@/components/ui/ProjectCard'

export default function Work() {
  const shouldReduce = useReducedMotion() ?? false

  return (
    <section
      id="work"
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
          Our Work
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
          Built. Shipped.<br />Reviewed well.
        </motion.h2>

        {/* 2-col grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
