import type { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps, ReactNode } from "react";
import type { DialogProps } from "@/components/jabkit/dialog";

export type CommandProps = ComponentProps<typeof CommandPrimitive>;
export type CommandInputProps = ComponentProps<typeof CommandPrimitive.Input>;
export type CommandListProps = ComponentProps<typeof CommandPrimitive.List>;
export type CommandEmptyProps = ComponentProps<typeof CommandPrimitive.Empty>;
export type CommandGroupProps = ComponentProps<typeof CommandPrimitive.Group>;
export type CommandSeparatorProps = ComponentProps<
  typeof CommandPrimitive.Separator
>;
export type CommandItemProps = ComponentProps<typeof CommandPrimitive.Item>;
export type CommandShortcutProps = ComponentProps<"span">;

export type CommandDialogProps = Omit<DialogProps, "children"> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: ReactNode;
};
