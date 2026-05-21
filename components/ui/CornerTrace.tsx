'use client'

interface CornerTraceProps {
  duration?: number   // seconds per loop
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
  const perimPath = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`
  const bracketSize = 14
  const pathId = `perim-${duration}-${width}-${height}`
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

      {/* Static dim border */}
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke="#1A1A1A" strokeWidth="1" />

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

      {/* Hidden perimeter path for animateMotion */}
      <path id={pathId} d={perimPath} fill="none" stroke="none" />

      {/* Travelling glow dot */}
      <g filter={`url(#${filterId})`}>
        {/* Outer halo */}
        <circle r="8" fill="#38BDF8" opacity="0.12">
          <animateMotion dur={`${duration}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
        {/* Bright core */}
        <circle r="3" fill="#38BDF8">
          <animateMotion dur={`${duration}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      </g>
    </svg>
  )
}
