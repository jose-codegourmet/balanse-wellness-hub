"use client";

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
import { Button } from "@/components/jabkit/button";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

/**
 * The portal's single logout entry point (FE-CUS-018). It lives in the sidebar
 * footer, so the trigger is deliberately quiet: logging out is routine and
 * fully reversible, and it must not compete with the nav items.
 *
 * Brand styling for the confirm dialog is applied through `portal.css`
 * classes; the vendored Jabkit `alert-dialog` stays pristine.
 */
export function BalansePortalLogout({ initialOpen = false }: { initialOpen?: boolean }) {
  const { setPrincipal } = useMockPrincipal();
  const [open, setOpen] = useState(initialOpen);

  function logOut() {
    setPrincipal({ role: "guest" });
    // `app/(portal)/layout.tsx` reads the mock principal cookie on the server,
    // so a hard navigation keeps that guest redirect authoritative.
    window.location.assign("/login");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        className="portal-logout-button"
        onClick={() => setOpen(true)}
      >
        <LogOut size={17} strokeWidth={1.5} aria-hidden="true" />
        <span>Log out</span>
      </Button>
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
          <AlertDialogCancel render={<Button variant="secondary">Stay signed in</Button>} />
          {/* Brand primary, not `destructive`: logging out is routine. */}
          <AlertDialogAction render={<Button variant="primary">Log out</Button>} onClick={logOut} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
