import type { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type { ComponentProps } from "react";

export type DrawerProps = DrawerPrimitive.Root.Props & {
  showSwipeHandle?: boolean;
};

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props;
export type DrawerPortalProps = DrawerPrimitive.Portal.Props;
export type DrawerCloseProps = DrawerPrimitive.Close.Props;
export type DrawerOverlayProps = DrawerPrimitive.Backdrop.Props;
export type DrawerContentProps = DrawerPrimitive.Popup.Props;
export type DrawerTitleProps = DrawerPrimitive.Title.Props;
export type DrawerDescriptionProps = DrawerPrimitive.Description.Props;
export type DrawerHeaderProps = ComponentProps<"div">;
export type DrawerFooterProps = ComponentProps<"div">;
export type DrawerSwipeHandleProps = ComponentProps<"div">;
