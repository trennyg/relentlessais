'use client'
import MumbaiClock from '@/components/ui/MumbaiClock'

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #1A1A1A',
      backgroundColor: '#080808',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 16 }}>
            <span style={{ color: '#F0EDE6' }}>RELENTLESS </span>
            <span style={{ color: '#38BDF8' }}>AIS</span>
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 12, color: '#333' }}>
            © 2025 Relentless AIS. All Rights Reserved.
          </span>
          <MumbaiClock small={true} />
        </div>

        {/* Right: social icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ color: '#444', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#38BDF8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <LinkedInIcon />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: '#444', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#38BDF8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}
