/**
 * @file components/simulation/simulation-form.tsx
 * @description Form component for users to input EV charging simulation parameters.
 * Uses react-hook-form for form handling and Zod for validation.
 */
'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, RefreshCw } from 'lucide-react'
import * as z from 'zod'

import type { SimulationInputParameters } from '@/app/actions'
import { POWER_PER_CHARGEPOINT_KW, KWH_PER_100KM } from '@/lib/simulation/config'
import { cn } from '@/lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

/**
 * @const {z.ZodObject} formSchema
 * @description Zod schema for validating simulation form inputs.
 */
const formSchema = z.object({
  numChargepoints: z.coerce.number().min(1, 'Must be at least 1').max(100, 'Cannot exceed 100'),
  arrivalMultiplier: z.coerce.number().min(20, 'Must be at least 20%').max(200, 'Cannot exceed 200%'),
  carConsumptionKwh100km: z.coerce.number().min(5, 'Must be at least 5').max(50, 'Cannot exceed 50'),
  chargepointPowerKw: z.coerce.number().min(1, 'Must be at least 1').max(100, 'Cannot exceed 100'),
})

/**
 * @typedef {z.infer<typeof formSchema>} SimulationFormValues
 * @description Type inferred from the formSchema, representing the structure of form values.
 */
type SimulationFormValues = z.infer<typeof formSchema>

/**
 * @interface SimulationFormProps
 * @description Props for the SimulationForm component.
 */
interface SimulationFormProps {
  /** @type {(values: SimulationInputParameters) => Promise<void>} onSubmit - Callback function triggered on valid form submission. */
  onSubmit: (values: SimulationInputParameters) => Promise<void>
  /** @type {boolean} isSubmitting - Flag indicating if the form is currently submitting. */
  isSubmitting: boolean
  /** @type {Partial<SimulationInputParameters>} [initialValues] - Optional initial values for the form fields. */
  initialValues?: Partial<SimulationInputParameters>
  /** @type {string} [className] - Optional CSS class name for custom styling. */
  className?: string
}

/**
 * SimulationForm component.
 * Renders a form with sliders and inputs for configuring simulation parameters.
 * @param {SimulationFormProps} props - Component props.
 * @returns {JSX.Element} The simulation configuration form.
 */
export function SimulationForm({ onSubmit, isSubmitting, initialValues, className }: SimulationFormProps) {
  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numChargepoints: initialValues?.numChargepoints || 20,
      arrivalMultiplier: initialValues?.arrivalMultiplier || 100,
      carConsumptionKwh100km: initialValues?.carConsumptionKwh100km || KWH_PER_100KM,
      chargepointPowerKw: initialValues?.chargepointPowerKw || POWER_PER_CHARGEPOINT_KW,
    },
  })

  // Local state to display slider values dynamically
  const [numChargepointsVal, setNumChargepointsVal] = useState(form.getValues('numChargepoints'))
  const [arrivalMultiplierVal, setArrivalMultiplierVal] = useState(form.getValues('arrivalMultiplier'))

  /**
   * Handles form submission.
   * @param {SimulationFormValues} values - The validated form values.
   */
  const handleSubmit = (values: SimulationFormValues) => {
    onSubmit(values)
  }

  /**
   * Resets the form to its initial or default values.
   */
  const handleReset = () => {
    const resetValues = {
      numChargepoints: initialValues?.numChargepoints || 20,
      arrivalMultiplier: initialValues?.arrivalMultiplier || 100,
      carConsumptionKwh100km: initialValues?.carConsumptionKwh100km || KWH_PER_100KM,
      chargepointPowerKw: initialValues?.chargepointPowerKw || POWER_PER_CHARGEPOINT_KW,
    }
    form.reset(resetValues)
    setNumChargepointsVal(resetValues.numChargepoints)
    setArrivalMultiplierVal(resetValues.arrivalMultiplier)
  }

  return (
    <Card className={cn('border-border bg-card shadow-none', className)}>
      <CardHeader className="pb-4 pt-5">
        <CardTitle className="text-sm font-medium text-foreground/90">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="numChargepoints"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FormLabel className="text-xs text-foreground/80">Chargepoints</FormLabel>
                    <span className="text-xs text-muted-foreground">{numChargepointsVal}</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0])
                        setNumChargepointsVal(value[0])
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalMultiplier"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FormLabel className="text-xs text-foreground/80">Arrival Multiplier</FormLabel>
                    <span className="text-xs text-muted-foreground">{arrivalMultiplierVal}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={20}
                      max={200}
                      step={10}
                      defaultValue={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0])
                        setArrivalMultiplierVal(value[0])
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carConsumptionKwh100km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground/80">Avg. Car Consumption (kWh/100km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={isSubmitting}
                      className="h-8 border-border bg-input text-xs placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chargepointPowerKw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground/80">Avg. Chargepoint Power (kW)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={isSubmitting}
                      className="h-8 border-border bg-input text-xs placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-xs" />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2 pt-3">
              <Button
                variant="default"
                type="submit"
                className="h-8 w-full text-xs font-medium text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Running...
                  </>
                ) : (
                  'Run Simulation'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleReset}
                disabled={isSubmitting}
                className="h-8 w-8 border-border hover:bg-secondary/80"
                aria-label="Reset Form"
              >
                <RefreshCw className="h-3.5 w-3.5 text-secondary-foreground" />
              </Button>
            </div>
            <p className="pt-1 text-center text-xs text-muted-foreground/80">
              Core simulation uses internal defaults. UI inputs are illustrative.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
