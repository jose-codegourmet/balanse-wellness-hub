import type { Radio as RadioPrimitive } from "@base-ui/react/radio";
import type { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { z } from "zod";

export const radioGroupSchema = z.string();
export type RadioGroupValues = z.infer<typeof radioGroupSchema>;

export type RadioGroupProps = RadioGroupPrimitive.Props & {
  invalid?: boolean;
};
export type RadioGroupItemProps = RadioPrimitive.Root.Props;
