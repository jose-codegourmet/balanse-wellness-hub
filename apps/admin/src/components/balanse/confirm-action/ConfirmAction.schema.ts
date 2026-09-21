export type ConfirmActionProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Optional typed reason. Present when `requireReason` is true. */
  onConfirm: (reason?: string) => unknown;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
  /** When true, confirm stays disabled until a non-empty reason is typed. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
};
