/**
 * ev.ts
 * Represents an Electric Vehicle (EV) in the simulation.
 */

export class ElectricVehicle {
  public id: number
  public energyNeededKwh: number
  public energyReceivedKwh: number

  constructor(id: number, energyNeededKwh: number) {
    this.id = id
    this.energyNeededKwh = energyNeededKwh
    this.energyReceivedKwh = 0
  }

  public charge(energyKwh: number): number {
    const energyCanReceive = this.energyNeededKwh - this.energyReceivedKwh
    const actualEnergyReceived = Math.min(energyKwh, energyCanReceive)
    this.energyReceivedKwh += actualEnergyReceived
    return actualEnergyReceived
  }

  public isFullyCharged(): boolean {
    return this.energyReceivedKwh >= this.energyNeededKwh - 0.0001
  }
}
