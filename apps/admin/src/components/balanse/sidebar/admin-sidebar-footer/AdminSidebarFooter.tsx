"use client";

import { roleLabel } from "@balanse/domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@balanse/ui";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/jabkit/avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { cn } from "@/components/jabkit/lib/cn";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { AdminSidebarFooterProps } from "./AdminSidebarFooter.meta";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  customer: "Customer",
  guest: "Guest",
};

export function AdminSidebarFooter({
  collapsed = false,
  onSettings,
  onLogout,
  className,
  ...props
}: AdminSidebarFooterProps) {
  const { principal, actor } = useMockPrincipal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const email = actor?.email ?? "staff@balanse.example";
  const initials = email.slice(0, 1).toUpperCase();
  const accountLabel = actor
    ? roleLabel(actor.roleKey, actor.roleName ?? undefined)
    : (ROLE_LABELS[principal.role] ?? principal.role);

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col gap-2 border-t border-sidebar-border bg-sidebar p-3",
        className,
      )}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${accountLabel}, ${email}`}
          className={cn(
            "inline-flex h-12 w-full items-center rounded-lg bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border outline-none transition-colors hover:bg-[color-mix(in_oklab,var(--sidebar-accent)_80%,var(--balanse-tan))] focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "justify-center px-0" : "gap-2 px-2",
          )}
        >
          <Avatar className="ring-1 ring-sidebar-primary/30" size="sm">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {collapsed ? null : (
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="block text-sm font-medium">{accountLabel}</span>
              <span className="block truncate text-xs text-sidebar-foreground/55">{email}</span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {onSettings ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onSettings()}>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <LogOut aria-hidden="true" strokeWidth={1.5} />
            </AlertDialogMedia>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to manage the studio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onLogout?.();
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
