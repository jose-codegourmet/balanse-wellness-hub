import { EMAIL_FORMAT_RE } from "@balanse/domain";
import { z } from "zod";

export const adminLoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(EMAIL_FORMAT_RE, "Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;
