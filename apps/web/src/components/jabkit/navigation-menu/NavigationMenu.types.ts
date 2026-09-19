import type { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import type { ComponentProps, ReactNode } from "react";

export type NavigationMenuIconName =
  | "bar-chart"
  | "code"
  | "file-text"
  | "globe"
  | "handshake"
  | "help-circle"
  | "layers"
  | "leaf"
  | "plug"
  | "rotate-ccw"
  | "shield"
  | "star"
  | "user-plus"
  | "users"
  | "wallet";

export type NavigationMenuProps = NavigationMenuPrimitive.Root.Props & {
  viewport?: boolean;
  container?: NavigationMenuPrimitive.Portal.Props["container"];
};

export type NavigationMenuListProps = NavigationMenuPrimitive.List.Props;
export type NavigationMenuItemProps = NavigationMenuPrimitive.Item.Props;
export type NavigationMenuTriggerProps = NavigationMenuPrimitive.Trigger.Props;
export type NavigationMenuContentProps = NavigationMenuPrimitive.Content.Props;
export type NavigationMenuLinkProps = NavigationMenuPrimitive.Link.Props;
export type NavigationMenuIconProps = NavigationMenuPrimitive.Icon.Props;
export type NavigationMenuPortalProps = NavigationMenuPrimitive.Portal.Props;
export type NavigationMenuBackdropProps =
  NavigationMenuPrimitive.Backdrop.Props;
export type NavigationMenuPopupProps = NavigationMenuPrimitive.Popup.Props;

export type NavigationMenuPositionerProps =
  NavigationMenuPrimitive.Positioner.Props;

export type NavigationMenuViewportProps = NavigationMenuPrimitive.Popup.Props &
  Pick<
    NavigationMenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > &
  Pick<NavigationMenuPrimitive.Portal.Props, "container">;

export interface NavigationMenuLinkItem {
  title: string;
  href: string;
  description?: string;
  icon?: NavigationMenuIconName;
}

export interface NavigationMenuGridCardProps
  extends Omit<NavigationMenuLinkProps, "href"> {
  link: NavigationMenuLinkItem;
}

export interface NavigationMenuSmallItemProps
  extends Omit<NavigationMenuLinkProps, "href"> {
  item: NavigationMenuLinkItem;
  href?: string;
}

export interface NavigationMenuLargeItemProps
  extends Omit<NavigationMenuLinkProps, "href"> {
  link: NavigationMenuLinkItem;
  href?: string;
}

export interface NavigationMenuMobileItemProps
  extends Omit<NavigationMenuLinkProps, "href"> {
  item: NavigationMenuLinkItem;
  href?: string;
}

export interface NavigationMenuDisclosureProps extends ComponentProps<"div"> {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}
