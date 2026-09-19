"use client";

import { CheckIcon } from "lucide-react";
// biome-ignore lint/correctness/noUnusedImports: Storybook supports the classic JSX runtime.
import * as React from "react";
import { useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { StepperWithTitlesProps } from "./StepperWithTitles.types";

export function StepperWithTitles({
  className,
  steps,
  value,
  defaultValue = 1,
  onValueChange,
  ...props
}: StepperWithTitlesProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;

  function selectStep(step: number) {
    if (steps[step - 1]?.disabled) return;
    if (value === undefined) setUncontrolled(step);
    onValueChange?.(step);
  }

  return (
    <div
      className={cn("min-w-[350px] space-y-8 text-center", className)}
      data-slot="stepper-with-titles"
      {...props}
    >
      <div
        className="group/stepper inline-flex w-full flex-row"
        data-orientation="horizontal"
        data-slot="stepper"
      >
        {steps.map((item, index) => {
          const step = index + 1;
          const state =
            step < current ? "completed" : step === current ? "active" : "inactive";
          const isLast = step === steps.length;

          return (
            <div
              className="group/step relative flex flex-1 !flex-col items-center"
              data-slot="stepper-item"
              data-state={state}
              key={`${item.title}-${step}`}
            >
              <button
                aria-current={state === "active" ? "step" : undefined}
                className={cn(
                  "inline-flex flex-col items-center gap-3 rounded outline-none",
                  "focus-visible:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
                data-slot="stepper-trigger"
                disabled={item.disabled}
                onClick={() => selectStep(step)}
                type="button"
              >
                <span
                  className={cn(
                    "relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
                    "data-[state=active]:bg-primary data-[state=completed]:bg-primary",
                    "data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
                  )}
                  data-slot="stepper-indicator"
                  data-state={state}
                >
                  <span
                    className={cn(
                      "transition-all motion-reduce:transition-none",
                      "group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0",
                    )}
                  >
                    {step}
                  </span>
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      "absolute size-4 scale-0 opacity-0 transition-all motion-reduce:transition-none",
                      "group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100",
                    )}
                  />
                </span>
                <div className="space-y-0.5 px-2">
                  <h3
                    className="text-sm font-medium"
                    data-slot="stepper-title"
                  >
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p
                      className="max-sm:hidden text-sm text-muted-foreground"
                      data-slot="stepper-description"
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </button>
              {isLast ? null : (
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 h-0.5 -translate-y-1/2 bg-muted",
                    "w-[calc(100%-1.5rem-0.25rem)] flex-none",
                    "group-data-[state=completed]/step:bg-primary",
                    "motion-reduce:transition-none motion-safe:transition-colors motion-safe:duration-200",
                  )}
                  data-slot="stepper-separator"
                />
              )}
            </div>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className="mt-2 text-xs text-muted-foreground"
        role="region"
      >
        Stepper with titles and descriptions
      </p>
    </div>
  );
}
