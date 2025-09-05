import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unusual Whales Scraper',
  description: 'Real-time options flow data extraction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}