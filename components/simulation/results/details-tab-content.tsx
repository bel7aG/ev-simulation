/**
 * @file components/simulation/results/details-tab-content.tsx
 * @description Renders the content for the "Input Details" tab,
 * displaying the parameters used for the simulation run.
 */
'use client'

import type { SimulationInputParameters } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * @interface DetailsTabContentProps
 * @description Props for the DetailsTabContent component.
 */
interface DetailsTabContentProps {
  inputsUsed: SimulationInputParameters
}

/**
 * DetailsTabContent component.
 * Displays the input parameters used for the simulation.
 * @param {DetailsTabContentProps} props - Component props.
 * @returns {JSX.Element} The content for the details tab.
 */
export function DetailsTabContent({ inputsUsed }: DetailsTabContentProps) {
  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="text-base font-medium">Simulation Inputs Used</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <ul className="space-y-1.5 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Chargepoints:</span> {inputsUsed.numChargepoints}
          </li>
          <li>
            <span className="font-medium text-foreground">Arrival Multiplier:</span> {inputsUsed.arrivalMultiplier}%
          </li>
          <li>
            <span className="font-medium text-foreground">Car Consumption (UI):</span>{' '}
            {inputsUsed.carConsumptionKwh100km} kWh/100km
          </li>
          <li>
            <span className="font-medium text-foreground">Chargepoint Power (UI):</span> {inputsUsed.chargepointPowerKw}{' '}
            kW
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
