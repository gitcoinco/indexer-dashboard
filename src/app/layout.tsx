import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blockchain Indexer Status',
  description: 'Monitor blockchain indexer synchronization status',
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