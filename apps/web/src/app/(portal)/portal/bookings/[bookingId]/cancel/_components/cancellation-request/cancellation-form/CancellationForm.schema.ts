import { z } from "zod";

export const cancellationFormSchema = z.object({
  reason: z.string(),
  acknowledgeCancellationPolicy: z
    .boolean()
    .refine((value) => value, "Confirm that you understand how cancellation requests work."),
});

export type CancellationFormValues = z.infer<typeof cancellationFormSchema>;
