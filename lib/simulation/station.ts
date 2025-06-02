/**
 * station.ts
 * Manages a collection of chargepoints.
 */
import { Chargepoint, type TickRef } from './chargepoint'

export class ChargingStation {
  public chargepoints: Chargepoint[]

  constructor(numChargepoints: number, verbose = false, currentTickRef: TickRef = { value: 0 }) {
    this.chargepoints = []
    for (let i = 0; i < numChargepoints; i++) {
      this.chargepoints.push(new Chargepoint(i, verbose, currentTickRef))
    }
  }

  public findAvailableChargepoint(): Chargepoint | null {
    return this.chargepoints.find((cp) => cp.isAvailable()) || null
  }

  public getTotalChargepoints(): number {
    return this.chargepoints.length
  }
}
