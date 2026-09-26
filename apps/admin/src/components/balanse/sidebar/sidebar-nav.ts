import type { AdminDashboardSnapshot, AdminNavItem } from "@balanse/domain";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Package,
  QrCode,
  Repeat,
  Settings,
  Ticket,
  UserRound,
  Users,
  UserX,
} from "lucide-react";

export const NAV_ICONS: Record<AdminNavItem["id"], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  events: CalendarRange,
  bookings: Ticket,
  payments: CreditCard,
  "payment-qr": QrCode,
  cancellations: UserX,
  reschedules: Repeat,
  customers: Users,
  coaches: UserRound,
  classes: Dumbbell,
  bundles: Package,
  reports: BarChart3,
  staff: Users,
  settings: Settings,
};

export const NAV_GROUPS: { label: string; ids: AdminNavItem["id"][] }[] = [
  {
    label: "Operations",
    ids: [
      "dashboard",
      "schedule",
      "events",
      "bookings",
      "payments",
      "payment-qr",
      "cancellations",
      "reschedules",
    ],
  },
  { label: "Directory", ids: ["customers", "coaches", "classes", "bundles", "staff"] },
  { label: "Studio", ids: ["reports", "settings"] },
];

export function countForItem(
  id: AdminNavItem["id"],
  snapshot: AdminDashboardSnapshot | null,
): string | undefined {
  if (!snapshot) return undefined;
  if (id === "payments" && snapshot.pendingPayments > 0) return String(snapshot.pendingPayments);
  if (id === "cancellations" && snapshot.cancellations > 0) return String(snapshot.cancellations);
  if (id === "reschedules" && snapshot.reschedules > 0) return String(snapshot.reschedules);
  if (id === "bookings" && snapshot.waitlisted > 0) return String(snapshot.waitlisted);
  return undefined;
}

export const COUNT_ARIA_NOUN: Partial<Record<AdminNavItem["id"], string>> = {
  payments: "pending payments",
  cancellations: "cancellations",
  reschedules: "reschedules",
  bookings: "waitlisted bookings",
};
