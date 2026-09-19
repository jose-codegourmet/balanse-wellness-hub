import { cn } from "../../lib/utils";

/**
 * Eyebrow + display title + supporting line. Public sections use this so every
 * heading carries the same gold rule and rhythm instead of a bare `<h2>`.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  id,
  align = "start",
  tone = "light",
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  align?: "start" | "center";
  tone?: "light" | "inverse";
  action?: React.ReactNode;
  className?: string;
}) {
  const inverse = tone === "inverse";
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.26em]",
              centered && "justify-center",
              inverse ? "text-accent" : "text-[var(--balanse-gold-deep)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("h-px w-6", inverse ? "bg-accent/70" : "bg-[var(--balanse-tan)]")}
            />
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={id}
          className={cn(
            "mt-3 font-display text-2xl leading-tight text-balance md:text-3xl",
            inverse ? "text-[var(--balanse-warm-white)]" : "text-foreground",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              "mt-3 text-pretty",
              inverse ? "text-[var(--balanse-beige)]" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
