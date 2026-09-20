import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarDays, CreditCard, Repeat, Ticket, UserX } from "lucide-react";
import { AdminStatStrip } from "./AdminStatStrip";

const meta = {
  title: "Admin/Components/AdminStatStrip",
  component: AdminStatStrip,
  tags: ["autodocs"],
  args: {
    stats: [
      {
        id: "classes",
        label: "Today's Classes",
        value: "4",
        href: "/schedule",
        icon: CalendarDays,
        trend: "stable",
        bars: [14, 18, 16, 22, 20, 24, 19],
      },
      {
        id: "payments",
        label: "Pending Payments",
        value: "3",
        href: "/payments",
        icon: CreditCard,
        trend: "up",
        delta: "Needs review",
        bars: [10, 12, 11, 16, 18, 20, 22],
      },
      {
        id: "cancellations",
        label: "Cancellations",
        value: "1",
        href: "/cancellations",
        icon: UserX,
        trend: "down",
        bars: [20, 18, 16, 14, 12, 11, 10],
      },
      {
        id: "reschedules",
        label: "Reschedules",
        value: "2",
        href: "/reschedules",
        icon: Repeat,
        trend: "up",
        bars: [8, 10, 9, 14, 13, 16, 18],
      },
      {
        id: "waitlisted",
        label: "Waitlisted",
        value: "5",
        href: "/bookings?tab=waitlisted",
        icon: Ticket,
        trend: "stable",
        bars: [12, 12, 13, 12, 14, 13, 12],
      },
    ],
  },
} satisfies Meta<typeof AdminStatStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
