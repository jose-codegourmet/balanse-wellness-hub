import type * as React from "react";
import { z } from "zod";

export const nativeSelectSchema = z.string();
export type NativeSelectValues = z.infer<typeof nativeSelectSchema>;

export type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default" | "md" | "lg";
  invalid?: boolean;
};
export type NativeSelectOptionProps = React.ComponentProps<"option">;
export type NativeSelectOptGroupProps = React.ComponentProps<"optgroup">;
