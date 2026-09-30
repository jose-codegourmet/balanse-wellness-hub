import { isPhMobile } from "./contracts";
import type { PaymentAccountSummary, PaymentAccountType } from "./types";

export const PAYMENT_ACCOUNT_TYPE_META: Record<
  PaymentAccountType,
  {
    label: string;
    numberLabel: string;
    numberPlaceholder: string;
    /** GCash / Maya numbers are PH mobile numbers and always required. */
    mobileNumber: boolean;
    qrRequired: boolean;
    hint: string;
  }
> = {
  GCASH: {
    label: "GCash",
    numberLabel: "GCash number",
    numberPlaceholder: "0917 123 4567",
    mobileNumber: true,
    qrRequired: false,
    hint: "Customers send to this GCash number. Add the GCash QR so they can scan instead.",
  },
  MAYA: {
    label: "Maya",
    numberLabel: "Maya number",
    numberPlaceholder: "0917 123 4567",
    mobileNumber: true,
    qrRequired: false,
    hint: "Customers send to this Maya number. Add the Maya QR so they can scan instead.",
  },
  QRPH: {
    label: "QR Ph",
    numberLabel: "Account number",
    numberPlaceholder: "Optional — e.g. bank account number",
    mobileNumber: false,
    qrRequired: true,
    hint: "A QR Ph code works with any bank or e-wallet app. Upload the QR; the account number is optional.",
  },
};

export const PAYMENT_ACCOUNT_NUMBER_MAX = 34;
const ACCOUNT_NUMBER_RE = /^[0-9 -]+$/;

/** Field errors for a payment account. Empty object when valid. */
export function validatePaymentAccount(
  input: Pick<
    PaymentAccountSummary,
    "type" | "label" | "accountName" | "accountNumber" | "imageKey"
  >,
): Partial<Record<"label" | "accountName" | "accountNumber" | "imageKey", string>> {
  const meta = PAYMENT_ACCOUNT_TYPE_META[input.type];
  const errors: Partial<Record<"label" | "accountName" | "accountNumber" | "imageKey", string>> =
    {};
  if (!input.label.trim()) errors.label = "Give this account a short name.";
  else if (input.label.trim().length > 80) errors.label = "Keep the name under 80 characters.";
  if (!input.accountName.trim()) errors.accountName = "Enter the account holder name.";
  else if (input.accountName.trim().length > 80)
    errors.accountName = "Keep the account name under 80 characters.";
  const number = input.accountNumber.trim();
  if (meta.mobileNumber) {
    if (!isPhMobile(number)) errors.accountNumber = `Enter the ${meta.label} mobile number.`;
  } else if (
    number &&
    (!ACCOUNT_NUMBER_RE.test(number) || number.length > PAYMENT_ACCOUNT_NUMBER_MAX)
  ) {
    errors.accountNumber = "Use digits, spaces, or dashes only.";
  }
  if (meta.qrRequired && !input.imageKey) errors.imageKey = "Upload the QR Ph code.";
  return errors;
}
