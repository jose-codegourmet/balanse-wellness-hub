import { cn } from "@balanse/ui";

import type { AdminQueueCountProps } from "./AdminQueueCount.meta";

export function AdminQueueCount({ count, label, className }: AdminQueueCountProps) {
  return (
    <p
      className={cn(
        "flex items-baseline gap-2 rounded-xl border border-border/80 bg-background/70 px-4 py-2.5 shadow-xs",
        className,
      )}
    >
      <span className="text-2xl font-semibold tabular-nums">{count}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </p>
  );
}

export type { AdminQueueCountProps };
