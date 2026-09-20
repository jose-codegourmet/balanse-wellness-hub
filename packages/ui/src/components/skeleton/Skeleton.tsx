import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";
import type { SkeletonProps } from "./Skeleton.schema";

const skeletonVariants = cva("motion-safe:animate-pulse rounded-md bg-muted", {
  variants: {
    variant: {
      text: "h-4 w-full",
      heading: "h-7 w-3/5",
      circle: "size-12 shrink-0 rounded-full",
      rect: "w-full",
      block: "h-24 w-full",
    },
  },
});

const TEXT_LINE_KEYS = ["one", "two", "three", "four", "five", "six", "seven", "eight"] as const;

function Skeleton({ className, variant, lines = 1, aspect, style, ...props }: SkeletonProps) {
  const aspectStyle =
    variant === "rect" && aspect != null ? { aspectRatio: String(aspect), ...style } : style;

  if (variant === "text" && lines > 1) {
    const count = Math.min(Math.max(lines, 1), TEXT_LINE_KEYS.length);
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {TEXT_LINE_KEYS.slice(0, count).map((lineKey, index) => (
          <div
            key={lineKey}
            data-slot="skeleton"
            className={cn(skeletonVariants({ variant }), index === count - 1 && "w-3/5")}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      style={aspectStyle}
      {...props}
    />
  );
}

export type { SkeletonProps };
export { Skeleton, skeletonVariants };
