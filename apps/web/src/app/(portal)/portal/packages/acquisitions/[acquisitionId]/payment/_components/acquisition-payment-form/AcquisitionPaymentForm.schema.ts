import { z } from "zod";

export const acquisitionPaymentFormSchema = z.object({
  method: z.enum(["GCASH", "PAY_AT_COUNTER"]),
  proof: z.custom<FileList>().optional(),
});

export type AcquisitionPaymentFormValues = z.infer<typeof acquisitionPaymentFormSchema>;
