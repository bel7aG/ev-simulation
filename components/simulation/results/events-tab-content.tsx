/**
 * @file components/simulation/results/events-tab-content.tsx
 * @description Renders the content for the "Charging Events" tab,
 * including average session stats and a monthly breakdown table.
 */
'use client'

import type { ChargingEventsBreakdown } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/components/simulation/common'

/**
 * @interface EventsTabContentProps
 * @description Props for the EventsTabContent component.
 */
interface EventsTabContentProps {
  eventsBreakdown: ChargingEventsBreakdown
  monthNames: string[]
}

/**
 * EventsTabContent component.
 * Displays a breakdown of charging events.
 * @param {EventsTabContentProps} props - Component props.
 * @returns {JSX.Element} The content for the events tab.
 */
export function EventsTabContent({ eventsBreakdown, monthNames }: EventsTabContentProps) {
  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="text-base font-medium">Charging Events Breakdown</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Illustrative breakdown of total charging sessions (mocked).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard title="Avg. Daily Sessions" value={eventsBreakdown.avgPerDay.toFixed(1)} small />
          <StatCard title="Avg. Weekly Sessions" value={eventsBreakdown.avgPerWeek.toFixed(1)} small />
        </div>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="h-11 min-w-[120px] px-4 text-left align-middle font-medium text-muted-foreground">
                Month
              </TableHead>
              <TableHead className="h-11 px-4 text-right align-middle font-medium text-muted-foreground">
                Sessions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsBreakdown.perMonth.map((sessions, index) => (
              <TableRow key={monthNames[index]} className="hover:bg-secondary/80 data-[state=selected]:bg-muted">
                <TableCell className="px-4 py-3 align-middle font-medium">{monthNames[index]}</TableCell>
                <TableCell className="px-4 py-3 text-right align-middle">{sessions.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
