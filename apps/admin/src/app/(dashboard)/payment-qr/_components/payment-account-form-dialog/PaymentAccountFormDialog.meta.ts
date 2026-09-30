import type { PaymentQrCode } from "@balanse/domain";

/**
 * Add or edit one payment account on /payment-qr: type (GCash, Maya, QR Ph),
 * a short name, account holder name, number, optional QR (required for QR Ph),
 * and whether customers see it at checkout.
 */
export type PaymentAccountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to add a new account. */
  account?: PaymentQrCode | null;
};

export const paymentAccountFormDialogMeta = {
  purpose: "Create or edit a payment account (QR and/or GCash / Maya / QR Ph details).",
  whenToUse: "Use from PaymentQrPage for Add account and Edit.",
  whenNotToUse: "Do not use for recording a customer's payment — that is /payments.",
} as const;
