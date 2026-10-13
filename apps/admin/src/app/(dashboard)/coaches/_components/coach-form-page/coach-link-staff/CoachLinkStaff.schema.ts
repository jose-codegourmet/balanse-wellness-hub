import { z } from "zod";

export const coachLinkStaffSchema = z.object({
  staffId: z.string().trim().min(1, "Choose a staff member."),
});

export type CoachLinkStaffValues = z.infer<typeof coachLinkStaffSchema>;
