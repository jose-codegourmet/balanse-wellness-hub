import type { HTMLAttributes } from "react";

export interface StepperWithTitlesStep {
  title: string;
  description?: string;
  disabled?: boolean;
}

export interface StepperWithTitlesProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  steps: readonly StepperWithTitlesStep[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
}
