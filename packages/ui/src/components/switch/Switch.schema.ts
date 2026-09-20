import type { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { z } from "zod";

export const switchSchema = z.boolean();
export type SwitchValues = z.infer<typeof switchSchema>;

export type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "default" | "md";
  invalid?: boolean;
};
