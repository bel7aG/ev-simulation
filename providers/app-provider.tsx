/**
 * @file components/app-provider.tsx
 * @description App provider component.
 * This component wraps the application to provide all root providers.
 */
'use client'

import { ThemeProvider } from 'next-themes'
import { PropsWithChildren } from 'react'
import { Toaster as SonnerToaster } from 'sonner'

interface AppProviderProps {}
/**
 * @param {React.ReactNode} props.children - Child elements
 * @returns {JSX.Element} The app provider wrapping its children.
 */
export function AppProvider({ children, ...props }: PropsWithChildren<AppProviderProps>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SonnerToaster position="bottom-right" /> {/* Sonner Toaster for notifications */}
      {children}
    </ThemeProvider>
  )
}
