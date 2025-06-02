'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts'

import type { DailyPeakDataPoint } from '@/app/actions'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'

/**
 * @interface YearlyOverviewChartProps
 * @description Props for the YearlyOverviewChart component.
 */
interface YearlyOverviewChartProps {
  /** @type {DailyPeakDataPoint[]} data - Array of data points for the chart. */
  data: DailyPeakDataPoint[]
  /** @type {number} maxPower - The theoretical maximum power, used for a reference line. */
  maxPower: number
}

/**
 * @const {ChartConfig} chartConfig
 * @description Configuration for the chart's series, including label and color.
 */
const chartConfig = {
  peakPowerKw: {
    label: 'Peak Power',
    color: 'hsl(var(--chart-2))', // Blue
  },
} satisfies ChartConfig

/**
 * YearlyOverviewChart component.
 * Renders a bar chart showing daily peak power demand over a year.
 * @param {YearlyOverviewChartProps} props - Component props.
 * @returns {JSX.Element} The bar chart visualization or a placeholder if no data.
 */
export function YearlyOverviewChart({ data, maxPower }: YearlyOverviewChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">No data available for this period.</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: -25, // Adjust to bring Y-axis labels closer
            bottom: 0,
          }}
          barSize={3} // Slimmer bars for a denser look
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-[11px]"
            interval="preserveStartEnd" // Ensures first and last ticks are shown if possible
            minTickGap={60} // Minimum gap between ticks to avoid clutter
            tickFormatter={(tick) =>
              tick % 30 === 0 || tick === 1 || tick === data[data.length - 1]?.day ? `D${tick}` : ''
            } // Show labels for D1, D365 and roughly monthly
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            className="text-[11px]"
            tickFormatter={(value) => `${value}`} // Display plain number for kW
            domain={[0, 'dataMax + 20']} // Add some headroom
          />
          <RechartsTooltip
            cursor={{ fill: 'hsl(var(--secondary))' }} // Use secondary color for bar hover background
            contentStyle={{
              background: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
            }}
            labelFormatter={(label) => `Day ${label}`}
            formatter={(value, name) => {
              const config = chartConfig[name as keyof typeof chartConfig]
              return [`${Number(value).toFixed(1)} kW`, config?.label || name]
            }}
          />
          <ReferenceLine
            y={maxPower}
            label={{
              value: 'Max Theory',
              position: 'insideTopRight',
              className: 'text-[10px] fill-destructive opacity-70',
              dy: 5,
              dx: -5,
            }}
            stroke="hsl(var(--destructive) / 0.5)"
            strokeDasharray="2 2"
          />
          <Bar
            dataKey="peakPowerKw"
            name="peakPowerKw" // Key for tooltip formatter
            fill={chartConfig.peakPowerKw.color}
            radius={[2, 2, 0, 0]} // Slight rounding on top of bars
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
