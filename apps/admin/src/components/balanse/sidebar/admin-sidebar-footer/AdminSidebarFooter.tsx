"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import { roleLabel, splitFullName } from "@balanse/domain";
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
  UserAvatar,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useState } from "react";
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
import { adminStaffIdentityQuery } from "@/lib/query/queries/staff";
import { useStaffSession } from "@/modules/session/SessionProvider";
import type { AdminSidebarFooterProps } from "./AdminSidebarFooter.meta";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  customer: "Customer",
  guest: "Guest",
};

export function AdminSidebarFooter({
  collapsed = false,
  onProfile,
  onStudioSettings,
  onLogout,
  className,
  ...props
}: AdminSidebarFooterProps) {
  const { role, actor } = useStaffSession();
  const identity = useQuery(adminStaffIdentityQuery(actor, apiFetchBrowser));
  const person = identity.data ?? actor;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const email = person?.email ?? "";
  const name = person?.name?.trim() || email || "Staff account";
  const accountLabel = person
    ? roleLabel(person.roleKey, person.roleName ?? undefined)
    : (ROLE_LABELS[role] ?? role);

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
          aria-label={`${name}, ${accountLabel}. Open account menu`}
          className={cn(
            "inline-flex h-12 w-full items-center rounded-lg bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border outline-none transition-colors hover:bg-[color-mix(in_oklab,var(--sidebar-accent)_80%,var(--balanse-tan))] focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "justify-center px-0" : "gap-2 px-2",
          )}
        >
          <UserAvatar
            name={splitFullName(name)}
            avatarUrl={person?.avatarUrl}
            seed={person?.staffId}
            className="ring-1 ring-sidebar-primary/30"
          />
          {collapsed ? null : (
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-xs text-sidebar-foreground/65">
                {accountLabel}
              </span>
            </span>
          )}
          {collapsed ? null : (
            <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-sidebar-foreground/55" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="block truncate">{name}</span>
              <span className="block truncate text-xs font-normal normal-case tracking-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {onProfile || onStudioSettings ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                {onProfile ? (
                  <DropdownMenuItem onClick={() => onProfile()}>My profile</DropdownMenuItem>
                ) : null}
                {onStudioSettings ? (
                  <DropdownMenuItem onClick={() => onStudioSettings()}>
                    Studio settings
                  </DropdownMenuItem>
                ) : null}
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
