/**
 * @file components/simulation/simulation-results-display.tsx
 * @description Component responsible for displaying the results of an EV charging simulation.
 * It includes summary statistics, main tab navigation, and delegates tab content rendering
 * to specialized child components. Handles client-side filtering for charts and animated tab transitions.
 * Also animates the transition from its placeholder state to displaying results.
 */
'use client'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion' // Added for placeholder/content animation
import { LineChartIcon } from 'lucide-react'

import type { SimulationOutputResults, ExemplaryDayDataPoint, DailyPeakDataPoint } from '@/app/actions'
import { DAYS_IN_YEAR, HOURS_PER_DAY } from '@/lib/simulation/config'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/simulation/common'

import { ChartsTabContent } from './results/charts-tab-content'
import { EventsTabContent } from './results/events-tab-content'
import { DetailsTabContent } from './results/details-tab-content'

/**
 * @const {string[]} MONTH_NAMES
 * @description Array of month names for display purposes, passed to child components.
 */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * @interface SimulationResultsDisplayProps
 * @description Props for the SimulationResultsDisplay component.
 */
interface SimulationResultsDisplayProps {
  results: SimulationOutputResults | null
}

/**
 * @const {{value: string, label: string}[]} hourOptions
 * @description Options for the hour range filter dropdowns, passed to ChartsTabContent.
 */
const hourOptions = Array.from({ length: HOURS_PER_DAY }, (_, i) => ({
  value: i.toString(),
  label: `${String(i).padStart(2, '0')}:00`,
}))

/**
 * @const {{value: string, label: string}[]} yearlyPeriodOptions
 * @description Options for the yearly period filter dropdown, passed to ChartsTabContent.
 */
const yearlyPeriodOptions = [
  { value: '1y', label: 'Last 1 Year' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '1m', label: 'Last 1 Month' },
]

/**
 * @const {object} mainContentVariants
 * @description Animation variants for the main content (placeholder or results) transition.
 */
const mainContentVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeInOut' } },
}

/**
 * @const {object} tabContentVariants
 * @description Animation variants for tab content transitions.
 */
const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeInOut' } },
}

export function SimulationResultsDisplay({ results }: SimulationResultsDisplayProps) {
  const [hourRange, setHourRange] = useState<{ start: number; end: number }>({ start: 0, end: HOURS_PER_DAY - 1 })
  const [yearlyPeriod, setYearlyPeriod] = useState<string>(yearlyPeriodOptions[1].value) // Default to 6m
  const [activeTab, setActiveTab] = useState<string>('charts')

  const filteredExemplaryDayPower: ExemplaryDayDataPoint[] = useMemo(() => {
    if (!results?.exemplaryDayPower) return []
    return results.exemplaryDayPower.filter((point) => point.hour >= hourRange.start && point.hour <= hourRange.end)
  }, [results?.exemplaryDayPower, hourRange])

  const filteredYearlyPeakPower: DailyPeakDataPoint[] = useMemo(() => {
    if (!results?.yearlyPeakPower) return []
    let daysToInclude = DAYS_IN_YEAR
    switch (yearlyPeriod) {
      case '6m':
        daysToInclude = Math.ceil(DAYS_IN_YEAR / 2)
        break
      case '3m':
        daysToInclude = Math.ceil(DAYS_IN_YEAR / 4)
        break
      case '1m':
        daysToInclude = Math.ceil(DAYS_IN_YEAR / 12)
        break
    }
    const startIndex = Math.max(0, results.yearlyPeakPower.length - daysToInclude)
    return results.yearlyPeakPower.slice(startIndex)
  }, [results?.yearlyPeakPower, yearlyPeriod])

  return (
    <AnimatePresence mode="wait">
      {!results ? (
        <motion.div
          key="results-placeholder"
          variants={mainContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center rounded-lg border border-border bg-card p-6 shadow-subtle"
        >
          <LineChartIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-60" />
          <h3 className="mb-1 text-lg font-medium text-foreground">Simulation Results</h3>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Configure parameters on the left and run the simulation to visualize EV charging station performance.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="results-content"
          variants={mainContentVariants}
          initial="initial"
          animate="animate"
          exit="exit" // This handles if results are cleared back to null
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Simulation Overview</h1>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Energy Consumed" value={`${results.totalEnergyConsumedKwh.toFixed(1)} kWh`} />
            <StatCard title="Actual Max Power Demand" value={`${results.actualMaxPowerDemandKw.toFixed(1)} kW`} />
            <StatCard
              title="Concurrency Factor"
              value={`${results.concurrencyFactor.toFixed(1)}%`}
              description={`Theoretical Max: ${results.theoreticalMaxPowerDemandKw.toFixed(1)} kW`}
            />
            <StatCard title="Total Charging Sessions" value={results.numChargingSessions.toLocaleString()} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-10 justify-start rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="charts"
                className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm hover:bg-secondary data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Performance Charts
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm hover:bg-secondary data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Charging Events
              </TabsTrigger>
              <TabsTrigger
                value="raw-stats"
                className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm hover:bg-secondary data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Input Details
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* This is the existing AnimatePresence for tabs */}
              <motion.div
                key={activeTab} // Key for tab content
                variants={tabContentVariants} // Using the specific variants for tab switching
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-6"
              >
                {activeTab === 'charts' && (
                  <ChartsTabContent
                    exemplaryDayPowerData={filteredExemplaryDayPower}
                    yearlyPeakPowerData={filteredYearlyPeakPower}
                    theoreticalMaxPowerKw={results.theoreticalMaxPowerDemandKw}
                    hourRange={hourRange}
                    onHourRangeChange={setHourRange}
                    yearlyPeriod={yearlyPeriod}
                    onYearlyPeriodChange={setYearlyPeriod}
                    hourOptions={hourOptions}
                    yearlyPeriodOptions={yearlyPeriodOptions}
                  />
                )}
                {activeTab === 'events' && (
                  <EventsTabContent eventsBreakdown={results.eventsBreakdown} monthNames={MONTH_NAMES} />
                )}
                {activeTab === 'raw-stats' && <DetailsTabContent inputsUsed={results.inputsUsed} />}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
