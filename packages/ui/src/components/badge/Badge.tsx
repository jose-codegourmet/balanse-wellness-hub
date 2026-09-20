"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border font-medium whitespace-nowrap tabular-nums leading-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        neutral: "",
        info: "",
        success: "",
        warning: "",
        danger: "",
        accent: "",
      },
      appearance: {
        solid: "",
        soft: "",
      },
      size: {
        sm: "h-5 px-2 text-xs",
        md: "h-6 px-2.5 text-sm",
      },
    },
    compoundVariants: [
      {
        variant: "neutral",
        appearance: "solid",
        class:
          "border-border bg-secondary text-secondary-foreground [a]:hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)]",
      },
      {
        variant: "info",
        appearance: "solid",
        class: "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80",
      },
      {
        variant: "success",
        appearance: "solid",
        class:
          "border-transparent bg-[color-mix(in_oklch,var(--balanse-navy)_68%,var(--balanse-tan))] text-[var(--balanse-warm-white)] [a]:hover:opacity-90",
      },
      {
        variant: "warning",
        appearance: "solid",
        class:
          "border-transparent bg-[color-mix(in_oklch,var(--balanse-gold-deep)_82%,var(--balanse-navy))] text-[var(--balanse-warm-white)] [a]:hover:opacity-90",
      },
      {
        variant: "danger",
        appearance: "solid",
        class:
          "border-transparent bg-destructive text-[var(--balanse-warm-white)] [a]:hover:bg-destructive/90",
      },
      {
        variant: "accent",
        appearance: "solid",
        class: "border-transparent bg-accent text-accent-foreground [a]:hover:bg-accent/80",
      },
      {
        variant: "neutral",
        appearance: "soft",
        class: "border-border bg-muted text-muted-foreground [a]:hover:bg-muted/80",
      },
      {
        variant: "info",
        appearance: "soft",
        class:
          "border-[color-mix(in_oklch,var(--primary),transparent_65%)] bg-[color-mix(in_oklch,var(--primary)_14%,var(--background))] text-primary [a]:hover:bg-[color-mix(in_oklch,var(--primary)_20%,var(--background))]",
      },
      {
        variant: "success",
        appearance: "soft",
        class:
          "border-[color-mix(in_oklch,var(--balanse-tan),transparent_35%)] bg-[color-mix(in_oklch,var(--balanse-tan)_32%,var(--background))] text-foreground [a]:hover:bg-[color-mix(in_oklch,var(--balanse-tan)_40%,var(--background))]",
      },
      {
        variant: "warning",
        appearance: "soft",
        class:
          "border-[color-mix(in_oklch,var(--balanse-gold-deep),transparent_45%)] bg-[color-mix(in_oklch,var(--accent)_24%,var(--background))] text-foreground [a]:hover:bg-[color-mix(in_oklch,var(--accent)_32%,var(--background))]",
      },
      {
        variant: "danger",
        appearance: "soft",
        class:
          "border-destructive/35 bg-destructive/10 text-destructive [a]:hover:bg-destructive/20 dark:bg-destructive/20",
      },
      {
        variant: "accent",
        appearance: "soft",
        class:
          "border-[color-mix(in_oklch,var(--accent),transparent_40%)] bg-[color-mix(in_oklch,var(--accent)_26%,var(--background))] text-accent-foreground [a]:hover:bg-[color-mix(in_oklch,var(--accent)_34%,var(--background))]",
      },
    ],
    defaultVariants: {
      variant: "neutral",
      appearance: "soft",
      size: "md",
    },
  },
);

function Badge({
  className,
  variant = "neutral",
  appearance = "soft",
  size = "md",
  dot = false,
  icon,
  render,
  children,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
    icon?: ReactNode;
  }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, appearance, size }), className),
        children: (
          <>
            {dot ? (
              <span
                aria-hidden="true"
                data-slot="badge-dot"
                className="size-1.5 shrink-0 rounded-full bg-current"
              />
            ) : null}
            {icon ? (
              <span data-icon="inline-start" className="inline-flex shrink-0 [&_svg]:size-3">
                {icon}
              </span>
            ) : null}
            {children}
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      appearance,
      size,
    },
  });
}

export { Badge, badgeVariants };
