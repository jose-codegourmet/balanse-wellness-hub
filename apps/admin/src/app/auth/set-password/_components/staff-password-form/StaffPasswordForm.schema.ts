import { z } from "zod";

export const staffPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use no more than 128 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });
export type StaffPasswordFormValues = z.infer<typeof staffPasswordFormSchema>;
