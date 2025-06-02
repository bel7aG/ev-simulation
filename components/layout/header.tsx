/**
 * @file components/layout/header.tsx
 * @description Defines the main application header component.
 * It includes the application title/logo and theme toggle functionality.
 */
import { Settings2 } from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'

/**
 * Header component.
 * Renders the sticky header at the top of the application.
 * @returns {JSX.Element} The application header.
 */
export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/55 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 w-full items-center px-4 md:px-6">
        <div className="mr-auto flex items-center">
          <a className="mr-4 flex items-center space-x-2" href="/">
            <Settings2 className="h-5 w-5 text-foreground/80" />
            <span className="font-medium text-foreground">EV Charging Simulation</span>
          </a>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
