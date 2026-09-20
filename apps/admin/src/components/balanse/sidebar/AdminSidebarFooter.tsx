"use client";

import { MOCK_ADMIN_CREDENTIALS } from "@balanse/domain";
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
  Button,
} from "@balanse/ui";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
import type { AdminSidebarFooterProps } from "./AdminSidebarFooter.schema";

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
  const { principal } = useMockPrincipal();
  const { resolvedTheme, setTheme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dark = resolvedTheme === "dark";
  const email = MOCK_ADMIN_CREDENTIALS[0].email;
  const initials = email.slice(0, 1).toUpperCase();
  const roleLabel = ROLE_LABELS[principal.role] ?? principal.role;

  return (
    <div className={cn("flex flex-col gap-2 p-3", className)} {...props}>
      <Button
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "h-10 w-full",
          collapsed ? "justify-center px-0" : "justify-start gap-3 px-2",
        )}
        onClick={() => setTheme(dark ? "light" : "dark")}
        type="button"
        variant="ghost"
      >
        <span className="relative size-5">
          <Sun
            className={cn(
              "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
              dark ? "scale-50 opacity-0" : "scale-100 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
              dark ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        </span>
        {collapsed ? null : <span>Dark Mode</span>}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${roleLabel}, ${email}`}
          className={cn(
            "inline-flex h-11 w-full items-center rounded-xl bg-card shadow-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
            collapsed ? "justify-center px-0" : "gap-2 px-2",
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {collapsed ? null : (
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="block text-sm">{roleLabel}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSettings?.()}>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
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
