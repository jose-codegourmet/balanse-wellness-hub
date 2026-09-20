import { COACH_RATE_TYPES, FIELD_CONSTRAINTS } from "@balanse/domain";
import { z } from "zod";

export const coachFormSchema = z
  .object({
    name: z.string().trim().min(1).max(FIELD_CONSTRAINTS.coach.name.max),
    specialties: z
      .array(z.string().trim().min(1).max(FIELD_CONSTRAINTS.coach.specialties.itemMax))
      .max(FIELD_CONSTRAINTS.coach.specialties.maxItems)
      .default([]),
    shortBio: z.string().trim().min(1).max(FIELD_CONSTRAINTS.coach.shortBio.max),
    photoKey: z.string().nullable().default(null),
    active: z.boolean(),
    /** Mock field name. Integer pesos — not `defaultRate` / `php_decimal`. */
    defaultRatePhp: z.coerce.number().int().min(FIELD_CONSTRAINTS.coach.defaultRate.min),
    rateType: z.enum(COACH_RATE_TYPES),
  })
  .superRefine((values, ctx) => {
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
  });

export type CoachFormValues = z.infer<typeof coachFormSchema>;
