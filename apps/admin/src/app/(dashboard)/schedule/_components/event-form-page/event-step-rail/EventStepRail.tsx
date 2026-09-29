"use client";

import { AlertCircleIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventStepRailItem, EventStepRailProps } from "./EventStepRail.meta";

export type { EventStepRailItem, EventStepStatus } from "./EventStepRail.meta";

export function EventStepRail({ steps, onSelect, className }: EventStepRailProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.status === "current"),
  );
  const current = steps[currentIndex];

  return (
    <nav aria-label="Event steps" className={cn("min-w-0", className)}>
      <div className="grid gap-3 lg:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl">{current?.title}</p>
          <p className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </p>
        </div>
        <ol className="flex gap-1.5">
          {steps.map((step, index) => (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                aria-label={`${index + 1}. ${step.title}${statusSuffix(step)}`}
                aria-current={step.status === "current" ? "step" : undefined}
                disabled={step.status === "locked"}
                onClick={() => onSelect(step.id)}
                className={cn(
                  "block h-1.5 w-full rounded-full transition-colors disabled:cursor-not-allowed",
                  step.status === "current" && "bg-primary",
                  step.status === "complete" && "bg-primary/45",
                  step.status === "error" && "bg-destructive",
                  (step.status === "upcoming" || step.status === "locked") && "bg-border",
                )}
              />
            </li>
          ))}
        </ol>
      </div>

      <ol className="hidden gap-1 lg:grid">
        {steps.map((step, index) => (
          <li key={step.id} className="relative">
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-10 bottom-[-0.25rem] left-[1.4rem] w-px",
                  step.status === "complete" ? "bg-primary/45" : "bg-border",
                )}
              />
            ) : null}
            <button
              type="button"
              aria-current={step.status === "current" ? "step" : undefined}
              disabled={step.status === "locked"}
              onClick={() => onSelect(step.id)}
              className={cn(
                "relative flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                step.status === "current"
                  ? "bg-card shadow-sm ring-1 ring-border"
                  : "hover:bg-muted/60",
                "disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              <StepMarker step={step} index={index} />
              <span className="grid min-w-0 gap-0.5 pt-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.status === "locked" || step.status === "upcoming"
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    step.status === "error" ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {step.status === "error" ? "Needs attention" : step.hint}
                </span>
              </span>
              <span className="sr-only">{statusSuffix(step)}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepMarker({ step, index }: { step: EventStepRailItem; index: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
        step.status === "current" && "border-primary bg-primary text-primary-foreground",
        step.status === "complete" && "border-primary/45 bg-primary/10 text-primary",
        step.status === "error" && "border-destructive bg-destructive/10 text-destructive",
        (step.status === "upcoming" || step.status === "locked") &&
          "border-border bg-background text-muted-foreground",
      )}
    >
      {step.status === "complete" ? (
        <CheckIcon className="size-3.5" />
      ) : step.status === "error" ? (
        <AlertCircleIcon className="size-3.5" />
      ) : (
        index + 1
      )}
    </span>
  );
}

function statusSuffix(step: EventStepRailItem): string {
  if (step.status === "complete") return " (complete)";
  if (step.status === "error") return " (has errors)";
  if (step.status === "locked") return " (not yet available)";
  return "";
}
