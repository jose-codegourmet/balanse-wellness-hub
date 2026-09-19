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

export function ProfileLogoutButton() {
  const { setPrincipal } = useMockPrincipal();
  const [open, setOpen] = useState(false);

  function logOut() {
    setPrincipal({ role: "guest" });
    window.location.assign("/login");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        className="profile-logout-button"
        onClick={() => setOpen(true)}
      >
        <LogOut size={16} aria-hidden="true" />
        Log out
      </Button>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOut aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to view your bookings and profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="secondary">Stay signed in</Button>} />
          <AlertDialogAction
            render={<Button variant="destructive">Log out</Button>}
            onClick={logOut}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
