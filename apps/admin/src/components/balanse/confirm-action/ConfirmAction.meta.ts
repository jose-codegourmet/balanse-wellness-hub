import type { ReactNode } from "react";

export type ConfirmActionDetail = {
  label: string;
  value: ReactNode;
};

export type ConfirmActionProps = {
  triggerLabel: string;
  title: string;
  description: string;
  /**
   * Structured facts shown as label/value rows below the description —
   * e.g. Amount, Customer, Reference. Use this instead of folding every
   * fact into `description`'s sentence.
   */
  details?: ConfirmActionDetail[];
  /** Small muted line below `details` (or `description`) for an audit-log stamp. */
  note?: string;
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
