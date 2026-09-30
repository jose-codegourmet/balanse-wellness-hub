import { z } from "zod";

export const profilePreferencesFormSchema = z.object({
  scheduleUpdates: z.boolean(),
  dailySummary: z.boolean(),
  securityAlerts: z.boolean(),
});

export type ProfilePreferencesFormValues = z.infer<typeof profilePreferencesFormSchema>;
