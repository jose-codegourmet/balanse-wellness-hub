import { FIELD_CONSTRAINTS, isClassImageSource, isClassRedirectUrl } from "@balanse/domain";
import { z } from "zod";
import { classImagesInputSchema } from "@/components/balanse/class-images-input/ClassImagesInput.schema";
import { nullableInt } from "../nullable-int";

export const classFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a class name.").max(FIELD_CONSTRAINTS.class.name.max),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a page URL.")
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
    pageMode: z.enum(["standard", "redirect"]),
    customPageUrl: z.string().trim(),
    description: z.string().max(4000, "Keep the about text under 4,000 characters."),
    coachIds: z
      .array(z.string())
      .refine((ids) => new Set(ids).size === ids.length, "Choose each coach once."),
    heroImage: z
      .string()
      .refine(
        (src) => !src || isClassImageSource(src),
        "Use a local /assets/ image or an HTTPS image URL.",
      ),
    galleryImages: classImagesInputSchema,
    shortDescription: z
      .string()
      .trim()
      .min(1, "Enter a short description.")
      .max(FIELD_CONSTRAINTS.class.shortDescription.max),
    defaultDurationMinutes: nullableInt(
      FIELD_CONSTRAINTS.class.defaultDurationMinutes.min,
      FIELD_CONSTRAINTS.class.defaultDurationMinutes.max,
    ),
    /** Mock field name. Integer pesos — not `defaultCustomerPrice` / `php_decimal`. */
    defaultPricePhp: nullableInt(FIELD_CONSTRAINTS.class.defaultCustomerPrice.min),
    active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.pageMode === "redirect" && !isClassRedirectUrl(values.customPageUrl))
      ctx.addIssue({
        code: "custom",
        path: ["customPageUrl"],
        message: "Enter an HTTPS URL or local page path outside /classes/.",
      });
  });

export type ClassFormValues = z.infer<typeof classFormSchema>;
