/**
 * @file components/simulation/results/charts-tab-content.tsx
 * @description Renders the content for the "Performance Charts" tab,
 * including charts for exemplary day power and yearly peak power, along with their filters.
 */
'use client'

import type { ExemplaryDayDataPoint, DailyPeakDataPoint } from '@/app/actions'
import { ChartCard } from '@/components/simulation/common'
import { ExemplaryDayChart } from '@/components/simulation/charts/exemplary-day-chart'
import { YearlyOverviewChart } from '@/components/simulation/charts/yearly-overview-chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

/**
 * @interface ChartsTabContentProps
 * @description Props for the ChartsTabContent component.
 */
interface ChartsTabContentProps {
  exemplaryDayPowerData: ExemplaryDayDataPoint[]
  yearlyPeakPowerData: DailyPeakDataPoint[]
  theoreticalMaxPowerKw: number
  hourRange: { start: number; end: number }
  onHourRangeChange: (newRange: { start: number; end: number }) => void
  yearlyPeriod: string
  onYearlyPeriodChange: (newPeriod: string) => void
  hourOptions: Array<{ value: string; label: string }>
  yearlyPeriodOptions: Array<{ value: string; label: string }>
}

/**
 * ChartsTabContent component.
 * Displays performance charts with interactive filters.
 * @param {ChartsTabContentProps} props - Component props.
 * @returns {JSX.Element} The content for the charts tab.
 */
export function ChartsTabContent({
  exemplaryDayPowerData,
  yearlyPeakPowerData,
  theoreticalMaxPowerKw,
  hourRange,
  onHourRangeChange,
  yearlyPeriod,
  onYearlyPeriodChange,
  hourOptions,
  yearlyPeriodOptions,
}: ChartsTabContentProps) {
  return (
    <div className="space-y-6">
      <ChartCard
        title="Exemplary Day Power Demand"
        description="Simulated power demand (kW) over a 24-hour period."
        controls={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="start-hour-filter" className="text-xs text-muted-foreground">
                From:
              </Label>
              <Select
                value={hourRange.start.toString()}
                onValueChange={(value) => {
                  const newStartHour = Number.parseInt(value)
                  if (newStartHour <= hourRange.end) {
                    onHourRangeChange({ ...hourRange, start: newStartHour })
                  }
                }}
              >
                <SelectTrigger id="start-hour-filter" className="h-7 w-[80px] text-xs [&_svg]:h-3.5 [&_svg]:w-3.5">
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((opt) => (
                    <SelectItem
                      key={`start-${opt.value}`}
                      value={opt.value}
                      className="text-xs"
                      disabled={Number.parseInt(opt.value) > hourRange.end}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="end-hour-filter" className="text-xs text-muted-foreground">
                To:
              </Label>
              <Select
                value={hourRange.end.toString()}
                onValueChange={(value) => {
                  const newEndHour = Number.parseInt(value)
                  if (newEndHour >= hourRange.start) {
                    onHourRangeChange({ ...hourRange, end: newEndHour })
                  }
                }}
              >
                <SelectTrigger id="end-hour-filter" className="h-7 w-[80px] text-xs [&_svg]:h-3.5 [&_svg]:w-3.5">
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((opt) => (
                    <SelectItem
                      key={`end-${opt.value}`}
                      value={opt.value}
                      className="text-xs"
                      disabled={Number.parseInt(opt.value) < hourRange.start}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      >
        <ExemplaryDayChart data={exemplaryDayPowerData} maxPower={theoreticalMaxPowerKw} />
      </ChartCard>
      <ChartCard
        title="Daily Peak Power Overview"
        description="Maximum power demand (kW) recorded for each day of the year."
        controls={
          <Select value={yearlyPeriod} onValueChange={onYearlyPeriodChange}>
            <SelectTrigger className="h-7 w-[150px] text-xs [&_svg]:h-3.5 [&_svg]:w-3.5">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {yearlyPeriodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <YearlyOverviewChart data={yearlyPeakPowerData} maxPower={theoreticalMaxPowerKw} />
      </ChartCard>
    </div>
  )
}
