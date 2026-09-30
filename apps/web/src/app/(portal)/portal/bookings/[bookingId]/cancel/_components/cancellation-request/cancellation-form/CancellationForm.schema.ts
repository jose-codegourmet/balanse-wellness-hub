import { z } from "zod";

export const cancellationFormSchema = z.object({
  reason: z.string(),
});

export type CancellationFormValues = z.infer<typeof cancellationFormSchema>;
