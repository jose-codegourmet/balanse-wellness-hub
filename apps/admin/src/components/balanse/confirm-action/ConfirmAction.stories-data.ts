import type { ConfirmActionProps } from "./ConfirmAction.meta";

export const confirmActionDefaultValues: Partial<ConfirmActionProps> = {
  triggerLabel: "Confirm",
  title: "Confirm this action?",
  description: "This writes through the mock adapter.",
  confirmLabel: "Confirm",
  variant: "default",
  requireReason: false,
  reasonLabel: "Reason",
};
