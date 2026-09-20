<<<<<<< HEAD
import type * as React from "react";

export type SkeletonVariant = "text" | "heading" | "circle" | "rect" | "block";

export type SkeletonProps = React.ComponentProps<"div"> & {
  variant?: SkeletonVariant;
  lines?: number;
  aspect?: string | number;
};
=======
export type { SkeletonProps } from "./Skeleton";
>>>>>>> 801691e (fix(ui): align skeleton shells to real calendar, dashboard, and detail layouts)
