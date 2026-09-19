import type { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactNode } from "react";

export type AttachmentState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";

export type AttachmentSize = "default" | "sm" | "xs";

export type AttachmentOrientation = "horizontal" | "vertical";

export type AttachmentMediaVariant = "icon" | "image";

export type AttachmentProps = ComponentProps<"div"> & {
  state?: AttachmentState;
  size?: AttachmentSize;
  orientation?: AttachmentOrientation;
};

export type AttachmentMediaProps = ComponentProps<"div"> & {
  variant?: AttachmentMediaVariant;
};

export type AttachmentContentProps = ComponentProps<"div">;

export type AttachmentTitleProps = ComponentProps<"span">;

export type AttachmentDescriptionProps = ComponentProps<"span">;

export type AttachmentActionsProps = ComponentProps<"div">;

export type AttachmentActionProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon-xs";
  asChild?: boolean;
  children: ReactNode;
};

export type AttachmentTriggerProps = useRender.ComponentProps<"button">;

export type AttachmentGroupProps = ComponentProps<"div">;
