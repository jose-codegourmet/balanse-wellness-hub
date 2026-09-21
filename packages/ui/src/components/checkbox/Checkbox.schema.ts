import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import type * as React from "react";
import { z } from "zod";

export const checkboxSchema = z.boolean();
export type CheckboxValues = z.infer<typeof checkboxSchema>;

export const checkboxGroupSchema = z.array(z.string());
export type CheckboxGroupValues = z.infer<typeof checkboxGroupSchema>;

export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  invalid?: boolean;
};

export type CheckboxGroupOption = {
  value: string;
  label: string;
  leading?: React.ReactNode;
  description?: string;
  disabled?: boolean;
};

export type CheckboxGroupProps = React.ComponentProps<"div">;

export type CheckboxGroupItemProps = Omit<CheckboxProps, "id"> & {
  id?: string;
  label: React.ReactNode;
  leading?: React.ReactNode;
  description?: string;
};
