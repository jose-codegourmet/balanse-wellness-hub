import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { z } from "zod";

export const checkboxSchema = z.boolean();
export type CheckboxValues = z.infer<typeof checkboxSchema>;

export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  invalid?: boolean;
};
