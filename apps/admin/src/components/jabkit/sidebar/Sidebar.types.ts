import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { ButtonProps } from "@/components/jabkit/button";
import type { Separator } from "@/components/jabkit/separator";
import type { TooltipContentProps } from "@/components/jabkit/tooltip";

export type SidebarSide = "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";
export type SidebarState = "expanded" | "collapsed";
export type SidebarMenuButtonVariant = "default" | "outline";
export type SidebarMenuButtonSize = "default" | "sm" | "lg";
export type SidebarMenuSubButtonSize = "sm" | "md";

export interface SidebarContextProps {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface SidebarProviderProps extends ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarProps extends ComponentProps<"div"> {
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
}

export type SidebarTriggerProps = Omit<ButtonProps, "children"> & {
  children?: ReactNode;
};

export type SidebarRailProps = ComponentProps<"button">;

export type SidebarInsetProps = ComponentProps<"main">;

export type SidebarInputProps = ComponentProps<"input">;

export type SidebarHeaderProps = ComponentProps<"div">;

export type SidebarFooterProps = ComponentProps<"div">;

export type SidebarSeparatorProps = ComponentProps<typeof Separator>;

export type SidebarContentProps = ComponentProps<"div">;

export type SidebarGroupProps = ComponentProps<"div">;

export interface SidebarGroupLabelProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export interface SidebarGroupActionProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

export type SidebarGroupContentProps = ComponentProps<"div">;

export type SidebarMenuProps = ComponentProps<"ul">;

export type SidebarMenuItemProps = ComponentProps<"li">;

export interface SidebarMenuButtonProps extends ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | TooltipContentProps;
  variant?: SidebarMenuButtonVariant;
  size?: SidebarMenuButtonSize;
}

export interface SidebarMenuActionProps extends ComponentProps<"button"> {
  asChild?: boolean;
  showOnHover?: boolean;
}

export type SidebarMenuBadgeProps = ComponentProps<"div">;

export interface SidebarMenuSkeletonProps extends ComponentProps<"div"> {
  showIcon?: boolean;
}

export type SidebarMenuSubProps = ComponentProps<"ul">;

export type SidebarMenuSubItemProps = ComponentProps<"li">;

export interface SidebarMenuSubButtonProps extends ComponentProps<"a"> {
  asChild?: boolean;
  size?: SidebarMenuSubButtonSize;
  isActive?: boolean;
}

export type SidebarStyle = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-mobile"?: string;
  "--sidebar-width-icon"?: string;
};
