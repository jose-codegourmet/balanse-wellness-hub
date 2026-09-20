import { EMAIL_FORMAT_RE, FIELD_CONSTRAINTS, isPhMobile, isPolicyVersion } from "@balanse/domain";
import { z } from "zod";

export const policyVersionSchema = z.string().refine(isPolicyVersion, {
  message: "Use yyyy-mm.",
});

export const settingsFormSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Enter the business name.")
    .max(FIELD_CONSTRAINTS.settings.businessName.max),
  contact: z.object({
    phone: z
      .string()
      .trim()
      .min(1, "Enter a phone number.")
      .max(FIELD_CONSTRAINTS.settings["contact.phone"].max),
    address: z
      .string()
      .trim()
      .min(1, "Enter an address.")
      .max(FIELD_CONSTRAINTS.settings["contact.address"].max),
    email: z
      .string()
      .trim()
      .min(1, "Enter an email.")
      .max(FIELD_CONSTRAINTS.settings["contact.email"].max)
      .regex(EMAIL_FORMAT_RE),
  }),
  gcashName: z
    .string()
    .trim()
    .min(1, "Enter the GCash name.")
    .max(FIELD_CONSTRAINTS.settings.gcashName.max),
  gcashNumber: z.string().refine(isPhMobile, {
    message: "Enter a PH mobile number.",
    params: { validationCode: "invalid_format" },
  }),
  qrImageKey: z.string().nullable().default(null),
  about: z
    .string()
    .trim()
    .min(1, "Enter the about copy.")
    .max(FIELD_CONSTRAINTS.settings.about.max),
  faqs: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().trim().min(1).max(FIELD_CONSTRAINTS.settings.faq.question.max),
        answer: z.string().trim().min(1).max(FIELD_CONSTRAINTS.settings.faq.answer.max),
      }),
    )
    .max(FIELD_CONSTRAINTS.settings.faq.maxItems),
  /** Present for display. Read-only — exclude from the submit patch. */
  openingHours: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
