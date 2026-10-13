import { PAYMENT_METHODS, type PaymentMethod } from "@balanse/domain";
import { z } from "zod";

export const PAYMENT_METHOD_REQUIRED_MESSAGE = "Choose how you'll pay.";

export const paymentMethodFormSchema = z.object({
  method: z
    .union([z.enum(PAYMENT_METHODS), z.literal("")])
    .refine((value): value is PaymentMethod => value !== "", PAYMENT_METHOD_REQUIRED_MESSAGE),
});

export type PaymentMethodFormValues = z.input<typeof paymentMethodFormSchema>;
