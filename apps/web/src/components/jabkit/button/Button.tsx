import { buttonVariants } from "@balanse/ui";
import { Slot } from "@radix-ui/react-slot";
// biome-ignore lint/correctness/noUnusedImports: Storybook supports the classic JSX runtime.
import * as React from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { ButtonProps } from "./Button.types";

/**
 * PATCHED (Balansé button system, 2026-09-29): Jabkit blocks render the shared
 * `@balanse/ui` editorial button styles so every button in the product matches.
 * The Jabkit API (variant / size / asChild) is unchanged. See
 * docs/ways-of-working.md → "Jabkit patches".
 */
const variantMap = {
  primary: "default",
  secondary: "outline",
  ghost: "ghost",
  destructive: "destructive",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      data-variant={variantMap[variant]}
      className={cn(buttonVariants({ variant: variantMap[variant], size }), className)}
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  );
}
