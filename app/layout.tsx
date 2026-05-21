import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Relentless AIS — Digital Product Studio',
  description: 'We build premium websites, AI dashboards, and automation pipelines for businesses that want to stand out and operate smarter.',
  keywords: ['web development India', 'AI dashboard development', 'fintech dashboard', 'premium website design Mumbai', 'automation pipeline', 'Next.js developer India'],
  openGraph: {
    title: 'Relentless AIS — Digital Product Studio',
    description: 'Premium websites, AI dashboards, and automation pipelines.',
    url: 'https://relentlessais.com',
    siteName: 'Relentless AIS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relentless AIS',
    description: 'We build digital products that think.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
