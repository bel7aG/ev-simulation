/**
 * config.ts
 * Configuration constants and probability distributions for the EV Charging Simulation.
 */

export const POWER_PER_CHARGEPOINT_KW: number = 11
export const DAYS_IN_YEAR: number = 365 // Non-leap year
export const TICKS_PER_HOUR: number = 4 // 15-minute intervals
export const HOURS_PER_DAY: number = 24
export const TOTAL_TICKS_PER_YEAR: number = DAYS_IN_YEAR * HOURS_PER_DAY * TICKS_PER_HOUR
export const KWH_PER_100KM: number = 18

/**
 * T1: Probability of an EV arriving at an *available* chargepoint in a given hour.
 * NEW DATASET (as of user request). Original hints for Task 1 may not apply with this data.
 * Values are probabilities (0.0 to 1.0).
 * Indexed by hour of the day (0-23).
 */
export const ARRIVAL_PROBABILITY_PER_HOUR_T1: number[] = [
  0.0094, // Hour 0 (00:00 - 01:00)
  0.0094, // Hour 1 (01:00 - 02:00)
  0.0094, // Hour 2 (02:00 - 03:00)
  0.0094, // Hour 3 (03:00 - 04:00)
  0.0094, // Hour 4 (04:00 - 05:00)
  0.0094, // Hour 5 (05:00 - 06:00)
  0.0094, // Hour 6 (06:00 - 07:00)
  0.0094, // Hour 7 (07:00 - 08:00)
  0.0283, // Hour 8 (08:00 - 09:00)
  0.0283, // Hour 9 (09:00 - 10:00)
  0.0566, // Hour 10 (10:00 - 11:00)
  0.0566, // Hour 11 (11:00 - 12:00)
  0.0566, // Hour 12 (12:00 - 13:00)
  0.0755, // Hour 13 (13:00 - 14:00)
  0.0755, // Hour 14 (14:00 - 15:00)
  0.0755, // Hour 15 (15:00 - 16:00)
  0.1038, // Hour 16 (16:00 - 17:00)
  0.1038, // Hour 17 (17:00 - 18:00)
  0.1038, // Hour 18 (18:00 - 19:00)
  0.0472, // Hour 19 (19:00 - 20:00)
  0.0472, // Hour 20 (20:00 - 21:00)
  0.0472, // Hour 21 (21:00 - 22:00)
  0.0094, // Hour 22 (22:00 - 23:00)
  0.0094, // Hour 23 (23:00 - 24:00)
]

export interface DemandDistributionItem {
  value: number // km
  probability: number
}

/**
 * T2: Distribution of distance driven (km) since last charge for an arriving EV.
 * NEW DATASET (as of user request). Original hints for Task 1 may not apply with this data.
 * Includes a "None (doesn't charge)" option (value: 0 km).
 */
export const CHARGING_DEMAND_KM_DISTRIBUTION_T2: DemandDistributionItem[] = [
  { value: 0, probability: 0.3431 }, // None (doesn't charge)
  { value: 5, probability: 0.049 },
  { value: 10, probability: 0.098 },
  { value: 20, probability: 0.1176 },
  { value: 30, probability: 0.0882 },
  { value: 50, probability: 0.1176 },
  { value: 100, probability: 0.1078 },
  { value: 200, probability: 0.049 },
  { value: 300, probability: 0.0294 },
]

/**
 * Default seed for the random number generator for reproducible results.
 */
export const DEFAULT_SIMULATION_SEED: number = 12345

/**
 * Configuration for verbose logging.
 */
export interface VerboseLoggingOptions {
  defaultEnabled: boolean
  defaultMaxTicks: number
}
export const VERBOSE_LOGGING_CONFIG: VerboseLoggingOptions = {
  defaultEnabled: false,
  defaultMaxTicks: 48, // Log for 1/2 day by default if verbose is on
}
