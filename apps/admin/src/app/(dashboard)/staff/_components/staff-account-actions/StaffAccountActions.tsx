"use client";

import { createStaffInvite, createStaffPasswordReset } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { Button } from "@balanse/ui";
import { ChevronDown, Copy, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { StaffInviteDialog } from "@/components/balanse/staff-invite-dialog/StaffInviteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { notify } from "@/modules/notifications/notify";
import type { StaffAccountActionsProps } from "./StaffAccountActions.meta";

export function StaffAccountActions({ staffId, staffName, disabled }: StaffAccountActionsProps) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ inviteUrl: string; kind: "invite" | "reset" } | null>(null);
  async function copyLink(kind: "invite" | "reset") {
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    setBusy(true);
    const label = kind === "invite" ? "Invite" : "Password reset";
    try {
      const inviteUrl =
        kind === "invite"
          ? (await createStaffInvite(apiFetchBrowser, staffId)).inviteUrl
          : (await createStaffPasswordReset(apiFetchBrowser, staffId)).resetUrl;
      try {
        await navigator.clipboard.writeText(inviteUrl);
        notify.success({
          title: `${label} link copied`,
          description: `Share it privately with ${staffName}. No email was sent.`,
        });
      } catch {
        setLink({ inviteUrl, kind });
      }
    } catch (error) {
      notify.error({
        title: `Could not create ${label.toLowerCase()} link`,
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="grid justify-items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" disabled={busy || disabled} />}>
            {busy ? "Creating link…" : "Actions"}
            <ChevronDown aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              className="min-h-11"
              disabled={busy || disabled}
              onClick={() => void copyLink("invite")}
            >
              <Copy aria-hidden />
              Copy invite link
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-h-11"
              disabled={busy || disabled}
              onClick={() => void copyLink("reset")}
            >
              <RotateCcw aria-hidden />
              Copy password reset link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-muted-foreground">
          {disabled ? "Requires active staff access and role" : "Private links · No emails"}
        </p>
      </div>
      {link ? (
        <StaffInviteDialog {...link} staffName={staffName} onClose={() => setLink(null)} />
      ) : null}
    </>
  );
}
