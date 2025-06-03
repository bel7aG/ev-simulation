/**
 * @file components/simulation/common.tsx
 * @description Contains common UI components used within the simulation results display,
 * such as stat cards and chart wrapper cards.
 */
'use client'

import type React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * @interface StatCardProps
 * @description Props for the StatCard component.
 * This component displays a single statistic in a card, styled similarly to Vercel's UI.
 */
export interface StatCardProps {
  /** @type {string} title - The title of the statistic. */
  title: string
  /** @type {string} value - The value of the statistic. */
  value: string
  /** @type {string} [description] - Optional description or subtext for the statistic. */
  description?: string
  /** @type {boolean} [small] - If true, applies smaller padding and font sizes. */
  small?: boolean
  // icon?: React.ReactNode; // Optional icon placeholder
}

/**
 * StatCard component.
 * Renders a card displaying a key statistic.
 * @param {StatCardProps} props - Component props.
 * @returns {JSX.Element} The statistic card.
 */
export function StatCard({ title, value, description, small }: StatCardProps) {
  return (
    <Card className={cn('border-border bg-card shadow-card', small ? 'p-4' : 'p-5')}>
      <p className={cn('mb-0.5 text-xs text-muted-foreground', small ? 'mb-0' : 'mb-0.5')}>{title}</p>
      <p className={cn('font-semibold text-foreground', small ? 'text-xl' : 'text-2xl')}>{value}</p>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </Card>
  )
}

/**
 * @interface ChartCardProps
 * @description Props for the ChartCard component.
 * This component wraps a chart, providing a consistent header with title, description, and optional controls.
 */
export interface ChartCardProps {
  /** @type {string} title - The title of the chart. */
  title: string
  /** @type {string} [description] - Optional description for the chart. */
  description?: string
  /** @type {React.ReactNode} children - The chart component itself. */
  children: React.ReactNode
  /** @type {React.ReactNode} [controls] - Optional controls for the chart (e.g., filters). */
  controls?: React.ReactNode
}

/**
 * ChartCard component.
 * A wrapper card for displaying charts with a title, description, and optional controls.
 * @param {ChartCardProps} props - Component props.
 * @returns {JSX.Element} The chart card.
 */
export function ChartCard({ title, description, children, controls }: ChartCardProps) {
  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-0.5 text-sm text-muted-foreground">{description}</CardDescription>
            )}
          </div>
          {controls && <div className="flex-shrink-0">{controls}</div>}
        </div>
      </CardHeader>
      <CardContent className="-mt-2 pb-4 pl-2 pr-4">
        {/* Adjust padding for charts */}
        {children}
      </CardContent>
    </Card>
  )
}
