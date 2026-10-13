import { z } from "zod";

export const packageRequestFormSchema = z.object({
  acknowledge: z.boolean().refine((value) => value, "Please confirm before continuing."),
});

export type PackageRequestFormValues = z.infer<typeof packageRequestFormSchema>;
