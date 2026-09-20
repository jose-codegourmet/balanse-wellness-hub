import type { BadgeProps } from "./Badge.schema";

export type CountBadgeProps = Omit<BadgeProps, "children"> & {
  count: number;
  max?: number;
};
