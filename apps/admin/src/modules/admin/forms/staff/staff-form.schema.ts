import { EMAIL_FORMAT_RE, FIELD_CONSTRAINTS } from "@balanse/domain";
import { z } from "zod";

export const staffFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a staff name.").max(FIELD_CONSTRAINTS.staff.name.max),
    email: z
      .string()
      .trim()
      .min(1, "Enter an email.")
      .max(120)
      .regex(EMAIL_FORMAT_RE, "Enter a valid email."),
    roleId: z.string().trim().min(1, "Select a role."),
    status: z.enum(["active", "disabled"]),
    isCoach: z.boolean(),
    coachId: z.string().trim().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.isCoach && !values.coachId) {
      ctx.addIssue({
        code: "custom",
        path: ["coachId"],
        message: "Select the linked coach profile.",
      });
    }
  });

export type StaffFormValues = z.infer<typeof staffFormSchema>;
