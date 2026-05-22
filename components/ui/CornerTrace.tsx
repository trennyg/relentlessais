'use client'

interface CornerTraceProps {
  duration?: number    // kept for API compat — unused
  width?: number       // container width for SVG viewBox
  height?: number      // container height for SVG viewBox
  showBrackets?: boolean
}

export default function CornerTrace({
  width = 400,
  height = 300,
  showBrackets = false,
}: CornerTraceProps) {
  const pad         = 1
  const x1 = pad, y1 = pad, x2 = width - pad, y2 = height - pad
  // 12 SVG units → ≤ 16 CSS px at any typical card size
  const bracketSize = 12

  if (!showBrackets) return null

  return (
    <svg
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        overflow:      'visible',
        zIndex:        2,
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* TL bracket */}
      <path
        d={`M ${x1 + bracketSize} ${y1 + 1} H ${x1 + 1} V ${y1 + bracketSize}`}
        fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
      />
      {/* TR bracket */}
      <path
        d={`M ${x2 - bracketSize} ${y1 + 1} H ${x2 - 1} V ${y1 + bracketSize}`}
        fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
      />
      {/* BL bracket */}
      <path
        d={`M ${x1 + bracketSize} ${y2 - 1} H ${x1 + 1} V ${y2 - bracketSize}`}
        fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
      />
      {/* BR bracket */}
      <path
        d={`M ${x2 - bracketSize} ${y2 - 1} H ${x2 - 1} V ${y2 - bracketSize}`}
        fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"
      />
    </svg>
  )
}
