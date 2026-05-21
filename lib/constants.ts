// lib/constants.ts — all site content lives here

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
]

export interface Service {
  icon: string
  title: string
  body: string
  forList: string[]
}

export const SERVICES: Service[] = [
  {
    icon: '↗',
    title: 'Brand Websites',
    body: "Cinematic, story-driven websites built to convert and impress. We design and build the kind of site your competitors don't have.",
    forList: ['Musicians', 'D2C Brands', 'Creative Professionals'],
  },
  {
    icon: '◈',
    title: 'AI Dashboards',
    body: "Custom intelligence tools that turn your operational data into real-time decisions. Built for teams that can't afford blind spots.",
    forList: ['Fintech', 'Wealth Management', 'Ops-Heavy Businesses'],
  },
  {
    icon: '⟳',
    title: 'Automation Pipelines',
    body: 'OCR, document processing, and workflow automation that eliminates manual work and scales with your business.',
    forList: ['Lenders', 'Compliance Teams', 'Financial Institutions'],
  },
]

export interface Project {
  image: string
  tag: string
  title: string
  body: string
  stack: string[]
  link?: string
  badge?: string
}

export const PROJECTS: Project[] = [
  {
    image: '/images/ron-ashton.jpg',
    tag: 'ENTERTAINMENT',
    title: 'Ron Ashton Music',
    body: "A premium artist website for one of Mumbai's most sought-after musicians. Cinematic scroll animations, GSAP Flip transitions, multi-service pages, and a live booking system.",
    stack: ['Next.js', 'GSAP', 'Framer Motion'],
    link: 'https://ron-pereira.vercel.app',
  },
  {
    image: '/images/meridian-dashboard.jpg',
    tag: 'FINTECH',
    title: 'Portfolio Intelligence Dashboard',
    body: 'A real-time wealth management operations tool — live trade tracking across asset classes, GPT-4o AI portfolio analysis, multi-currency cash balances, settlement monitoring, and interactive P&L charts.',
    stack: ['React', 'GPT-4o', 'Recharts'],
    link: '#', // TODO: update before launch
  },
  {
    image: '/images/jaan-perfumes.jpg',
    tag: 'D2C · E-COMMERCE',
    title: 'JAAN Perfumes',
    body: 'A bilingual Hindi/English storefront for a premium Indian fragrance brand. Product catalog, cart functionality, gifting collections, and a strong brand voice built to convert.',
    stack: ['Next.js', 'Tailwind', 'E-commerce'],
    link: 'https://jaan-pied.vercel.app',
  },
  {
    image: '/images/ddr-pipeline.jpg',
    tag: 'FINTECH · AUTOMATION',
    title: 'Loan Applicant Due Diligence Pipeline',
    body: "An OCR-powered document extraction and automated report generation system for a lending firm's background verification process. In production, with positive client reviews.",
    stack: ['OCR', 'Python', 'Automation'],
    badge: '✓ IN PRODUCTION',
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
  tag: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: '[REPLACE WITH REAL QUOTE]', // TODO: REPLACE WITH REAL QUOTE
    name: '[Client Name]',
    role: '[Role], [Company]',
    tag: 'DUE DILIGENCE PIPELINE',
  },
  {
    quote: '[REPLACE WITH REAL QUOTE]', // TODO: REPLACE WITH REAL QUOTE
    name: 'Ron Ashton',
    role: 'Musician · Performer · Educator',
    tag: 'BRAND WEBSITE',
  },
  {
    quote: '[REPLACE WITH REAL QUOTE]', // TODO: REPLACE WITH REAL QUOTE
    name: '[Client Name]',
    role: 'Founder, JAAN Perfumes',
    tag: 'E-COMMERCE WEBSITE',
  },
]

export interface Stat {
  number: string
  label: string
}

export const STATS: Stat[] = [
  { number: '04', label: 'Projects live' },
  { number: '03', label: 'Client reviews' },
  { number: '03', label: 'Industries served' },
  { number: '100%', label: 'Built with AI' },
]

export const CONTACT = {
  email: 'admin@relentlessais.com',
  phone: '+91 6002944816',
  location: 'Mumbai · Available Worldwide',
}

export const TYPING_WORDS = [
  'websites',
  'dashboards',
  'pipelines',
  'products that think',
]
