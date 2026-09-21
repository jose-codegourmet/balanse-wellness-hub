import { z } from "zod";
import type { AdminFormProps } from "./AdminForm.schema";

export const adminFormDemoSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  notes: z.string(),
});

export type AdminFormDemoValues = z.infer<typeof adminFormDemoSchema>;

export const adminFormDemoValues: AdminFormDemoValues = { name: "", notes: "" };

export const adminFormDefaultValues: Partial<AdminFormProps<AdminFormDemoValues>> = {
  schema: adminFormDemoSchema,
  defaultValues: adminFormDemoValues,
};
