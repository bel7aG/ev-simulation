/**
 * index.ts
 * Main EV Charging Simulation class.
 */
import {
  TOTAL_TICKS_PER_YEAR,
  TICKS_PER_HOUR,
  HOURS_PER_DAY,
  KWH_PER_100KM,
  ARRIVAL_PROBABILITY_PER_HOUR_T1,
  CHARGING_DEMAND_KM_DISTRIBUTION_T2,
  DEFAULT_SIMULATION_SEED,
  VERBOSE_LOGGING_CONFIG,
  POWER_PER_CHARGEPOINT_KW, // Declared here for use in Task 1 validation
} from './config'
import { SeededRandom } from './random'
import { getWeightedRandomChoice } from './distributions'
import { ElectricVehicle } from './ev'
import { ChargingStation } from './station'
import { SimulationStatistics } from './statistics'
import type { TickRef } from './chargepoint'

export interface SimulationOptions {
  seed?: number
  verbose?: boolean
  maxTicks?: number
}

export class EVChargingSimulation {
  private numChargepoints: number
  private station: ChargingStation
  private randomGenerator: SeededRandom
  public stats: SimulationStatistics // Made public for easier access from page.tsx
  private verbose: boolean
  private maxTicksToSimulate: number
  private currentTickRef: TickRef = { value: 0 }
  private nextEvId = 1

  constructor(numChargepoints: number, options: SimulationOptions = {}) {
    this.numChargepoints = numChargepoints
    const seed = options.seed === undefined ? DEFAULT_SIMULATION_SEED : options.seed
    this.verbose = options.verbose === undefined ? VERBOSE_LOGGING_CONFIG.defaultEnabled : options.verbose
    this.maxTicksToSimulate = options.maxTicks === undefined ? TOTAL_TICKS_PER_YEAR : options.maxTicks

    this.randomGenerator = new SeededRandom(seed)
    this.station = new ChargingStation(this.numChargepoints, this.verbose, this.currentTickRef)
    this.stats = new SimulationStatistics()

    if (this.verbose) {
      console.log(
        `🔋 Initializing Simulation: ${this.numChargepoints} CPs, Seed: ${seed}, Verbose: ${this.verbose}, Ticks: ${this.maxTicksToSimulate}`,
      )
    }
  }

  private _logSim(message: string): void {
    if (this.verbose) {
      console.log(`[TICK ${this.currentTickRef.value}][SIM] ${message}`)
    }
  }

  public run(): SimulationStatistics {
    for (let tick = 0; tick < this.maxTicksToSimulate; tick++) {
      this.currentTickRef.value = tick
      const currentHour = Math.floor((tick % (HOURS_PER_DAY * TICKS_PER_HOUR)) / TICKS_PER_HOUR)
      let totalEnergyDeliveredThisTick = 0
      let currentPowerDemandThisTick = 0

      if (tick > 0 && tick % (TICKS_PER_HOUR * HOURS_PER_DAY * 30) === 0 && !this.verbose) {
        console.log(
          `  Simulating... Tick ${tick}/${this.maxTicksToSimulate} (Day ${Math.floor(tick / (TICKS_PER_HOUR * HOURS_PER_DAY)) + 1}) for ${this.numChargepoints} CPs`,
        )
      }
      this._logSim(`--- Starting Tick (Hour: ${currentHour}) ---`)

      for (const chargepoint of this.station.chargepoints) {
        if (chargepoint.isAvailable()) {
          const hourlyArrivalProb = ARRIVAL_PROBABILITY_PER_HOUR_T1[currentHour]
          const tickArrivalProb = hourlyArrivalProb / TICKS_PER_HOUR
          if (this.randomGenerator.next() < tickArrivalProb) {
            this._logSim(`✨ EV Arrival Event at CP ${chargepoint.id} (Prob: ${tickArrivalProb.toFixed(4)})`)
            const demandKm = getWeightedRandomChoice(CHARGING_DEMAND_KM_DISTRIBUTION_T2, this.randomGenerator)
            const energyNeededKwh = (demandKm / 100) * KWH_PER_100KM
            if (energyNeededKwh > 0) {
              const newEV = new ElectricVehicle(this.nextEvId++, energyNeededKwh)
              if (chargepoint.assignEV(newEV)) {
                const energyDelivered = chargepoint.processChargingTick()
                totalEnergyDeliveredThisTick += energyDelivered
              }
            } else {
              // Using chargepoint's logger for context
              ;(chargepoint as any)._log(`ℹ️ EV arrived but rolled 0km demand, needs no charge.`)
            }
          }
        } else {
          const energyDelivered = chargepoint.processChargingTick()
          totalEnergyDeliveredThisTick += energyDelivered
        }
        if (!chargepoint.isAvailable()) {
          currentPowerDemandThisTick += chargepoint.powerKw
        }
      }
      this.stats.recordTickData(totalEnergyDeliveredThisTick, currentPowerDemandThisTick)
      this._logSim(
        `📊 Tick Summary: Energy Delivered: ${totalEnergyDeliveredThisTick.toFixed(2)} kWh, Current Power Demand: ${currentPowerDemandThisTick.toFixed(2)} kW`,
      )
    }
    if (this.verbose) {
      console.log(`🏁 Simulation run complete for ${this.maxTicksToSimulate} ticks.`)
    }
    return this.stats
  }
}

// --- Task 1 Validation Section ---
// This section is for demonstrating and validating Task 1 requirements directly from this module.
// Note: These logs will be executed whenever this module is imported and run on the server,
// e.g., when app/page.tsx imports EVChargingSimulation.
// This will cause an additional simulation run for 20 CPs for validation purposes.

/**
 * Runs a simulation for Task 1 parameters and logs the results along with hint validation.
 */
function runAndLogTask1Validation() {
  console.log('\n--- Running lib/simulation/index.ts Task 1 Validation ---')

  const numChargepointsTask1 = 20
  const seedTask1 = DEFAULT_SIMULATION_SEED // Ensure this is imported or accessible

  console.log(`[VALIDATION] Simulating Task 1: ${numChargepointsTask1} CPs, Seed: ${seedTask1}, Full Year.`)

  // We run this validation with verbose: false to keep the console clean,
  // focusing on the final summary statistics relevant to Task 1.
  const simOptions: SimulationOptions = { seed: seedTask1, verbose: false }
  const simulation = new EVChargingSimulation(numChargepointsTask1, simOptions)
  const stats = simulation.run() // stats is of type SimulationStatistics

  const theoreticalMaxPowerDemandKw = numChargepointsTask1 * POWER_PER_CHARGEPOINT_KW // Ensure POWER_PER_CHARGEPOINT_KW is imported or accessible
  const concurrencyFactor =
    theoreticalMaxPowerDemandKw > 0 ? (stats.actualMaxPowerDemandKw / theoreticalMaxPowerDemandKw) * 100 : 0

  console.log(`[VALIDATION] Task 1 Results from lib/simulation/index.ts:`)
  console.log(`  Total Energy Consumed: ${stats.totalEnergyConsumedKwh.toFixed(2)} kWh`)
  console.log(`  Theoretical Max Power Demand: ${theoreticalMaxPowerDemandKw.toFixed(2)} kW`)
  console.log(`  Actual Max Power Demand: ${stats.actualMaxPowerDemandKw.toFixed(2)} kW`)
  console.log(`  Concurrency Factor: ${concurrencyFactor.toFixed(2)}%`)

  // Hints from Task 1 description
  const HINTS_TASK_1 = {
    actualMaxPower: { min: 77, max: 121 }, // kW
    concurrencyFactor: { min: 35, max: 55 }, // %
  }

  const isActualMaxPowerInHintRange =
    stats.actualMaxPowerDemandKw >= HINTS_TASK_1.actualMaxPower.min &&
    stats.actualMaxPowerDemandKw <= HINTS_TASK_1.actualMaxPower.max
  const isConcurrencyInHintRange =
    concurrencyFactor >= HINTS_TASK_1.concurrencyFactor.min && concurrencyFactor <= HINTS_TASK_1.concurrencyFactor.max

  console.log(`[VALIDATION] Hint Checks for Task 1 (Note: Hints were based on the *original* T1/T2 dataset):`)
  console.log(
    `  Actual Max Power (${stats.actualMaxPowerDemandKw.toFixed(2)} kW) vs. original hint range [${
      HINTS_TASK_1.actualMaxPower.min
    }-${HINTS_TASK_1.actualMaxPower.max} kW]: ${isActualMaxPowerInHintRange ? 'Matches Original Hint' : 'Differs from Original Hint'}`,
  )
  console.log(
    `  Concurrency Factor (${concurrencyFactor.toFixed(2)}%) vs. original hint range [${
      HINTS_TASK_1.concurrencyFactor.min
    }-${HINTS_TASK_1.concurrencyFactor.max}%]: ${isConcurrencyInHintRange ? 'Matches Original Hint' : 'Differs from Original Hint'}`,
  )
  console.log(
    `[VALIDATION] The simulation is now using the NEW T1/T2 dataset. Results will differ from original expectations.`,
  )
  console.log('--- End of lib/simulation/index.ts Task 1 Validation ---\n')
}

// Automatically run the validation when the module is loaded server-side.
runAndLogTask1Validation()
