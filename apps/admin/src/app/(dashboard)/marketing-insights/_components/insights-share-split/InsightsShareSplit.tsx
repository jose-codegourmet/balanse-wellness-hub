import { formatRatioPercent } from "@balanse/domain";
import type { InsightsShareSegment, InsightsShareSplitProps } from "./InsightsShareSplit.meta";

export type { InsightsShareSegment, InsightsShareSplitProps } from "./InsightsShareSplit.meta";

const SEGMENT_FILL: Record<InsightsShareSegment["key"], string> = {
  customer: "var(--chart-1)",
  studio: "var(--chart-3)",
  none: "var(--muted-foreground)",
};

export function InsightsShareSplit({ segments, total }: InsightsShareSplitProps) {
  const percent = (count: number) => (total > 0 ? formatRatioPercent(count / total) : "0%");
  const summary = segments
    .map((segment) => `${segment.label}: ${segment.count} (${percent(segment.count)})`)
    .join(", ");

  return (
    <div className="mt-5 grid gap-3 border-t border-border/70 pt-4">
      <p className="text-xs font-medium text-muted-foreground">
        Customer referrals vs studio marketing
      </p>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Share of sign-ups. ${summary}`}
      >
        {segments.map((segment) =>
          segment.count > 0 ? (
            <span
              key={segment.key}
              className="h-full"
              style={{
                width: `${(segment.count / Math.max(total, 1)) * 100}%`,
                background: SEGMENT_FILL[segment.key],
                opacity: segment.key === "none" ? 0.35 : 1,
              }}
            />
          ) : null,
        )}
      </div>
      <ul className="grid gap-1.5 text-sm sm:grid-cols-3">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center justify-between gap-3 sm:block">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  background: SEGMENT_FILL[segment.key],
                  opacity: segment.key === "none" ? 0.35 : 1,
                }}
              />
              {segment.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums sm:mt-0.5 sm:block sm:pl-4.5">
              {segment.count} · {percent(segment.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
