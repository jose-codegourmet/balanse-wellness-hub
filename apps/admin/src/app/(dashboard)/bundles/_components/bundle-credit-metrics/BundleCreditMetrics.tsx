import type { BundleCreditMetrics as BundleCreditMetricsValue } from "@balanse/domain";

const TILES: { key: keyof BundleCreditMetricsValue; label: string; hint: string }[] = [
  { key: "used", label: "Used", hint: "Consumed on confirm, check-in, completion, or no-show." },
  { key: "held", label: "Held", hint: "Reserved by bookings that are not confirmed yet." },
  {
    key: "restored",
    label: "Restored",
    hint: "Returned after rejection, hold expiry, or cancellation.",
  },
  { key: "granted", label: "Granted", hint: "Credits given to customers, before any use." },
];

/** Credit totals for one package across every customer who owns it. */
export function BundleCreditMetrics({ metrics }: { metrics: BundleCreditMetricsValue }) {
  const remaining = Math.max(0, metrics.granted - metrics.used - metrics.held);
  const scale = Math.max(metrics.granted, 1);
  const segments = [
    { key: "used", value: metrics.used, className: "bg-primary", label: "Used" },
    { key: "held", value: metrics.held, className: "bg-[var(--balanse-gold)]", label: "Held" },
  ];

  return (
    <section
      aria-labelledby="bundle-credit-metrics-heading"
      className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Session credits
          </p>
          <h2 id="bundle-credit-metrics-heading" className="mt-1 font-display text-2xl">
            How this package is used
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {metrics.owners === 0
            ? "No customer owns this package yet."
            : `Across ${metrics.owners} ${metrics.owners === 1 ? "customer" : "customers"} · ${remaining} remaining`}
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-5 lg:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs font-medium text-muted-foreground">{tile.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metrics[tile.key]}</dd>
            <dd className="mt-1 text-xs leading-5 text-muted-foreground">{tile.hint}</dd>
          </div>
        ))}
      </dl>
      {metrics.granted > 0 ? (
        <div className="mt-4 grid gap-2">
          <div
            className="flex h-2 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${metrics.used} used, ${metrics.held} held, ${remaining} remaining of ${metrics.granted} granted`}
          >
            {segments.map((segment) =>
              segment.value > 0 ? (
                <span
                  key={segment.key}
                  className={segment.className}
                  style={{ width: `${(segment.value / scale) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {segments.map((segment) => (
              <span key={segment.key} className="inline-flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${segment.className}`} aria-hidden />
                {segment.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/30" aria-hidden />
              Remaining
            </span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
