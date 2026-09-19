"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import {
  BarChartIcon,
  ChevronDownIcon,
  CodeIcon,
  FileTextIcon,
  GlobeIcon,
  HandshakeIcon,
  HelpCircleIcon,
  LayersIcon,
  LeafIcon,
  type LucideIcon,
  PlugIcon,
  RotateCcwIcon,
  ShieldIcon,
  StarIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { useJkPortalContainer } from "@/components/jabkit/lib/portal-container";
import type {
  NavigationMenuBackdropProps,
  NavigationMenuContentProps,
  NavigationMenuDisclosureProps,
  NavigationMenuGridCardProps,
  NavigationMenuIconName,
  NavigationMenuIconProps,
  NavigationMenuItemProps,
  NavigationMenuLargeItemProps,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuMobileItemProps,
  NavigationMenuPopupProps,
  NavigationMenuPortalProps,
  NavigationMenuPositionerProps,
  NavigationMenuProps,
  NavigationMenuSmallItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
} from "./NavigationMenu.types";

const namedIcons: Record<NavigationMenuIconName, LucideIcon> = {
  "bar-chart": BarChartIcon,
  code: CodeIcon,
  "file-text": FileTextIcon,
  globe: GlobeIcon,
  handshake: HandshakeIcon,
  "help-circle": HelpCircleIcon,
  layers: LayersIcon,
  leaf: LeafIcon,
  plug: PlugIcon,
  "rotate-ccw": RotateCcwIcon,
  shield: ShieldIcon,
  star: StarIcon,
  "user-plus": UserPlusIcon,
  users: UsersIcon,
  wallet: WalletIcon,
};

function LinkIcon({
  name,
  className,
}: {
  name?: NavigationMenuIconName;
  className?: string;
}) {
  if (!name) return null;
  const Icon = namedIcons[name];
  return <Icon aria-hidden="true" className={className} />;
}

export const navigationMenuTriggerClassName =
  "group inline-flex h-9 w-max items-center justify-center gap-1 rounded-[--radius] bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-accent data-popup-open:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

function NavigationMenu({
  className,
  children,
  viewport = true,
  container,
  ...props
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "relative isolate z-10 flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      data-slot="navigation-menu"
      {...props}
    >
      {children}
      {viewport ? <NavigationMenuViewport container={container} /> : null}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      data-slot="navigation-menu-list"
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      data-slot="navigation-menu-item"
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerClassName, className)}
      data-slot="navigation-menu-trigger"
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="relative top-px size-3.5 opacity-70 transition-transform duration-200 group-data-popup-open:rotate-180 motion-reduce:transition-none"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn("h-full w-auto outline-none", className)}
      data-slot="navigation-menu-content"
      {...props}
    />
  );
}

function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex items-center gap-2 rounded-[--radius] text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
}

function NavigationMenuIcon({ className, ...props }: NavigationMenuIconProps) {
  return (
    <NavigationMenuPrimitive.Icon
      className={cn("inline-flex", className)}
      data-slot="navigation-menu-icon"
      {...props}
    />
  );
}

function NavigationMenuPortal({
  container,
  ...props
}: NavigationMenuPortalProps) {
  const portalContainer = useJkPortalContainer(container);
  return (
    <NavigationMenuPrimitive.Portal
      container={portalContainer ?? undefined}
      data-slot="navigation-menu-portal"
      {...props}
    />
  );
}

function NavigationMenuBackdrop({
  className,
  ...props
}: NavigationMenuBackdropProps) {
  return (
    <NavigationMenuPrimitive.Backdrop
      className={cn(
        "fixed inset-0 isolate z-40 bg-foreground/5 duration-100 motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      data-slot="navigation-menu-backdrop"
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  className,
  sideOffset = 8,
  ...props
}: NavigationMenuPositionerProps) {
  return (
    <NavigationMenuPrimitive.Positioner
      className={cn("isolate z-50 outline-none", className)}
      collisionPadding={{ top: 8, bottom: 8, left: 16, right: 16 }}
      data-slot="navigation-menu-positioner"
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function NavigationMenuPopup({
  className,
  ...props
}: NavigationMenuPopupProps) {
  return (
    <NavigationMenuPrimitive.Popup
      className={cn(
        "relative h-[var(--popup-height)] w-[min(var(--popup-width),calc(100vw-2rem))] origin-(--transform-origin) overflow-hidden rounded-[--radius] bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none motion-reduce:transition-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      data-slot="navigation-menu-popup"
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  container,
  ...props
}: NavigationMenuViewportProps) {
  return (
    <NavigationMenuPortal container={container}>
      <NavigationMenuPositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <NavigationMenuPopup className={className} {...props}>
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPopup>
      </NavigationMenuPositioner>
    </NavigationMenuPortal>
  );
}

function NavigationMenuGridCard({
  link,
  className,
  ...props
}: NavigationMenuGridCardProps) {
  return (
    <NavigationMenuLink
      className={cn(
        "flex h-full min-h-32 flex-col items-start gap-3 rounded-[--radius] border border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      href={link.href}
      {...props}
    >
      {link.icon ? (
        <span className="flex size-10 items-center justify-center rounded-[--radius] bg-muted text-foreground">
          <LinkIcon className="size-5" name={link.icon} />
        </span>
      ) : null}
      <span className="flex flex-col gap-1">
        <span className="font-medium">{link.title}</span>
        {link.description ? (
          <span className="text-sm text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
    </NavigationMenuLink>
  );
}

function NavigationMenuSmallItem({
  item,
  href,
  className,
  ...props
}: NavigationMenuSmallItemProps) {
  return (
    <NavigationMenuLink
      className={cn("gap-2 px-2 py-1.5", className)}
      href={href ?? item.href}
      {...props}
    >
      <LinkIcon className="size-4 text-muted-foreground" name={item.icon} />
      <span>{item.title}</span>
    </NavigationMenuLink>
  );
}

function NavigationMenuLargeItem({
  link,
  href,
  className,
  ...props
}: NavigationMenuLargeItemProps) {
  return (
    <NavigationMenuLink
      className={cn("items-start gap-3 px-2 py-2", className)}
      href={href ?? link.href}
      {...props}
    >
      {link.icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
          <LinkIcon className="size-4" name={link.icon} />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{link.title}</span>
        {link.description ? (
          <span className="text-sm text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
    </NavigationMenuLink>
  );
}

function NavigationMenuMobileItem({
  item,
  href,
  className,
  ...props
}: NavigationMenuMobileItemProps) {
  return (
    <NavigationMenuLink
      className={cn(
        "w-full items-start gap-3 rounded-[--radius] px-2 py-2",
        className,
      )}
      href={href ?? item.href}
      {...props}
    >
      {item.icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
          <LinkIcon className="size-4" name={item.icon} />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{item.title}</span>
        {item.description ? (
          <span className="text-sm text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </span>
    </NavigationMenuLink>
  );
}

function NavigationMenuDisclosure({
  title,
  defaultOpen = false,
  children,
  className,
  ...props
}: NavigationMenuDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn("border-b border-border", className)}
      data-slot="navigation-menu-disclosure"
      {...props}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium text-foreground"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {title}
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="pb-3" id={panelId}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuBackdrop,
  NavigationMenuContent,
  NavigationMenuDisclosure,
  NavigationMenuGridCard,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLargeItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuMobileItem,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuSmallItem,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};
