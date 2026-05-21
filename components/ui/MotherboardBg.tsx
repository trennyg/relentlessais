'use client'

interface MotherboardBgProps {
  opacity: number // controlled by parent (0 hidden, 1 visible)
}

export default function MotherboardBg({ opacity }: MotherboardBgProps) {
  const W = 1200, H = 600
  const gridStep = 60

  // Horizontal trace lines at grid Y positions
  const hTraces: number[] = []
  for (let y = gridStep; y < H; y += gridStep) hTraces.push(y)

  // Vertical traces at grid X positions
  const vTraces: number[] = []
  for (let x = gridStep; x < W; x += gridStep) vTraces.push(x)

  // Junction dots at intersections (subset)
  const dots: [number, number][] = []
  hTraces.forEach(y =>
    vTraces.forEach(x => {
      if ((x + y) % 180 === 0) dots.push([x, y])
    })
  )

  // IC chip outlines at specific spots
  const ics = [
    { x: 120, y: 120, w: 80, h: 50 },
    { x: 500, y: 200, w: 100, h: 60 },
    { x: 900, y: 100, w: 80, h: 50 },
    { x: 300, y: 400, w: 90, h: 55 },
    { x: 750, y: 350, w: 80, h: 50 },
    { x: 1050, y: 420, w: 80, h: 50 },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="mbGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#mbGlow)">
          {/* Horizontal traces */}
          {hTraces.map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="#38BDF8" strokeWidth="0.5" opacity="0.15" />
          ))}

          {/* Vertical traces */}
          {vTraces.map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="#38BDF8" strokeWidth="0.5" opacity="0.15" />
          ))}

          {/* L-shaped corner traces connecting some nodes */}
          <path d="M 120 60 H 240 V 120" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.2" />
          <path d="M 600 0 V 200 H 500" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.2" />
          <path d="M 900 180 H 1020 V 120" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.2" />
          <path d="M 300 460 V 540 H 420" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.2" />
          <path d="M 750 420 H 870 V 480" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.2" />

          {/* Junction dots */}
          {dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#38BDF8" opacity="0.3" />
          ))}

          {/* IC chip outlines */}
          {ics.map((ic, i) => (
            <rect
              key={i}
              x={ic.x}
              y={ic.y}
              width={ic.w}
              height={ic.h}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="0.8"
              opacity="0.18"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
