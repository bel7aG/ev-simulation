'use server'

import { EVChargingSimulation, type SimulationOptions } from '@/lib/simulation'
import { SeededRandom } from '@/lib/simulation/random'
import type { SimulationStatistics } from '@/lib/simulation/statistics'
import {
  DEFAULT_SIMULATION_SEED,
  HOURS_PER_DAY,
  DAYS_IN_YEAR,
  ARRIVAL_PROBABILITY_PER_HOUR_T1,
  TICKS_PER_HOUR,
} from '@/lib/simulation/config'

/**
 * @interface SimulationInputParameters
 * @description Defines the input parameters required to run a simulation.
 * These parameters are typically provided by the user through the UI.
 */
export interface SimulationInputParameters {
  /** @type {number} The number of chargepoints in the simulation. */
  numChargepoints: number
  /** @type {number} A multiplier (percentage) for EV arrival probability. E.g., 100 for 100%. */
  arrivalMultiplier: number
  /** @type {number} The average energy consumption of cars in kWh per 100km. */
  carConsumptionKwh100km: number
  /** @type {number} The power output of each chargepoint in kW. */
  chargepointPowerKw: number
}

/**
 * @interface ExemplaryDayDataPoint
 * @description Represents a single data point for the exemplary day power demand chart.
 */
export interface ExemplaryDayDataPoint {
  /** @type {number} The hour of the day (0-23). */
  hour: number
  /** @type {number} The simulated power demand in kW for this hour. */
  powerDemandKw: number
}

/**
 * @interface DailyPeakDataPoint
 * @description Represents a single data point for the daily peak power overview chart.
 */
export interface DailyPeakDataPoint {
  /** @type {number} The day of the year (1-365). */
  day: number
  /** @type {number} The peak power demand in kW recorded for this day. */
  peakPowerKw: number
}

/**
 * @interface ChargingEventsBreakdown
 * @description Provides a breakdown of charging events over different time periods.
 * This data is currently mocked based on total simulation sessions.
 */
export interface ChargingEventsBreakdown {
  /** @type {number[]} An array of 12 numbers, representing total charging sessions for each month. */
  perMonth: number[]
  /** @type {number} The average number of charging sessions per week. */
  avgPerWeek: number
  /** @type {number} The average number of charging sessions per day. */
  avgPerDay: number
}

/**
 * @interface SimulationOutputResults
 * @description Defines the structure of the results returned after a simulation run.
 * This includes summary statistics, data for charts, and the inputs used.
 */
export interface SimulationOutputResults {
  /** @type {number} Total energy consumed by all EVs during the simulation in kWh. */
  totalEnergyConsumedKwh: number
  /** @type {number} The actual maximum power demand observed across all chargepoints in kW. */
  actualMaxPowerDemandKw: number
  /** @type {number} The theoretical maximum power demand if all chargepoints were active simultaneously in kW. */
  theoreticalMaxPowerDemandKw: number
  /** @type {number} The concurrency factor as a percentage (actualMaxPowerDemandKw / theoreticalMaxPowerDemandKw). */
  concurrencyFactor: number
  /** @type {number} The total number of EV charging sessions initiated. */
  numChargingSessions: number
  /** @type {ExemplaryDayDataPoint[]} Data points for the exemplary day power demand chart. */
  exemplaryDayPower: ExemplaryDayDataPoint[]
  /** @type {DailyPeakDataPoint[]} Data points for the yearly daily peak power overview chart. */
  yearlyPeakPower: DailyPeakDataPoint[]
  /** @type {ChargingEventsBreakdown} A breakdown of charging events. */
  eventsBreakdown: ChargingEventsBreakdown
  /** @type {SimulationInputParameters} The input parameters that were used for this simulation run. */
  inputsUsed: SimulationInputParameters
}

/**
 * Runs the EV charging simulation with the given parameters and generates output results.
 * This is a Next.js Server Action.
 * @async
 * @function runSimulationAction
 * @param {SimulationInputParameters} params - The input parameters for the simulation.
 * @returns {Promise<SimulationOutputResults>} A promise that resolves to the simulation output results.
 */
export async function runSimulationAction(params: SimulationInputParameters): Promise<SimulationOutputResults> {
  console.log('[Action] Received simulation request with params:', params)

  const simOptions: SimulationOptions = {
    seed: DEFAULT_SIMULATION_SEED,
    verbose: false, // Keep server logs cleaner for UI-triggered actions
  }

  // Run the main simulation
  const mainSimulation = new EVChargingSimulation(params.numChargepoints, simOptions)
  const stats: SimulationStatistics = mainSimulation.run()

  const theoreticalMaxPowerDemandKw = params.numChargepoints * params.chargepointPowerKw
  const concurrencyFactor =
    theoreticalMaxPowerDemandKw > 0 ? (stats.actualMaxPowerDemandKw / theoreticalMaxPowerDemandKw) * 100 : 0

  // Seed for generating mock chart data consistently based on inputs
  const chartDataRandom = new SeededRandom(
    DEFAULT_SIMULATION_SEED + 1 + params.numChargepoints + params.arrivalMultiplier,
  )

  // Generate mock data for Exemplary Day Power chart
  const exemplaryDayPower: ExemplaryDayDataPoint[] = []
  const hourlyArrivalProbs = ARRIVAL_PROBABILITY_PER_HOUR_T1
  let dailyTotalMockEnergy = 0 // For logging/debugging
  const rawHourlyPower: number[] = hourlyArrivalProbs.map((prob) => {
    const scaledProb = prob * (params.arrivalMultiplier / 100)
    const randomFactor = 0.5 + chartDataRandom.next() * 1.0 // Randomness factor [0.5, 1.5]
    let power = scaledProb * theoreticalMaxPowerDemandKw * randomFactor
    // Cap mock power to be somewhat related to actual max power from simulation
    power = Math.min(power, stats.actualMaxPowerDemandKw * 1.1)
    return power
  })
  // Normalize mock data to align its peak with the simulation's actualMaxPowerDemandKw
  const peakRawPower = Math.max(...rawHourlyPower, 0.01) // Avoid division by zero
  const normalizationFactor = stats.actualMaxPowerDemandKw / peakRawPower
  for (let i = 0; i < HOURS_PER_DAY; i++) {
    let power = rawHourlyPower[i] * normalizationFactor
    power = power * (0.9 + chartDataRandom.next() * 0.2) // Add slight per-hour variation
    power = Math.max(0, Math.min(power, theoreticalMaxPowerDemandKw)) // Ensure bounds
    exemplaryDayPower.push({
      hour: i,
      powerDemandKw: Number.parseFloat(power.toFixed(2)),
    })
    dailyTotalMockEnergy += power / TICKS_PER_HOUR // Assuming power is constant for the hour
  }

  // Generate mock data for Yearly Peak Power chart
  const yearlyPeakPower: DailyPeakDataPoint[] = []
  const baseYearlyPattern = [0.7, 0.75, 0.8, 0.75, 0.7, 0.55, 0.45] // Mock day-of-week influence
  let yearlyTotalMockEnergyFromPeaks = 0 // For logging/debugging
  for (let day = 1; day <= DAYS_IN_YEAR; day++) {
    const dayOfWeekFactor = baseYearlyPattern[(day - 1) % 7]
    const seasonalFactor = 0.8 + 0.4 * Math.abs(Math.sin(((day - DAYS_IN_YEAR / 4) / DAYS_IN_YEAR) * Math.PI)) // Mock seasonal variation
    const randomFactor = 0.7 + chartDataRandom.next() * 0.6 // Add randomness

    let peakPower =
      stats.actualMaxPowerDemandKw * dayOfWeekFactor * seasonalFactor * randomFactor * (params.arrivalMultiplier / 100)
    peakPower = Math.max(0, Math.min(peakPower, theoreticalMaxPowerDemandKw)) // Ensure bounds

    yearlyPeakPower.push({
      day,
      peakPowerKw: Number.parseFloat(peakPower.toFixed(2)),
    })
    // Rough energy estimate assuming peak lasts for 1/3 of the day for mock calculation
    yearlyTotalMockEnergyFromPeaks += (peakPower * (HOURS_PER_DAY / 3)) / TICKS_PER_HOUR
  }

  // Approximate number of charging sessions from the simulation instance
  // @ts-ignore: Accessing private `nextEvId` for approximation. In a real scenario, this might be a public getter or part of stats.
  const numChargingSessions = mainSimulation.nextEvId > 1 ? mainSimulation.nextEvId - 1 : 0

  // Generate Mock Charging Events Breakdown
  const eventsBreakdown: ChargingEventsBreakdown = {
    perMonth: [],
    avgPerWeek: 0,
    avgPerDay: 0,
  }

  if (numChargingSessions > 0) {
    // Example seasonal distribution factors (summing to ~1)
    const monthlyDistributionFactors = [0.07, 0.06, 0.08, 0.08, 0.09, 0.09, 0.1, 0.1, 0.09, 0.08, 0.08, 0.08]
    const totalFactor = monthlyDistributionFactors.reduce((sum, factor) => sum + factor, 0)
    const normalizedMonthlyFactors = monthlyDistributionFactors.map((factor) => factor / totalFactor)

    let remainingSessions = numChargingSessions
    for (let i = 0; i < 11; i++) {
      // Distribute for first 11 months
      const sessionsThisMonth = Math.round(
        numChargingSessions * normalizedMonthlyFactors[i] * (0.9 + chartDataRandom.next() * 0.2),
      )
      eventsBreakdown.perMonth.push(sessionsThisMonth)
      remainingSessions -= sessionsThisMonth
    }
    eventsBreakdown.perMonth.push(Math.max(0, remainingSessions)) // Assign remainder to the last month

    // Ensure sum matches total sessions (due to rounding)
    const sumMonthlySessions = eventsBreakdown.perMonth.reduce((sum, s) => sum + s, 0)
    if (sumMonthlySessions !== numChargingSessions && eventsBreakdown.perMonth.length > 0) {
      const diff = numChargingSessions - sumMonthlySessions
      eventsBreakdown.perMonth[eventsBreakdown.perMonth.length - 1] += diff // Add/remove diff from last month
    }

    eventsBreakdown.avgPerDay = numChargingSessions / DAYS_IN_YEAR
    eventsBreakdown.avgPerWeek = numChargingSessions / (DAYS_IN_YEAR / 7)
  } else {
    eventsBreakdown.perMonth = Array(12).fill(0)
  }

  console.log(
    `[Action] Mock daily energy: ${dailyTotalMockEnergy.toFixed(2)} kWh (for one day). Actual yearly: ${stats.totalEnergyConsumedKwh.toFixed(2)} kWh.`,
  )
  console.log(
    `[Action] Mock yearly energy from peaks: ${yearlyTotalMockEnergyFromPeaks.toFixed(2)} kWh. This is a very rough estimate.`,
  )
  console.log(`[Action] Charging Events Breakdown (Mocked):`, eventsBreakdown)

  return {
    totalEnergyConsumedKwh: stats.totalEnergyConsumedKwh,
    actualMaxPowerDemandKw: stats.actualMaxPowerDemandKw,
    theoreticalMaxPowerDemandKw,
    concurrencyFactor,
    numChargingSessions,
    exemplaryDayPower,
    yearlyPeakPower,
    eventsBreakdown,
    inputsUsed: params,
  }
}
