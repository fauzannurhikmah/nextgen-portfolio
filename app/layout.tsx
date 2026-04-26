import type { Metadata } from 'next'
import { Bebas_Neue, Instrument_Sans } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'Fauzan Nurhikmah — Full Stack Developer',
  description:
    'Engineering precision meets design intuition. Building digital products that perform at the edge — fast, scalable, and remembered.',
  keywords: ['Full Stack Developer', 'React', 'Next.js', 'WebGL', 'Three.js'],

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },

  openGraph: {
    title: 'Fauzan Nurhikmah — Full Stack Developer',
    description: 'Engineering precision meets design intuition.',
    url: 'https://portfolio.zhiendfield.com', // ganti nanti
    siteName: 'Fauzan Portfolio',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Fauzan Nurhikmah',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Fauzan Nurhikmah — Full Stack Developer',
    description: 'Engineering precision meets design intuition.',
    images: ['/icon.png'],
  },

  metadataBase: new URL('https://portfolio.zhiendfield.com'), // wajib kalau deploy
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      style={{ scrollBehavior: 'smooth' }}
      className={`${bebas.variable} ${instrument.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}