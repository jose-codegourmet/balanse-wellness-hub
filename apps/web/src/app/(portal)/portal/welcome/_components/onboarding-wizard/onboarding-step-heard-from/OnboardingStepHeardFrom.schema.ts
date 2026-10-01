import { HEARD_FROM_SOURCES, ONBOARDING_OTHER_MAX } from "@balanse/domain";
import { z } from "zod";

export const onboardingStepHeardFromSchema = z
  .object({
    heardFrom: z
      .enum(HEARD_FROM_SOURCES)
      .nullable()
      .refine((value) => Boolean(value), "Choose one option."),
    heardFromOther: z
      .string()
      .trim()
      .max(ONBOARDING_OTHER_MAX, `Keep it under ${ONBOARDING_OTHER_MAX} characters.`),
  })
  .superRefine((values, ctx) => {
    if (values.heardFrom === "OTHER" && !values.heardFromOther) {
      ctx.addIssue({
        code: "custom",
        path: ["heardFromOther"],
        message: "Tell us where you heard about us.",
      });
    }
  });

export type OnboardingStepHeardFromValues = z.infer<typeof onboardingStepHeardFromSchema>;
