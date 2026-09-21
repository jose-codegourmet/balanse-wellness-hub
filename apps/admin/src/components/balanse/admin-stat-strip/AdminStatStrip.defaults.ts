import { CalendarDays, CreditCard, Repeat, Ticket, UserX } from "lucide-react";
import type { AdminStatStripProps } from "./AdminStatStrip.schema";

export const adminStatStripDefaultValues: AdminStatStripProps = {
  stats: [
    {
      id: "classes",
      label: "Today's Classes",
      value: "4",
      href: "/schedule",
      icon: CalendarDays,
    },
    {
      id: "payments",
      label: "Pending Payments",
      value: "3",
      href: "/payments",
      icon: CreditCard,
    },
    {
      id: "cancellations",
      label: "Cancellations",
      value: "1",
      href: "/cancellations",
      icon: UserX,
    },
    {
      id: "reschedules",
      label: "Reschedules",
      value: "2",
      href: "/reschedules",
      icon: Repeat,
    },
    {
      id: "waitlisted",
      label: "Waitlisted",
      value: "5",
      href: "/bookings?tab=waitlisted",
      icon: Ticket,
    },
  ],
};
