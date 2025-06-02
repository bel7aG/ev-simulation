/**
 * random.ts
 * Seeded pseudo-random number generator for reproducible simulations.
 */

export class SeededRandom {
  private seed: number

  /**
   * Creates a new seeded random number generator.
   * @param {number} seed - The initial seed value.
   */
  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) {
      this.seed += 2147483646
    }
  }

  /**
   * Generates the next pseudo-random number as a float between 0 (inclusive) and 1 (exclusive).
   * Uses a linear congruential generator (LCG).
   * @returns {number} A pseudo-random float.
   */
  public next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  /**
   * Generates a pseudo-random integer between min (inclusive) and max (exclusive).
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value (exclusive).
   * @returns {number} A pseudo-random integer.
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }
}
