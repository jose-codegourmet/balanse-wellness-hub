import { EXPERIENCE_LEVELS, FITNESS_GOALS, ONBOARDING_OTHER_MAX } from "@balanse/domain";
import { z } from "zod";

export const onboardingStepGoalsSchema = z
  .object({
    goals: z.array(z.enum(FITNESS_GOALS)).min(1, "Pick at least one goal."),
    goalsOther: z
      .string()
      .trim()
      .max(ONBOARDING_OTHER_MAX, `Keep it under ${ONBOARDING_OTHER_MAX} characters.`),
    experienceLevel: z
      .enum(EXPERIENCE_LEVELS)
      .nullable()
      .refine((value) => Boolean(value), "Choose the option closest to you."),
  })
  .superRefine((values, ctx) => {
    if (values.goals.includes("OTHER") && !values.goalsOther) {
      ctx.addIssue({ code: "custom", path: ["goalsOther"], message: "Tell us your other goal." });
    }
  });

export type OnboardingStepGoalsValues = z.infer<typeof onboardingStepGoalsSchema>;
