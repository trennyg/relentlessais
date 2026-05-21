export default function ScanLineDivider() {
  return (
    <div style={{ width: '100%', height: 60, overflow: 'hidden', position: 'relative', backgroundColor: 'transparent' }}>
      <svg width="100%" height="60" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="50%"  stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
          <filter id="scanGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="100%" height="2" fill="url(#scanGrad)" filter="url(#scanGlow)">
          <animate attributeName="y" values="-4;64" dur="2.5s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  )
}
