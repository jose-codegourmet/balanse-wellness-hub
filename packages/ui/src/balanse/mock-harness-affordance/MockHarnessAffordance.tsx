"use client";

import { FlaskConical } from "lucide-react";

import { cn } from "../../lib/utils";
import type { MockHarnessAffordanceProps } from "./MockHarnessAffordance.schema";

function MockHarnessAffordance({ className, panelId, ...props }: MockHarnessAffordanceProps) {
  return (
    <button
      type="button"
      aria-expanded={false}
      aria-controls={panelId}
      aria-label="Expand mock session harness"
      title="Expand mock session harness"
      className={cn(
        "fixed top-1/2 right-0 z-50 flex size-11 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-accent/50 bg-accent/40 text-accent-foreground opacity-60 shadow-sm",
        "motion-safe:transition-[opacity,background-color] motion-safe:duration-200",
        "hover:bg-accent hover:opacity-100",
        "focus-visible:bg-accent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:bg-accent active:opacity-100",
        className,
      )}
      {...props}
    >
      <FlaskConical className="size-5" aria-hidden="true" />
    </button>
  );
}

export type { MockHarnessAffordanceProps };
export { MockHarnessAffordance };
