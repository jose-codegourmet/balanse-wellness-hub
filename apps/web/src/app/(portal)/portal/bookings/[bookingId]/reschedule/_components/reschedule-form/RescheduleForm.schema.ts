import { z } from "zod";

export const rescheduleFormSchema = z.object({
  targetSessionId: z.string().min(1, "Choose an available session."),
  acknowledgeReschedulePolicy: z
    .boolean()
    .refine((value) => value, "Confirm that you understand how reschedule requests work."),
});

export type RescheduleFormValues = z.infer<typeof rescheduleFormSchema>;
