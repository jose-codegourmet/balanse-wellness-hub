import { COACH_RATE_TYPES, EMAIL_FORMAT_RE, FIELD_CONSTRAINTS } from "@balanse/domain";
import { z } from "zod";

const specialtiesRule = z
  .array(z.string().trim().min(1).max(FIELD_CONSTRAINTS.coach.specialties.itemMax))
  .max(FIELD_CONSTRAINTS.coach.specialties.maxItems)
  .default([]);

function refineActiveSpecialties(
  values: { active: boolean; specialties: string[] },
  ctx: z.RefinementCtx,
) {
  // Spec-derived FE rule. FIELD_CONSTRAINTS.coach.specialties.required === false.
  // 07-coach-management.md requires ≥1 specialty when the coach is active.
  // BE-051 has not adopted this conditional rule yet.
  if (values.active && values.specialties.length < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["specialties"],
      message: "Add at least one specialty for an active coach.",
      params: { validationCode: "required" },
    });
  }
}

const coachPublicFields = {
  name: z.string().trim().min(1, "Enter a coach name.").max(FIELD_CONSTRAINTS.coach.name.max),
  specialties: specialtiesRule,
  // Optional in the editor; the API stores "" when empty.
  shortBio: z.string().trim().max(FIELD_CONSTRAINTS.coach.shortBio.max).default(""),
  photoKey: z.string().nullable().default(null),
  active: z.boolean(),
};

/** Public profile only — rate fields must stay out of the DOM for non-admins. */
export const coachPublicFormSchema = z
  .object(coachPublicFields)
  .superRefine(refineActiveSpecialties);

export const coachFormSchema = z
  .object({
    ...coachPublicFields,
    /** Mock field name. Integer pesos — not `defaultRate` / `php_decimal`. */
    defaultRatePhp: z.coerce.number().int().min(FIELD_CONSTRAINTS.coach.defaultRate.min),
    rateType: z.enum(COACH_RATE_TYPES),
  })
  .superRefine(refineActiveSpecialties);

export type CoachPublicFormValues = z.infer<typeof coachPublicFormSchema>;
export type CoachFormValues = z.infer<typeof coachFormSchema>;

/**
 * New coaches only: a coach is always one staff member. Pick an existing staff
 * member without a coach profile, or invite a new one (Coach role pre-selected).
 */
export const coachStaffSourceSchema = z
  .object({
    staffSource: z.enum(["existing", "invite"]),
    staffId: z.string().trim().nullable(),
    inviteName: z.string().trim().max(FIELD_CONSTRAINTS.staff.name.max),
    inviteEmail: z.string().trim().max(120),
    inviteRoleId: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.staffSource === "existing") {
      if (!values.staffId) {
        ctx.addIssue({ code: "custom", path: ["staffId"], message: "Choose a staff member." });
      }
      return;
    }
    if (!values.inviteName) {
      ctx.addIssue({ code: "custom", path: ["inviteName"], message: "Enter their name." });
    }
    if (!EMAIL_FORMAT_RE.test(values.inviteEmail)) {
      ctx.addIssue({ code: "custom", path: ["inviteEmail"], message: "Enter a valid email." });
    }
    if (!values.inviteRoleId) {
      ctx.addIssue({ code: "custom", path: ["inviteRoleId"], message: "Select a role." });
    }
  });

export const coachNewFormSchema = z.intersection(coachFormSchema, coachStaffSourceSchema);
export const coachNewPublicFormSchema = z.intersection(
  coachPublicFormSchema,
  coachStaffSourceSchema,
);

export type CoachStaffSourceValues = z.infer<typeof coachStaffSourceSchema>;
export type CoachNewFormValues = z.infer<typeof coachNewFormSchema>;
export type CoachNewPublicFormValues = z.infer<typeof coachNewPublicFormSchema>;
