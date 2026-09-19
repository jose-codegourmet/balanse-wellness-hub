"use client";

import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  HistoryIcon,
  InboxIcon,
  MapIcon,
  PanelLeftIcon,
  PieChartIcon,
  Settings2Icon,
  SquareTerminalIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import { type ComponentType, useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";
import { Button } from "@/components/jabkit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { Separator } from "@/components/jabkit/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/jabkit/tooltip/Tooltip";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  ApplicationShell1IconName,
  ApplicationShell1NavItem,
  ApplicationShell1Props,
} from "./ApplicationShell1.types";

const ICONS: Record<
  ApplicationShell1IconName,
  ComponentType<{ className?: string }>
> = {
  studio: SquareTerminalIcon,
  models: BotIcon,
  docs: BookOpenIcon,
  settings: Settings2Icon,
  history: HistoryIcon,
  star: StarIcon,
  design: FrameIcon,
  sales: PieChartIcon,
  travel: MapIcon,
  inbox: InboxIcon,
  people: UsersIcon,
  billing: CreditCardIcon,
};

const DEFAULT_LOGO = {
  name: "Northline",
  href: "#home",
  plan: "Workspace",
} as const;

const DEFAULT_USER = {
  name: "Mara Chen",
  email: "mara@northline.app",
};

const DEFAULT_ACTIONS = [
  { id: "account", label: "Account", href: "#account" },
  { id: "billing", label: "Billing", href: "#billing" },
  { id: "logout", label: "Log out", href: "#logout", destructive: true },
];

const DEFAULT_GROUPS: NonNullable<ApplicationShell1Props["groups"]> = [
  {
    id: "product",
    label: "Product",
    items: [
      {
        id: "studio",
        label: "Studio",
        icon: "studio",
        children: [
          { id: "drafts", label: "Drafts", href: "#drafts" },
          { id: "starred", label: "Starred", href: "#starred" },
        ],
      },
      { id: "models", label: "Models", href: "#models", icon: "models" },
    ],
  },
];

const DEFAULT_BREADCRUMBS = [
  { label: "Studio", href: "#studio" },
  { label: "Drafts" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavIcon({ name }: { name: ApplicationShell1IconName }) {
  const Icon = ICONS[name];
  return <Icon className="size-4 shrink-0" />;
}

function itemIsActive(
  item: ApplicationShell1NavItem,
  activeId?: string,
): boolean {
  if (!activeId) return false;
  if (item.id === activeId) return true;
  return Boolean(item.children?.some((child) => child.id === activeId));
}

export function ApplicationShell1({
  className,
  logo = DEFAULT_LOGO,
  groups = DEFAULT_GROUPS,
  breadcrumbs = DEFAULT_BREADCRUMBS,
  user = DEFAULT_USER,
  userActions = DEFAULT_ACTIONS,
  activeId,
  defaultCollapsed = false,
  defaultOpenIds,
  children,
  ...props
}: ApplicationShell1Props) {
  const headingId = useId();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [openIds, setOpenIds] = useState<string[]>(() => {
    if (defaultOpenIds) return defaultOpenIds;
    return groups.flatMap((group) =>
      group.items
        .filter((item) => item.children?.length)
        .slice(0, 1)
        .map((item) => item.id),
    );
  });

  const toggleOpen = (id: string) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const logoHref = logo.href ?? "#home";

  return (
    <TooltipProvider>
      <section
        data-slot="application-shell1"
        aria-labelledby={headingId}
        className={cn(
          "flex min-h-[100dvh] w-full bg-background text-foreground",
          className,
        )}
        {...props}
      >
        <h1 id={headingId} className="sr-only">
          {logo.name}
        </h1>
        <aside
          data-collapsed={collapsed ? "true" : "false"}
          className={cn(
            "flex shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-200 ease-out",
            collapsed ? "w-14" : "w-64",
          )}
        >
          <div
            className={cn(
              "flex h-14 items-center border-b border-border",
              collapsed ? "justify-center px-2" : "gap-2 px-3",
            )}
          >
            <a
              href={logoHref}
              className="flex min-w-0 items-center gap-2 rounded-[calc(var(--radius)-4px)] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-[calc(var(--radius)-6px)] bg-foreground text-background"
              >
                <GalleryVerticalEndIcon className="size-4" />
              </span>
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {logo.name}
                  </span>
                  {logo.plan ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {logo.plan}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </a>
          </div>

          <nav
            aria-label="Primary"
            className="flex flex-1 flex-col gap-4 overflow-y-auto p-2"
          >
            {groups.map((group) => (
              <div key={group.id} className="grid gap-1">
                {!collapsed ? (
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => {
                  const hasChildren = Boolean(item.children?.length);
                  const open = openIds.includes(item.id);
                  const active = itemIsActive(item, activeId);
                  const href = item.href ?? item.children?.[0]?.href ?? "#";

                  const row = (
                    <span
                      className={cn(
                        "flex w-full items-center rounded-[calc(var(--radius)-6px)] text-sm",
                        collapsed ? "justify-center p-2" : "gap-2 px-2 py-1.5",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <NavIcon name={item.icon} />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">
                            {item.label}
                          </span>
                          {hasChildren ? (
                            <ChevronRightIcon
                              className={cn(
                                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                open && "rotate-90",
                              )}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </span>
                  );

                  const trigger =
                    hasChildren && !collapsed ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`${item.id}-submenu`}
                        onClick={() => toggleOpen(item.id)}
                        className="w-full rounded-[calc(var(--radius)-6px)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {row}
                      </button>
                    ) : (
                      <a
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className="block rounded-[calc(var(--radius)-6px)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {row}
                      </a>
                    );

                  return (
                    <div key={item.id}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger render={<span className="block" />}>
                            {trigger}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        trigger
                      )}
                      {hasChildren && open && !collapsed ? (
                        <ul
                          id={`${item.id}-submenu`}
                          className="mt-1 grid gap-0.5 border-l border-border ml-4 pl-2"
                        >
                          {item.children?.map((child) => {
                            const childActive = activeId === child.id;
                            return (
                              <li key={child.id}>
                                <a
                                  href={child.href}
                                  aria-current={
                                    childActive ? "page" : undefined
                                  }
                                  className={cn(
                                    "block rounded-[calc(var(--radius)-6px)] px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    childActive
                                      ? "bg-accent text-accent-foreground"
                                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                  )}
                                >
                                  {child.label}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          <div
            className={cn(
              "mt-auto border-t border-border p-2",
              collapsed && "flex justify-center",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center rounded-[calc(var(--radius)-6px)] text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed ? "justify-center p-1" : "gap-2 p-1.5",
                    )}
                  >
                    <Avatar size="sm">
                      {user.avatarSrc ? (
                        <AvatarImage src={user.avatarSrc} alt="" />
                      ) : null}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    {!collapsed ? (
                      <>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                        <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
                      </>
                    ) : null}
                  </button>
                }
              />
              <DropdownMenuContent
                side={collapsed ? "right" : "top"}
                align="start"
                className="min-w-56"
              >
                <DropdownMenuLabel>
                  <span className="block text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="block text-xs font-normal">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userActions.map((action) =>
                  action.href ? (
                    <DropdownMenuItem
                      key={action.id}
                      variant={action.destructive ? "destructive" : "default"}
                      render={<a href={action.href}>{action.label}</a>}
                    />
                  ) : (
                    <DropdownMenuItem
                      key={action.id}
                      variant={action.destructive ? "destructive" : "default"}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 px-0"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeftIcon className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-4 w-px" />
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const last = index === breadcrumbs.length - 1;
                  return (
                    <li
                      key={crumb.href ?? crumb.label}
                      className="flex items-center gap-1.5"
                    >
                      {index > 0 ? (
                        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                      ) : null}
                      {crumb.href && !last ? (
                        <a
                          href={crumb.href}
                          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="font-medium">{crumb.label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </header>
          <div className="flex flex-1 flex-col p-4">
            {children ?? (
              <div
                aria-hidden="true"
                className="min-h-[min(100%,48rem)] flex-1 rounded-[--radius] border border-dashed border-border bg-muted/40"
              />
            )}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
