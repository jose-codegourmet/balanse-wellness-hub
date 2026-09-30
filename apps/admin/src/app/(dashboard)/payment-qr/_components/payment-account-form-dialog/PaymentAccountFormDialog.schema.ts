import { PAYMENT_ACCOUNT_TYPES, validatePaymentAccount } from "@balanse/domain";
import { z } from "zod";

/**
 * Payment account (GCash, Maya, or QR Ph). Rules live in
 * `validatePaymentAccount` so the form and the adapter agree:
 * GCash / Maya need a PH mobile number; QR Ph needs the QR image.
 */
export const paymentAccountFormSchema = z
  .object({
    type: z.enum(PAYMENT_ACCOUNT_TYPES),
    label: z.string(),
    accountName: z.string(),
    accountNumber: z.string(),
    imageKey: z.string().nullable(),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    for (const [path, message] of Object.entries(validatePaymentAccount(values))) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  });

export type PaymentAccountFormValues = z.infer<typeof paymentAccountFormSchema>;
