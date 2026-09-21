import { EMAIL_FORMAT_RE, FIELD_CONSTRAINTS, STAFF_ROLES } from "@balanse/domain";
import { z } from "zod";

export const staffFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a staff name.").max(FIELD_CONSTRAINTS.staff.name.max),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email.")
    .max(120)
    .regex(EMAIL_FORMAT_RE, "Enter a valid email."),
  role: z.enum(STAFF_ROLES),
  status: z.enum(["active", "disabled"]),
  isCoach: z.boolean(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
