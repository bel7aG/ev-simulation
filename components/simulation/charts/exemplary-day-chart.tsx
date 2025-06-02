'use client'

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts'

import type { ExemplaryDayDataPoint } from '@/app/actions'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'

/**
 * @interface ExemplaryDayChartProps
 * @description Props for the ExemplaryDayChart component.
 */
interface ExemplaryDayChartProps {
  /** @type {ExemplaryDayDataPoint[]} data - Array of data points for the chart. */
  data: ExemplaryDayDataPoint[]
  /** @type {number} maxPower - The theoretical maximum power, used for a reference line. */
  maxPower: number
}

/**
 * @const {ChartConfig} chartConfig
 * @description Configuration for the chart's series, including label and color.
 */
const chartConfig = {
  powerDemandKw: {
    label: 'Power Demand',
    color: 'hsl(var(--chart-1))', // Orange
  },
} satisfies ChartConfig

/**
 * ExemplaryDayChart component.
 * Renders a line chart showing power demand for each hour of an exemplary day.
 * @param {ExemplaryDayChartProps} props - Component props.
 * @returns {JSX.Element} The line chart visualization or a placeholder if no data.
 */
export function ExemplaryDayChart({ data, maxPower }: ExemplaryDayChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">No data available for this period.</p>
      </div>
    )
  }

  // Format data for chart display, ensuring 'time' is a string for XAxis
  const formattedData = data.map((point) => ({
    ...point,
    time: `${String(point.hour).padStart(2, '0')}:00`,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 5,
            left: -25, // Adjust to bring Y-axis labels closer
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-[11px]"
            interval="preserveStartEnd"
            minTickGap={40} // Adjust to show fewer ticks if crowded
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            className="text-[11px]"
            tickFormatter={(value) => `${value}`} // Display plain number for kW
            domain={[0, 'dataMax + 20']} // Add some headroom above max data point
          />
          <RechartsTooltip
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            contentStyle={{
              background: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)', // Using a generic shadow variable if available
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
            }}
            labelFormatter={(label) => `Time: ${label}`}
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
          <Line
            type="monotone"
            dataKey="powerDemandKw"
            name="powerDemandKw" // Key for tooltip formatter
            stroke={chartConfig.powerDemandKw.color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, className: 'stroke-primary fill-background' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
