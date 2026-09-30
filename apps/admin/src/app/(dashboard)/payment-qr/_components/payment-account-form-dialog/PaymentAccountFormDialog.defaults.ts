import type { PaymentQrCode } from "@balanse/domain";
import type { PaymentAccountFormValues } from "./PaymentAccountFormDialog.schema";

export const paymentAccountFormDefaultValues: PaymentAccountFormValues = {
  type: "GCASH",
  label: "",
  accountName: "",
  accountNumber: "",
  imageKey: null,
  isActive: true,
};

export function paymentAccountFormValuesFrom(account: PaymentQrCode): PaymentAccountFormValues {
  return {
    type: account.type,
    label: account.label,
    accountName: account.accountName,
    accountNumber: account.accountNumber,
    imageKey: account.imageKey,
    isActive: account.isActive,
  };
}
