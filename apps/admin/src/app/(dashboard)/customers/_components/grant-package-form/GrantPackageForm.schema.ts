import { z } from "zod";

export const grantPackageFormSchema = z.object({
  bundleId: z.string().min(1, "Choose a published package."),
  note: z.string().trim().min(1, "Add an internal audit note.").max(500),
  overrideLimit: z.boolean(),
});

export type GrantPackageFormValues = z.infer<typeof grantPackageFormSchema>;
