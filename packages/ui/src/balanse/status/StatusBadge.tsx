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

export type StatusBadgeSurface = "customer" | "admin";

const STATUS_MARK: Record<
  CustomerStatusKey,
  { icon: typeof Clock3; pattern: string; abbr: string }
> = {
  WAITLISTED: { icon: Clock3, pattern: "border-dashed", abbr: "WL" },
  HELD_AWAITING_PAYMENT: { icon: Wallet, pattern: "border-dotted", abbr: "PAY" },
  PAYMENT_SUBMITTED: { icon: Hourglass, pattern: "border-dotted", abbr: "REV" },
  CONFIRMED: { icon: CircleCheck, pattern: "border-solid", abbr: "OK" },
  CANCELLATION_REQUESTED: { icon: Undo2, pattern: "border-dashed", abbr: "CXL" },
  RESCHEDULE_REQUESTED: { icon: RefreshCw, pattern: "border-dashed", abbr: "RS" },
  CANCELLED: { icon: XCircle, pattern: "line-through", abbr: "CAN" },
  REJECTED: { icon: Ban, pattern: "line-through", abbr: "NC" },
  EXPIRED: { icon: CircleAlert, pattern: "line-through", abbr: "EXP" },
  CHECKED_IN: { icon: UserCheck, pattern: "border-solid", abbr: "IN" },
  COMPLETED: { icon: CircleCheck, pattern: "border-solid", abbr: "DONE" },
  NO_SHOW: { icon: ShieldAlert, pattern: "border-double", abbr: "NS" },
  REFUND_PENDING: { icon: Receipt, pattern: "border-dotted", abbr: "RFP" },
  REFUNDED: { icon: Receipt, pattern: "border-solid", abbr: "RF" },
};

export function StatusBadge({
  status,
  surface = "customer",
  className,
}: {
  status: CustomerStatusKey;
  surface?: StatusBadgeSurface;
  className?: string;
}) {
  const label = customerStatusLabel(status);
  if (isRawStatusToken(label)) {
    throw new Error("Raw status enum must never reach the DOM");
  }
  const mark = STATUS_MARK[status];
  const Icon = mark.icon;
  return (
    <Badge
      variant="outline"
      data-status-surface={surface}
      className={cn(
        "h-auto max-w-full gap-1.5 px-2 py-1 font-medium",
        mark.pattern === "line-through" && "line-through decoration-2",
        mark.pattern !== "line-through" && mark.pattern,
        surface === "admin" && "rounded-md font-mono text-[0.7rem] tracking-wide",
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-[0.65rem] text-muted-foreground">
        {mark.abbr}
      </span>
      <Icon aria-hidden="true" className="size-3.5" />
      <span>{label}</span>
    </Badge>
  );
}

export function StatusBadgeCell({ status }: { status: CustomerStatusKey }) {
  return (
    <td className="px-3 py-2">
      <StatusBadge status={status} surface="admin" />
    </td>
  );
}
