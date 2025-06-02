/**
 * @file app/page.tsx
 * @description Main dashboard page for the EV Charging Simulation application.
 * This client component handles user interactions for running simulations,
 * displaying results, and managing application state related to the dashboard.
 * Results are shown only after the first manual simulation run.
 */
'use client'

import { useState, useTransition, useRef } from 'react'
import { toast as sonnerToast } from 'sonner'
import { isEqual } from 'lodash-es'

import { SimulationForm } from '@/components/simulation/simulation-form'
import { SimulationResultsDisplay } from '@/components/simulation/simulation-results-display'
import { Header } from '@/components/layout/header'

import type { SimulationInputParameters, SimulationOutputResults } from './actions'
import { runSimulationAction } from './actions'

/**
 * DashboardPage component.
 * This is the main page where users interact with the simulation.
 * It manages simulation inputs, triggers simulation runs, and displays results.
 * @returns {JSX.Element} The main dashboard page UI.
 */
export default function DashboardPage() {
  const [simulationResults, setSimulationResults] = useState<SimulationOutputResults | null>(null)
  const [isSubmitting, startTransition] = useTransition()
  const lastSubmittedParamsRef = useRef<SimulationInputParameters | null>(null)

  const defaultInputs: SimulationInputParameters = {
    numChargepoints: 20,
    arrivalMultiplier: 100,
    carConsumptionKwh100km: 18,
    chargepointPowerKw: 11,
  }

  // The useEffect for initial run has been REMOVED.
  // The useEffect for storing lastSubmittedParamsRef.current after results are available is fine.
  // It will only run after the first manual submission populates simulationResults.
  // useEffect(() => {
  //   if (simulationResults && !lastSubmittedParamsRef.current) {
  //     lastSubmittedParamsRef.current = simulationResults.inputsUsed;
  //   }
  // }, [simulationResults]);

  const handleRunSimulation = async (values: SimulationInputParameters): Promise<void> => {
    // No 'isInitialRun' parameter needed anymore for this function here
    if (lastSubmittedParamsRef.current && isEqual(values, lastSubmittedParamsRef.current)) {
      sonnerToast.info('No Changes Detected', {
        description: 'Simulation parameters are the same as the last run. Results remain unchanged.',
        duration: 2000,
      })
      return
    }

    startTransition(async () => {
      try {
        const results = await runSimulationAction(values)
        setSimulationResults(results) // This will trigger the animation inside SimulationResultsDisplay
        lastSubmittedParamsRef.current = values
        sonnerToast.success('Simulation Complete', {
          description: `Successfully ran simulation for ${values.numChargepoints} chargepoints.`,
          duration: 3000,
        })
      } catch (error) {
        console.error('Simulation error:', error)
        sonnerToast.error('Simulation Failed', {
          description: 'An error occurred while running the simulation. Check console for details.',
        })
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex w-full flex-1 flex-col gap-20 px-4 py-24 md:flex-row md:gap-6 md:py-28">
        <div className="w-full md:w-[320px] md:flex-shrink-0 lg:w-[360px]">
          <SimulationForm
            onSubmit={handleRunSimulation}
            isSubmitting={isSubmitting}
            initialValues={defaultInputs}
            className="md:sticky md:top-[calc(3.5rem+1.5rem)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <SimulationResultsDisplay results={simulationResults} />
        </div>
      </main>
    </div>
  )
}
