import type React from 'react'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import { AppProvider } from '@/providers/app-provider'
import { Header } from '@/components/layout/header'

// 💄 (styles)
import '../styles/globals.css'

const geist = Geist({ subsets: ['latin'] })

/**
 * @type {Metadata}
 * @description Metadata for the application, used for SEO and browser tab information.
 */
export const metadata: Metadata = {
  title: 'EV Charging Simulation Dashboard',
  description: 'Visualize EV charging station performance and energy consumption.',
}

/**
 * RootLayout component.
 * @param {Readonly<{ children: React.ReactNode }>} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
