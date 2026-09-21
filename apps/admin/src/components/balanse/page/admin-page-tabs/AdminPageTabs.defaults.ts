import type { AdminPageTabsProps } from "./AdminPageTabs.schema";

export const adminPageTabsDefaultValues: Partial<AdminPageTabsProps> = {
  tabs: [
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "waitlisted", label: "Waitlisted" },
    { id: "expired", label: "Expired" },
    { id: "history", label: "History" },
  ],
  value: "pending",
  mobileBehavior: "tabs",
  label: "Page sections",
};
