import type { NeedsAttentionTileProps } from "./NeedsAttentionTile.schema";

export const needsAttentionTileDefaultValues: NeedsAttentionTileProps = {
  items: [
    {
      id: "payments",
      href: "/payments",
      title: "Payment proof → Review",
      count: 3,
      waitingLabel: "3 payments waiting",
      clearLabel: "No pending payments",
    },
    {
      id: "cancellations",
      href: "/cancellations",
      title: "Cancellation → Review",
      count: 1,
      waitingLabel: "1 request waiting",
      clearLabel: "No cancellation requests",
    },
    {
      id: "reschedules",
      href: "/reschedules",
      title: "Reschedule → Review",
      count: 2,
      waitingLabel: "2 requests waiting",
      clearLabel: "No reschedule requests",
    },
  ],
};
