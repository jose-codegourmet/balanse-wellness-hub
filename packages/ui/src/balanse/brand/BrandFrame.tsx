import { cn } from "../../lib/utils";

export type BrandFrameTone = "cream" | "navy";

/**
 * On-brand fill for an image slot whose art has not landed yet. It is a finished
 * surface, not a stub: cream/navy ground, gold rule work, and the Balansé mark.
 * Never render slot ids, approval status, or "awaiting art" copy here — the
 * public pages must read as complete while the Assets track catches up.
 */
export function BrandFrame({
  tone = "cream",
  label,
  caption,
  className,
  decorative = false,
}: {
  tone?: BrandFrameTone;
  label?: string;
  caption?: string;
  className?: string;
  decorative?: boolean;
}) {
  const navy = tone === "navy";
  return (
    <div
      role={decorative ? "presentation" : undefined}
      aria-hidden={decorative ? true : undefined}
      data-slot="brand-frame"
      data-tone={tone}
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden",
        navy
          ? "bg-[radial-gradient(120%_120%_at_20%_0%,color-mix(in_oklab,var(--balanse-navy)_86%,var(--balanse-gold)),var(--balanse-navy))]"
          : "bg-[radial-gradient(120%_120%_at_20%_0%,var(--balanse-warm-white),var(--balanse-beige))]",
        className,
      )}
    >
      <BrandFrameMark
        className={cn(
          "absolute -right-[12%] -bottom-[28%] w-[70%] opacity-25",
          navy ? "text-accent" : "text-[var(--balanse-tan)]",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-3 rounded-[inherit] border",
          navy ? "border-accent/30" : "border-[var(--balanse-tan)]/50",
        )}
      />
      <span className="relative flex flex-col items-center gap-1 px-4 text-center">
        <BrandFrameMark
          className={cn("w-10", navy ? "text-accent" : "text-[var(--balanse-gold-deep)]")}
        />
        <span
          className={cn(
            "font-display text-lg tracking-[0.2em]",
            navy ? "text-[var(--balanse-warm-white)]" : "text-foreground",
          )}
        >
          Balansé
        </span>
        {label ? (
          <span
            className={cn(
              "text-[0.6rem] font-medium uppercase tracking-[0.3em]",
              navy ? "text-accent" : "text-[var(--balanse-gold-deep)]",
            )}
          >
            {label}
          </span>
        ) : null}
        {caption ? (
          <span
            className={cn(
              "max-w-[22ch] text-xs",
              navy ? "text-[var(--balanse-beige)]" : "text-muted-foreground",
            )}
          >
            {caption}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Open laurel arc from the Balansé wordmark treatment. */
function BrandFrameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <title>Balansé mark</title>
      <path
        d="M32 6c-10 6-16 15-16 26s6 20 16 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 6c10 6 16 15 16 26s-6 20-16 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 32h48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.5" fill="currentColor" />
    </svg>
  );
}
