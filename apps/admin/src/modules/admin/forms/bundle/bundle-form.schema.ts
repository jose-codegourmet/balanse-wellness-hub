import { BUNDLE_STATUSES, FIELD_CONSTRAINTS } from "@balanse/domain";
import { z } from "zod";
import { nullableInt } from "../nullable-int";

const requiredInt = (min: number, max?: number, message?: string) => {
  const numberSchema =
    max === undefined
      ? z.coerce.number().int().min(min, message)
      : z.coerce.number().int().min(min, message).max(max);
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  }, numberSchema);
};

export const bundleFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a package name.").max(FIELD_CONSTRAINTS.bundle.name.max),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a unique URL.")
      .max(FIELD_CONSTRAINTS.bundle.slug.max)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
    summary: z
      .string()
      .trim()
      .min(1, "Enter a short customer summary.")
      .max(FIELD_CONSTRAINTS.bundle.summary.max),
    description: z
      .string()
      .trim()
      .min(1, "Enter a description.")
      .max(FIELD_CONSTRAINTS.bundle.description.max),
    sessionCredits: requiredInt(
      FIELD_CONSTRAINTS.bundle.sessionCredits.min,
      FIELD_CONSTRAINTS.bundle.sessionCredits.max,
      "Enter a session count greater than zero.",
    ),
    pricePhp: requiredInt(
      FIELD_CONSTRAINTS.bundle.pricePhp.min,
      undefined,
      "Enter a peso price. Zero is allowed for free packages.",
    ),
    applicabilityMode: z.enum(["all", "selected"]),
    classIds: z.array(z.string()),
    validityDays: nullableInt(
      FIELD_CONSTRAINTS.bundle.validityDays.min,
      FIELD_CONSTRAINTS.bundle.validityDays.max,
    ),
    perCustomerLimit: nullableInt(
      FIELD_CONSTRAINTS.bundle.perCustomerLimit.min,
      FIELD_CONSTRAINTS.bundle.perCustomerLimit.max,
    ),
    status: z.enum(BUNDLE_STATUSES),
  })
  .superRefine((values, ctx) => {
    if (values.applicabilityMode === "selected" && values.classIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["classIds"],
        message: "Choose at least one class, or apply the package to all active classes.",
      });
    }
  });

export type BundleFormValues = z.infer<typeof bundleFormSchema>;
