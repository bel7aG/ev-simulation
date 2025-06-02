/**
 * statistics.ts
 * Collects simulation statistics.
 */
export class SimulationStatistics {
  public totalEnergyConsumedKwh: number = 0
  public actualMaxPowerDemandKw: number = 0

  constructor() {
    this.reset()
  }

  public reset(): void {
    this.totalEnergyConsumedKwh = 0
    this.actualMaxPowerDemandKw = 0
  }

  public recordTickData(energyThisTickKwh: number, powerDemandThisTickKw: number): void {
    this.totalEnergyConsumedKwh += energyThisTickKwh
    if (powerDemandThisTickKw > this.actualMaxPowerDemandKw) {
      this.actualMaxPowerDemandKw = powerDemandThisTickKw
    }
  }
}
