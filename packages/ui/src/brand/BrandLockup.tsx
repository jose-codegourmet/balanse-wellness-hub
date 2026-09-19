import { cn } from "../lib/utils";

type BrandLockupProps = {
  className?: string;
  showTagline?: boolean;
  tone?: "light" | "inverse";
};

/**
 * Text lockup placeholder (FE-FND-004). The line-art wreath emblem from
 * findings.md §5 is not in-repo yet — do not invent a logo file.
 */
export function BrandLockup({ className, showTagline = true, tone = "light" }: BrandLockupProps) {
  const inverse = tone === "inverse";
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-display text-xl tracking-[0.18em]",
          inverse ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        Balansé
      </span>
      {showTagline ? (
        <span
          className={cn(
            "mt-1 text-[0.65rem] font-medium tracking-[0.28em] uppercase text-accent-foreground",
            inverse ? "text-sidebar-primary" : "text-accent",
          )}
        >
          Wellness Hub
        </span>
      ) : null}
    </span>
  );
}
