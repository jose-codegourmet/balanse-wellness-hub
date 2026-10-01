"use client";

import { Button } from "@balanse/ui";
import { LogOut } from "lucide-react";
import { useState } from "react";
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
} from "@/components/jabkit/alert-dialog";
import { cn } from "@/components/jabkit/lib/cn";

/**
 * The portal's single logout entry point (FE-CUS-018). The confirm lives here;
 * desktop opens it from the account menu, and the drawer still shows a quiet
 * trigger so logging out never competes with the nav items.
 *
 * Brand styling for the confirm dialog is applied through `portal.css`
 * classes; the vendored Jabkit `alert-dialog` stays pristine.
 */
export function BalansePortalLogout({
  initialOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: {
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const open = openProp ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  async function logOut() {
    // Ends the Supabase session server-side and clears the auth cookies.
    await fetch("/auth/sign-out", { method: "POST" }).catch(() => undefined);
    // A hard navigation drops every client cache of the signed-in session.
    window.location.assign("/login");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* A sidebar nav row, styled like its sibling links in `portal.css`
          rather than as a button. */}
      <button
        type="button"
        className={cn("portal-logout-button", className)}
        onClick={() => setOpen(true)}
      >
        <LogOut size={17} strokeWidth={1.5} aria-hidden="true" />
        <span>Log out</span>
      </button>
      <AlertDialogContent size="sm" className="portal-logout-dialog">
        <AlertDialogHeader className="portal-logout-dialog-header">
          <AlertDialogMedia className="portal-logout-dialog-media">
            <LogOut strokeWidth={1.5} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle className="portal-logout-dialog-title font-display">
            Log out?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to view your bookings and profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="portal-logout-dialog-footer">
          {/* Staying signed in is the safe choice, and being first in the DOM
              keeps it the initially focused control. */}
          <AlertDialogCancel render={<Button variant="outline">Stay signed in</Button>} />
          {/* Brand primary, not `destructive`: logging out is routine. */}
          <AlertDialogAction render={<Button>Log out</Button>} onClick={() => void logOut()} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
