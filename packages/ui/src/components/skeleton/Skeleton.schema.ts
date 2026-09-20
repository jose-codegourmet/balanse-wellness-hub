import type * as React from "react";

export type SkeletonVariant = "text" | "heading" | "circle" | "rect" | "block";

export type SkeletonProps = React.ComponentProps<"div"> & {
  variant?: SkeletonVariant;
  lines?: number;
  aspect?: string | number;
};
