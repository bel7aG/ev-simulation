/**
 * distributions.ts
 * Helper functions for working with probability distributions.
 */
import type { SeededRandom } from './random'
import type { DemandDistributionItem } from './config' // Assuming DemandDistributionItem is defined in config.ts

/**
 * Selects a random value from a weighted distribution.
 * @param {DemandDistributionItem[]} distribution - The distribution array.
 * @param {SeededRandom} randomGenerator - The seeded random number generator instance.
 * @returns {number} The selected value (km) from the distribution.
 * @throws {Error} If the distribution is empty.
 */
export function getWeightedRandomChoice(distribution: DemandDistributionItem[], randomGenerator: SeededRandom): number {
  if (!distribution || distribution.length === 0) {
    throw new Error('Distribution cannot be empty.')
  }

  const rand = randomGenerator.next()
  let cumulativeProbability = 0

  for (const item of distribution) {
    cumulativeProbability += item.probability
    if (rand < cumulativeProbability) {
      return item.value
    }
  }
  // Fallback: due to potential floating point inaccuracies or if probabilities don't sum to 1.
  return distribution[distribution.length - 1].value
}
