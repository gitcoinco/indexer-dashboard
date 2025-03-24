import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gitcoin Indexer Status',
  description: 'Monitor Gitcoin Indexer synchronization status',
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