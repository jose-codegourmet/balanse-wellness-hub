import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";

export type DialogProps = DialogPrimitive.Root.Props;
export type DialogTriggerProps = DialogPrimitive.Trigger.Props;
export type DialogPortalProps = DialogPrimitive.Portal.Props;
export type DialogCloseProps = DialogPrimitive.Close.Props;
export type DialogOverlayProps = DialogPrimitive.Backdrop.Props;
export type DialogTitleProps = DialogPrimitive.Title.Props;
export type DialogDescriptionProps = DialogPrimitive.Description.Props;
export type DialogHeaderProps = ComponentProps<"div">;

export type DialogContentProps = DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
};

export type DialogFooterProps = ComponentProps<"div"> & {
  showCloseButton?: boolean;
};
