import type { Select as SelectPrimitive } from "@base-ui/react/select";
import type * as React from "react";
import { z } from "zod";

export const selectSchema = z.string();
export type SelectValues = z.infer<typeof selectSchema>;

export type SelectProps = SelectPrimitive.Root.Props<string>;
export type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default" | "md" | "lg";
  invalid?: boolean;
};
export type SelectValueProps = SelectPrimitive.Value.Props;
export type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >;
export type SelectItemProps = SelectPrimitive.Item.Props;
export type SelectGroupProps = SelectPrimitive.Group.Props;
export type SelectLabelProps = SelectPrimitive.GroupLabel.Props;
export type SelectSeparatorProps = SelectPrimitive.Separator.Props;
export type SelectScrollButtonProps = React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>;
