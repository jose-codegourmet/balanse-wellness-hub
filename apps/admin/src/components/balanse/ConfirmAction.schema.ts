export type ConfirmActionProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => unknown;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
};
