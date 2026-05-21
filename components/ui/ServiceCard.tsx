'use client'
import { motion } from 'framer-motion'
import CornerTrace from './CornerTrace'
import { Service } from '@/lib/constants'

interface ServiceCardProps {
  service: Service
  index: number
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'relative',
        backgroundColor: '#111111',
        border: '1px solid #1A1A1A',
        borderRadius: 2,
        padding: 32,
        transition: 'border-color 0.25s ease, transform 0.25s ease',
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 0 24px rgba(56,189,248,0.08)',
        borderColor: 'rgba(56,189,248,0.3)',
      }}
    >
      <CornerTrace duration={3} width={400} height={300} showBrackets={true} />

      {/* Icon */}
      <div
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: 36,
          color: '#38BDF8',
          marginBottom: 20,
        }}
      >
        {service.icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: 20,
          fontWeight: 700,
          color: '#F0EDE6',
          marginBottom: 12,
        }}
      >
        {service.title}
      </h3>

      {/* Body */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 15,
          color: '#666',
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        {service.body}
      </p>

      {/* For: row */}
      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 16 }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: '#444' }}>
          For: {service.forList.join(' · ')}
        </p>
      </div>
    </motion.div>
  )
}
