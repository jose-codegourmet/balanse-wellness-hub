import type { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ComponentProps } from "react";
import type { ButtonProps } from "@/components/jabkit/button";

export type AlertDialogProps = AlertDialogPrimitive.Root.Props;
export type AlertDialogTriggerProps = AlertDialogPrimitive.Trigger.Props;
export type AlertDialogPortalProps = AlertDialogPrimitive.Portal.Props;
export type AlertDialogOverlayProps = AlertDialogPrimitive.Backdrop.Props;
export type AlertDialogTitleProps = AlertDialogPrimitive.Title.Props;
export type AlertDialogDescriptionProps =
  AlertDialogPrimitive.Description.Props;
export type AlertDialogHeaderProps = ComponentProps<"div">;
export type AlertDialogFooterProps = ComponentProps<"div">;
export type AlertDialogMediaProps = ComponentProps<"div">;

export type AlertDialogContentSize = "default" | "sm";

export type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props & {
  size?: AlertDialogContentSize;
};

export type AlertDialogActionProps = AlertDialogPrimitive.Close.Props &
  Pick<ButtonProps, "variant" | "size">;

export type AlertDialogCancelProps = AlertDialogPrimitive.Close.Props &
  Pick<ButtonProps, "variant" | "size">;
