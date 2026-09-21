import type { Combobox as ComboboxPrimitive } from "@base-ui/react";
import type * as React from "react";
import { z } from "zod";

export const comboboxSchema = z.string();
export type ComboboxValues = z.infer<typeof comboboxSchema>;

export type ComboboxProps = ComboboxPrimitive.Root.Props<string>;

export type ComboboxInputProps = ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  leading?: React.ReactNode;
};

export type ComboboxItemProps = ComboboxPrimitive.Item.Props & {
  leading?: React.ReactNode;
  description?: string;
};
