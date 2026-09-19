// biome-ignore lint/correctness/noUnusedImports: Storybook supports the classic JSX runtime.
import * as React from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { TraffoFeatureCardProps } from "./TraffoFeatureCard.types";

const tones = {
  success:
    "bg-[color-mix(in_oklab,var(--jk-success)_46%,var(--jk-background))] text-foreground",
  warning:
    "bg-[color-mix(in_oklab,var(--jk-warning)_78%,var(--jk-background))] text-foreground",
  accent:
    "bg-[color-mix(in_oklab,var(--jk-chart-4)_52%,var(--jk-background))] text-foreground",
} as const;

export function TraffoFeatureCard({
  className,
  kicker,
  title,
  body,
  tone = "success",
  icon,
  ...props
}: TraffoFeatureCardProps) {
  return (
    <article
      data-slot="traffo-feature-card"
      className={cn(
        "flex min-h-[22rem] flex-col rounded-[24px] p-10 shadow-[0_18px_40px_color-mix(in_oklab,var(--jk-foreground)_10%,transparent)]",
        tones[tone],
        className,
      )}
      {...props}
    >
      {kicker ? (
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase opacity-70">
          {kicker}
        </p>
      ) : null}
      {title ? (
        <h3 className="mt-4 max-w-[16ch] text-[1.75rem] font-semibold tracking-tight leading-[1.2]">
          {title}
        </h3>
      ) : null}
      {body ? (
        <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-foreground/80">
          {body}
        </p>
      ) : null}
      {icon ? (
        <span
          aria-hidden="true"
          className="mt-auto grid size-12 place-items-center rounded-full bg-[color-mix(in_oklab,var(--jk-background)_42%,transparent)] [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}
    </article>
  );
}
