'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface LoaderProps {
  onComplete: () => void
}

// ── CPU chip geometry ──────────────────────────────────────────
// Outer rect: x=650 y=405 w=140 h=90   → centre (720, 450)
// Inner rect: x=662 y=416 w=116 h=68

const PIN_X = [665, 681, 696, 712, 727, 742, 758, 773] // top & bottom pins
const PIN_Y = [415, 426, 437, 448, 459, 470, 481, 492] // left & right pins

// ── Traces (H/V only, 90° bends, ordered inside-out) ──────────
const TRACES = [
  // North-left  → RAM-01
  'M 690 405 V 320 H 500 V 220 H 340 V 160 H 230 V 120',
  // North-centre → CLK
  'M 720 405 V 340 H 720 V 200 H 720 V 80 H 720 V 30',
  // North-right  → RAM-02
  'M 750 405 V 320 H 940 V 220 H 1100 V 160 H 1210 V 120',
  // East-upper   → IC-03
  'M 790 430 H 900 V 350 H 1020 V 280',
  // East-lower
  'M 790 460 H 1060 V 520 H 1250 V 600 H 1440',
  // East-edge
  'M 790 445 H 1350 V 200 H 1440',
  // West-upper   → IC-02
  'M 650 430 H 540 V 350 H 380 V 280',
  // West-lower
  'M 650 460 H 380 V 520 H 190 V 600 H 0',
  // West-edge
  'M 650 445 H 90 V 200 H 0',
  // South-right  → RAM-04
  'M 760 495 V 580 H 940 V 660 H 1100 V 720 H 1210 V 760',
  // South-left   → RAM-03
  'M 680 495 V 580 H 500 V 660 H 340 V 720 H 230 V 760',
  // South-centre
  'M 720 495 V 580 H 720 V 680 H 720 V 840',
  // Cross connections
  'M 500 320 H 940',
  'M 230 120 H 80 V 200 H 0',
  'M 1210 120 H 1360 V 200 H 1440',
  'M 230 760 H 80 V 680 H 0',
  'M 1210 760 H 1360 V 680 H 1440',
  'M 380 280 H 540',
  'M 1020 280 H 880 V 350 H 900',
  'M 720 200 H 600 V 160 H 500',
  'M 720 200 H 840 V 160 H 940',
  // Secondary density traces
  'M 200 350 H 0',
  'M 1240 350 H 1440',
  'M 500 660 H 360 V 720 H 200',
  'M 940 660 H 1080 V 720 H 1240',
  'M 100 450 H 0',
  'M 1340 450 H 1440',
  'M 400 820 H 720 H 1040',
  'M 200 500 H 0',
  'M 1240 500 H 1440',
]

// ── IC / RAM chip definitions ──────────────────────────────────
const CHIPS = [
  { x: 690, y: 25,  w: 60,  h: 28, label: 'CLK'    },
  { x: 170, y: 100, w: 100, h: 28, label: 'RAM-01'  },
  { x: 1170,y: 100, w: 100, h: 28, label: 'RAM-02'  },
  { x: 170, y: 750, w: 100, h: 28, label: 'RAM-03'  },
  { x: 1170,y: 750, w: 100, h: 28, label: 'RAM-04'  },
  { x: 315, y: 263, w: 60,  h: 28, label: 'IC-02'   },
  { x: 1065,y: 263, w: 60,  h: 28, label: 'IC-03'   },
  { x: 315, y: 683, w: 60,  h: 28, label: 'IC-04'   },
  { x: 1065,y: 683, w: 60,  h: 28, label: 'IC-05'   },
]

// ── Junction nodes ─────────────────────────────────────────────
const NODES: [number, number][] = [
  [690, 320], [500, 320], [500, 220], [340, 220], [340, 160], [230, 160],
  [720, 340], [720, 200], [720, 80],
  [750, 320], [940, 320], [940, 220], [1100, 220], [1100, 160], [1210, 160],
  [900, 430], [900, 350], [1020, 350], [1020, 280],
  [1060, 460], [1060, 520], [1250, 520], [1250, 600],
  [540, 430], [540, 350], [380, 350], [380, 280],
  [380, 460], [380, 520], [190, 520], [190, 600],
  [760, 580], [940, 580], [940, 660], [1100, 660], [1100, 720], [1210, 720],
  [680, 580], [500, 580], [500, 660], [340, 660], [340, 720], [230, 720],
  [720, 680], [720, 840],
  [600, 200], [840, 200], [500, 160], [940, 160],
  [380, 720], [1080, 720],
]

// ── Capacitor symbols ──────────────────────────────────────────
// Two parallel lines; rot=0 horizontal, rot=90 vertical
const CAPS: { x: number; y: number; rot: number }[] = [
  { x: 610, y: 320, rot: 0 },
  { x: 830, y: 320, rot: 0 },
  { x: 1100, y: 440, rot: 90 },
  { x: 340, y: 440, rot: 90 },
  { x: 610, y: 580, rot: 0 },
  { x: 830, y: 580, rot: 0 },
  { x: 720, y: 750, rot: 90 },
]

// ── Resistor symbols (small rects on traces) ───────────────────
const RESISTORS: { x: number; y: number; w: number; h: number }[] = [
  { x: 709, y: 143, w: 22, h: 10 }, // north centre trace
  { x: 370, y: 344, w: 10, h: 20 }, // west upper trace
  { x: 1060, y: 344, w: 10, h: 20 }, // east upper trace
  { x: 490, y: 654, w: 10, h: 20 }, // south-left trace
  { x: 930, y: 654, w: 10, h: 20 }, // south-right trace
]

// ── HUD corner bracket ─────────────────────────────────────────
type CornerPos = 'tl' | 'tr' | 'bl' | 'br'
function CornerBracket({ pos }: { pos: CornerPos }) {
  const size = 36
  const thick = 2
  const color = '#38BDF8'
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    opacity: 0,
  }
  const sides: Record<CornerPos, React.CSSProperties> = {
    tl: { top: 20, left: 20, borderTop: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` },
    tr: { top: 20, right: 20, borderTop: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` },
    bl: { bottom: 20, left: 20, borderBottom: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` },
    br: { bottom: 20, right: 20, borderBottom: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` },
  }
  return <div className="loader-corner" style={{ ...base, ...sides[pos] }} />
}

// ── HUD label ─────────────────────────────────────────────────
function HUD({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="loader-hud"
      style={{
        position: 'absolute',
        opacity: 0,
        fontFamily: 'var(--font-dm-mono)',
        fontSize: 11,
        color: '#38BDF8',
        letterSpacing: '0.05em',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const svgRef      = useRef<SVGSVGElement>(null)
  const logoRef     = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('LOADING...')

  useEffect(() => {
    // Status text cycling
    const t1 = setTimeout(() => setStatus('CONNECTING...'), 1000)
    const t2 = setTimeout(() => setStatus('READY'),         2200)

    // Lock body scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const svg = svgRef.current
    if (!svg) return

    // Initialise stroke-dasharray on every trace so they start invisible
    const tracePaths = svg.querySelectorAll<SVGPathElement>('.loader-trace')
    tracePaths.forEach(p => {
      const len = p.getTotalLength()
      p.style.strokeDasharray  = `${len}`
      p.style.strokeDashoffset = `${len}`
    })

    // ── GSAP timeline ─────────────────────────────────────────
    const tl = gsap.timeline({
      onComplete() {
        sessionStorage.setItem('loaderSeen', '1')
        document.body.style.overflow = prevOverflow
        onComplete()
      },
    })

    // 0.0 s — corner brackets draw in
    tl.to('.loader-corner', { opacity: 1, duration: 0.25, stagger: 0.06, ease: 'power2.out' }, 0)

    // 0.1 s — HUD text fades in
    tl.to('.loader-hud', { opacity: 1, duration: 0.35 }, 0.1)

    // 0.3 s — traces draw outward from centre (stagger spread over 0.5 s)
    tracePaths.forEach((p, i) => {
      tl.to(p, {
        strokeDashoffset: 0,
        duration: 0.45,
        ease: 'power1.inOut',
      }, 0.3 + i * (0.5 / tracePaths.length))
    })

    // 0.8 s — CPU-01 chip label appears
    tl.to('#loader-cpu-chip', { opacity: 1, duration: 0.3 }, 0.8)

    // 1.2 s — IC / RAM labels appear, staggered
    tl.to('.chip-label', { opacity: 1, duration: 0.2, stagger: 0.08 }, 1.2)

    // 1.8 s — junction dots pulse on
    tl.to('.node-dot', {
      opacity: 0.9,
      scale: 1.5,
      transformOrigin: 'center center',
      duration: 0.12,
      stagger: 0.018,
    }, 1.8)
    tl.to('.node-dot', { scale: 1, duration: 0.18, stagger: 0.018 }, 2.02)

    // 2.5 s — wordmark fades in
    tl.to(logoRef.current, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 2.5)

    // 3.0 s — full overlay fades out
    tl.to(overlayRef.current, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 3.0)

    return () => {
      tl.kill()
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = prevOverflow
    }
  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#080808',
        overflow: 'hidden',
      }}
    >
      {/* ── SVG motherboard circuit ───────────────────────────── */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <filter id="ld-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ld-glow-strong" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Traces — glow layer (wide, dim) */}
        {TRACES.map((d, i) => (
          <path
            key={`g${i}`}
            d={d}
            stroke="#38BDF8"
            strokeWidth="3"
            fill="none"
            opacity="0.08"
            filter="url(#ld-glow)"
          />
        ))}

        {/* Traces — core layer (sharp, animated) */}
        {TRACES.map((d, i) => (
          <path
            key={`c${i}`}
            d={d}
            className="loader-trace"
            stroke="#38BDF8"
            strokeWidth="1"
            fill="none"
            opacity="0.75"
          />
        ))}

        {/* Capacitor symbols */}
        {CAPS.map(({ x, y, rot }, i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot})`} opacity="0.55">
            <line x1="-7" y1="-3" x2="7" y2="-3" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="-7" y1="3"  x2="7" y2="3"  stroke="#38BDF8" strokeWidth="1.5" />
          </g>
        ))}

        {/* Resistor symbols */}
        {RESISTORS.map(({ x, y, w, h }, i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#0d1825" stroke="#38BDF8" strokeWidth="0.8" opacity="0.6" />
        ))}

        {/* Junction nodes */}
        {NODES.map(([cx, cy], i) => (
          <circle
            key={i}
            className="node-dot"
            cx={cx}
            cy={cy}
            r="3"
            fill="#38BDF8"
            opacity="0"
            filter="url(#ld-glow)"
          />
        ))}

        {/* CPU chip */}
        <g id="loader-cpu-chip" opacity="0" filter="url(#ld-glow-strong)">
          {/* Outer body */}
          <rect x="650" y="405" width="140" height="90" fill="#040d18" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Inner die */}
          <rect x="662" y="416" width="116" height="68" fill="none" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />
          {/* Top pins */}
          {PIN_X.map(x => <line key={`pt${x}`} x1={x} y1={405} x2={x} y2={392} stroke="#38BDF8" strokeWidth="1" />)}
          {/* Bottom pins */}
          {PIN_X.map(x => <line key={`pb${x}`} x1={x} y1={495} x2={x} y2={508} stroke="#38BDF8" strokeWidth="1" />)}
          {/* Left pins */}
          {PIN_Y.map(y => <line key={`pl${y}`} x1={650} y1={y} x2={637} y2={y} stroke="#38BDF8" strokeWidth="1" />)}
          {/* Right pins */}
          {PIN_Y.map(y => <line key={`pr${y}`} x1={790} y1={y} x2={803} y2={y} stroke="#38BDF8" strokeWidth="1" />)}
          {/* Label */}
          <text x="720" y="454" textAnchor="middle" fill="#38BDF8" fontFamily="monospace" fontSize="11" letterSpacing="1.5" opacity="0.9">
            CPU-01
          </text>
        </g>

        {/* IC / RAM chips */}
        {CHIPS.map(({ x, y, w, h, label }) => (
          <g key={label} className="chip-label" opacity="0" filter="url(#ld-glow)">
            <rect x={x} y={y} width={w} height={h} fill="#040d18" stroke="#38BDF8" strokeWidth="0.8" />
            <text
              x={x + w / 2}
              y={y + h / 2 + 4}
              textAnchor="middle"
              fill="#38BDF8"
              fontFamily="monospace"
              fontSize="8"
              letterSpacing="0.5"
              opacity="0.9"
            >
              {label}
            </text>
          </g>
        ))}

        {/* GND symbol — bottom left */}
        <g opacity="0.5">
          <line x1="85"  y1="848" x2="115" y2="848" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="90"  y1="854" x2="110" y2="854" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="95"  y1="860" x2="105" y2="860" stroke="#38BDF8" strokeWidth="0.9" />
          <text x="100" y="840" textAnchor="middle" fill="#38BDF8" fontFamily="monospace" fontSize="8">GND</text>
        </g>

        {/* PWR symbol — top right */}
        <g opacity="0.5">
          <circle cx="1340" cy="48" r="12" fill="none" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="1340" y="52" textAnchor="middle" fill="#38BDF8" fontFamily="monospace" fontSize="7">PWR</text>
        </g>
      </svg>

      {/* ── HUD corner brackets ───────────────────────────────── */}
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* ── HUD text overlays ─────────────────────────────────── */}
      <HUD style={{ top: 28, left: 64 }}>SYS: INITIALIZING</HUD>
      <HUD style={{ top: 28, right: 64 }}>v2.1.0 // 2025</HUD>
      <HUD style={{ bottom: 28, left: 64 }}>LAT: 18.9752° N · LON: 72.8258° E</HUD>
      <HUD style={{ bottom: 28, right: 64 }}>
        STATUS: {status}
      </HUD>

      {/* ── Wordmark — appears last ───────────────────────────── */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          zIndex: 2,
          // Subtle dark backdrop so text reads over circuit
          background: 'radial-gradient(ellipse 40% 25% at 50% 50%, rgba(8,8,8,0.85) 0%, transparent 100%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            <span style={{ color: '#F0EDE6' }}>RELENTLESS </span>
            <span style={{ color: '#38BDF8' }}>AIS</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 12,
            color: '#38BDF8',
            letterSpacing: '0.3em',
            marginTop: 14,
            opacity: 0.7,
            textTransform: 'uppercase',
          }}>
            Digital Product Studio
          </p>
        </div>
      </div>
    </div>
  )
}
