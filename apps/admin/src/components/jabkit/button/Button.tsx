import { Slot } from "@radix-ui/react-slot";
// biome-ignore lint/correctness/noUnusedImports: Storybook supports the classic JSX runtime.
import * as React from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { ButtonProps } from "./Button.types";

const styles = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--jk-shadow-control)] hover:brightness-110",
  secondary:
    "bg-secondary text-secondary-foreground border border-border hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-110",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

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
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[--radius] font-medium whitespace-nowrap transition-[transform,background-color,color,filter,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
        styles[variant],
        sizes[size],
        className,
      )}
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  );
}
