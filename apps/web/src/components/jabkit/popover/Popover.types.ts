import type { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";

export type PopoverProps = PopoverPrimitive.Root.Props;
export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;
export type PopoverTitleProps = PopoverPrimitive.Title.Props;
export type PopoverDescriptionProps = PopoverPrimitive.Description.Props;
export type PopoverHeaderProps = ComponentProps<"div">;

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > &
  Pick<PopoverPrimitive.Portal.Props, "container">;
