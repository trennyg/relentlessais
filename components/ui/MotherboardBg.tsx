'use client'

interface MotherboardBgProps {
  mouseX: number
  mouseY: number
  active: boolean
}

export default function MotherboardBg({ mouseX, mouseY, active }: MotherboardBgProps) {
  const W = 1200
  const H = 600
  const gridStep = 60

  // Horizontal trace Y positions
  const hTraces: number[] = []
  for (let y = gridStep; y < H; y += gridStep) hTraces.push(y)

  // Vertical trace X positions
  const vTraces: number[] = []
  for (let x = gridStep; x < W; x += gridStep) vTraces.push(x)

  // Junction dots at a subset of grid intersections
  const dots: [number, number][] = []
  hTraces.forEach(y =>
    vTraces.forEach(x => {
      if ((x + y) % 180 === 0) dots.push([x, y])
    }),
  )

  // IC chip outlines
  const ics = [
    { x: 120, y: 120, w: 80, h: 50 },
    { x: 500, y: 200, w: 100, h: 60 },
    { x: 900, y: 100, w: 80, h: 50 },
    { x: 300, y: 400, w: 90, h: 55 },
    { x: 750, y: 350, w: 80, h: 50 },
    { x: 1050, y: 420, w: 80, h: 50 },
  ]

  // L-shaped connector paths with pre-calculated lengths (H/V segments only)
  const lPaths = [
    { d: 'M 120 60 H 240 V 120',   len: 180, dur: 2.6, begin: 0.0 },
    { d: 'M 600 0 V 200 H 500',    len: 300, dur: 3.0, begin: 0.5 },
    { d: 'M 900 180 H 1020 V 120', len: 180, dur: 2.4, begin: 1.0 },
    { d: 'M 300 460 V 540 H 420',  len: 200, dur: 2.8, begin: 0.3 },
    { d: 'M 750 420 H 870 V 480',  len: 180, dur: 2.5, begin: 0.7 },
  ]

  // CSS mask — radial circle centred on cursor when active, none when inactive
  const maskValue = active
    ? `radial-gradient(circle 220px at ${mouseX}px ${mouseY}px, black, transparent)`
    : 'none'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        // Fade entire layer out on mouse-leave; mask controls the reveal shape
        opacity: active ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
        overflow: 'hidden',
        WebkitMaskImage: maskValue,
        maskImage: maskValue,
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
          <filter id="mbGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#mbGlow)">

          {/* ── Horizontal traces — draw-on loop ─────────────── */}
          {hTraces.map((y, i) => {
            const dur = 2.5 + (i % 4) * 0.4
            const begin = (i * 0.28) % dur
            return (
              <line
                key={`h${y}`}
                x1="0"
                y1={y}
                x2={W}
                y2={y}
                stroke="#38BDF8"
                strokeWidth="0.5"
                opacity="0.7"
                strokeDasharray={`${W} ${W}`}
                strokeDashoffset={W}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={W}
                  to={0}
                  dur={`${dur}s`}
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              </line>
            )
          })}

          {/* ── Vertical traces — draw-on loop ────────────────── */}
          {vTraces.map((x, i) => {
            const dur = 2.0 + (i % 4) * 0.35
            const begin = (i * 0.22) % dur
            return (
              <line
                key={`v${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2={H}
                stroke="#38BDF8"
                strokeWidth="0.5"
                opacity="0.7"
                strokeDasharray={`${H} ${H}`}
                strokeDashoffset={H}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={H}
                  to={0}
                  dur={`${dur}s`}
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              </line>
            )
          })}

          {/* ── L-shaped connector paths — draw-on loop ─────── */}
          {lPaths.map(({ d, len, dur, begin }, i) => (
            <path
              key={`lp${i}`}
              d={d}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="0.5"
              opacity="0.8"
              strokeDasharray={`${len} ${len}`}
              strokeDashoffset={len}
            >
              <animate
                attributeName="stroke-dashoffset"
                from={len}
                to={0}
                dur={`${dur}s`}
                begin={`${begin}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}

          {/* ── Junction dots — opacity pulse ─────────────────── */}
          {dots.map(([x, y], i) => {
            const dur = 1.4 + (i % 5) * 0.25
            const begin = (i * 0.41) % dur
            return (
              <circle
                key={`dot${i}`}
                cx={x}
                cy={y}
                r="2"
                fill="#38BDF8"
              >
                <animate
                  attributeName="opacity"
                  values="0.15;0.85;0.15"
                  dur={`${dur}s`}
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )
          })}

          {/* ── IC chip outlines (static, revealed by mask) ─── */}
          {ics.map((ic, i) => (
            <rect
              key={`ic${i}`}
              x={ic.x}
              y={ic.y}
              width={ic.w}
              height={ic.h}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="0.8"
              opacity="0.45"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
