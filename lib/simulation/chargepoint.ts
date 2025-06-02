/**
 * chargepoint.ts
 * Represents a single EV chargepoint in the simulation.
 */
import { TICKS_PER_HOUR, POWER_PER_CHARGEPOINT_KW } from './config'
import type { ElectricVehicle } from './ev'

export interface TickRef {
  value: number
}

export class Chargepoint {
  public id: number
  public powerKw: number
  public currentEV: ElectricVehicle | null
  private verbose: boolean
  private currentTickRef: TickRef

  constructor(id: number, verbose = false, currentTickRef: TickRef = { value: 0 }) {
    this.id = id
    this.powerKw = POWER_PER_CHARGEPOINT_KW
    this.currentEV = null
    this.verbose = verbose
    this.currentTickRef = currentTickRef
  }

  private _log(message: string): void {
    if (this.verbose) {
      // In a Next.js server component, console.log goes to the server console
      console.log(`[TICK ${this.currentTickRef.value}][CP ${this.id}] ${message}`)
    }
  }

  public isAvailable(): boolean {
    return this.currentEV === null
  }

  public assignEV(ev: ElectricVehicle): boolean {
    if (!this.isAvailable()) {
      this._log(`❌ Attempted to assign EV[${ev.id}] but chargepoint is busy with EV[${this.currentEV?.id}].`)
      return false
    }
    if (!ev || !ev.energyNeededKwh || ev.energyNeededKwh <= 0) {
      this._log(`ℹ️ Attempted to assign EV[${ev?.id}] but it needs no charge.`)
      return false
    }
    this.currentEV = ev
    this._log(`🔌 EV[${ev.id}] assigned. Needs ${ev.energyNeededKwh.toFixed(2)} kWh.`)
    return true
  }

  public processChargingTick(): number {
    if (this.isAvailable() || !this.currentEV) {
      return 0
    }
    const energyDeliverableThisTick = this.powerKw * (1 / TICKS_PER_HOUR)
    const energyDelivered = this.currentEV.charge(energyDeliverableThisTick)

    if (energyDelivered > 0) {
      this._log(
        `🔄 Charging EV[${this.currentEV.id}]: +${energyDelivered.toFixed(2)} kWh. (Total EV charge: ${this.currentEV.energyReceivedKwh.toFixed(2)}/${this.currentEV.energyNeededKwh.toFixed(2)} kWh)`,
      )
    }

    if (this.currentEV.isFullyCharged()) {
      this._log(
        `✅ EV[${this.currentEV.id}] fully charged! (${this.currentEV.energyReceivedKwh.toFixed(2)} kWh). Releasing.`,
      )
      this.releaseEV()
    }
    return energyDelivered
  }

  public releaseEV(): void {
    if (this.currentEV) {
      this.currentEV = null
    }
  }
}
