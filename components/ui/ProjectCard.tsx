'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Tag from './Tag'
import { Project } from '@/lib/constants'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      style={{
        backgroundColor: '#111111',
        border: '1px solid #1A1A1A',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        {project.badge && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 2,
              backgroundColor: '#38BDF8',
              color: '#080808',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 2,
            }}
          >
            {project.badge}
          </div>
        )}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111', zIndex: -1 }} />
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <Tag>{project.tag}</Tag>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 18,
            fontWeight: 700,
            color: '#F0EDE6',
            marginBottom: 8,
          }}
        >
          {project.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 14,
            color: '#666',
            lineHeight: 1.7,
            marginBottom: 14,
          }}
        >
          {project.body}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {project.stack.map(t => (
            <span key={t} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: '#444' }}>
              {t}
            </span>
          ))}
        </div>
        {project.link && project.link !== '#' && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 13,
              color: '#38BDF8',
              textDecoration: 'none',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')}
          >
            View Live ↗
          </a>
        )}
      </div>
    </motion.div>
  )
}
