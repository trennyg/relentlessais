'use client'

interface CornerTraceProps {
  duration?: number   // seconds per loop (kept for API compat)
  width?: number      // container width for SVG viewBox
  height?: number     // container height for SVG viewBox
  showBrackets?: boolean
}

export default function CornerTrace({
  duration = 3,
  width = 400,
  height = 300,
  showBrackets = false,
}: CornerTraceProps) {
  const pad = 1
  const x1 = pad, y1 = pad, x2 = width - pad, y2 = height - pad
  const bracketSize = 14
  const filterId = `glow-ct-${duration}`

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 2,
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        @keyframes borderTrace {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        rect.hover-border {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 0.6s linear;
        }
        .corner-trace-wrapper:hover rect.hover-border {
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1.2s linear;
        }
      `}</style>

      {/* Static dim border */}
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke="#1A1A1A" strokeWidth="1" />

      {/* Hover border trace — draws electric blue perimeter on parent hover */}
      <rect
        className="hover-border"
        x={x1}
        y={y1}
        width={x2 - x1}
        height={y2 - y1}
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.5"
        filter={`url(#${filterId})`}
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
      />

      {/* Bracket corners */}
      {showBrackets && (
        <>
          {/* TL */}
          <path
            d={`M ${x1 + bracketSize} ${y1 + 1} H ${x1 + 1} V ${y1 + bracketSize}`}
            fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
          />
          {/* TR */}
          <path
            d={`M ${x2 - bracketSize} ${y1 + 1} H ${x2 - 1} V ${y1 + bracketSize}`}
            fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
          />
          {/* BL */}
          <path
            d={`M ${x1 + bracketSize} ${y2 - 1} H ${x1 + 1} V ${y2 - bracketSize}`}
            fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
          />
          {/* BR */}
          <path
            d={`M ${x2 - bracketSize} ${y2 - 1} H ${x2 - 1} V ${y2 - bracketSize}`}
            fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
          />
        </>
      )}
    </svg>
  )
}
