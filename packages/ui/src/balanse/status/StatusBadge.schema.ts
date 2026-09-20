import type { CustomerStatusKey } from "@balanse/domain";

export type StatusBadgeSurface = "customer" | "admin";

export type StatusBadgeProps = {
  status: CustomerStatusKey;
  surface?: StatusBadgeSurface;
  className?: string;
};

export type StatusBadgeCellProps = {
  status: CustomerStatusKey;
};
