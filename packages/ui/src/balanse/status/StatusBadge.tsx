import type { CustomerStatusKey } from "@balanse/domain";
import { customerStatusLabel, isRawStatusToken } from "@balanse/domain";
import {
  Ban,
  CircleAlert,
  CircleCheck,
  Clock3,
  Hourglass,
  Receipt,
  RefreshCw,
  ShieldAlert,
  Undo2,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import { Badge } from "../../components/badge/Badge";
import { cn } from "../../lib/utils";
import type { StatusBadgeCellProps, StatusBadgeProps } from "./StatusBadge.schema";

export type {
  StatusBadgeCellProps,
  StatusBadgeProps,
  StatusBadgeSurface,
} from "./StatusBadge.schema";

const STATUS_MARK: Record<
  CustomerStatusKey,
  {
    variant: "neutral" | "info" | "success" | "warning" | "danger";
    icon: typeof Clock3;
    strike?: boolean;
  }
> = {
  CONFIRMED: { variant: "success", icon: CircleCheck },
  CHECKED_IN: { variant: "success", icon: UserCheck },
  COMPLETED: { variant: "success", icon: CircleCheck },
  REFUNDED: { variant: "success", icon: Receipt },
  HELD_AWAITING_PAYMENT: { variant: "warning", icon: Wallet },
  PAYMENT_SUBMITTED: { variant: "warning", icon: Hourglass },
  REFUND_PENDING: { variant: "warning", icon: Receipt },
  WAITLISTED: { variant: "info", icon: Clock3 },
  CANCELLATION_REQUESTED: { variant: "info", icon: Undo2 },
  RESCHEDULE_REQUESTED: { variant: "info", icon: RefreshCw },
  REJECTED: { variant: "danger", icon: Ban, strike: true },
  NO_SHOW: { variant: "danger", icon: ShieldAlert, strike: true },
  CANCELLED: { variant: "neutral", icon: XCircle, strike: true },
  EXPIRED: { variant: "neutral", icon: CircleAlert, strike: true },
};

export function StatusBadge({ status, surface = "customer", className }: StatusBadgeProps) {
  const label = customerStatusLabel(status);
  if (isRawStatusToken(label)) {
    throw new Error("Raw status enum must never reach the DOM");
  }
  const mark = STATUS_MARK[status];
  const Icon = mark.icon;

  return (
    <Badge
      variant={mark.variant}
      appearance={surface === "admin" ? "solid" : "soft"}
      size={surface === "admin" ? "sm" : "md"}
      icon={<Icon aria-hidden="true" />}
      data-status-surface={surface}
      className={cn(mark.strike && "line-through decoration-2", className)}
    >
      {label}
    </Badge>
  );
}

export function StatusBadgeCell({ status }: StatusBadgeCellProps) {
  return (
    <td className="px-3 py-2">
      <StatusBadge status={status} surface="admin" />
    </td>
  );
}
