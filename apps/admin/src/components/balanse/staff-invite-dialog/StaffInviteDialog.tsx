"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@balanse/ui";
import { useId, useState } from "react";
import type { StaffInviteDialogProps } from "./StaffInviteDialog.meta";

export function StaffInviteDialog({
  staffName,
  inviteUrl,
  kind = "invite",
  onClose,
}: StaffInviteDialogProps) {
  const id = useId();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const isReset = kind === "reset";
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inviteUrl
              ? isReset
                ? "Copy the password reset link"
                : "Copy the link to invite the staff"
              : "Staff member added"}
          </DialogTitle>
          <DialogDescription>
            {inviteUrl
              ? isReset
                ? `Share this private link only with ${staffName}. Whoever has the link can choose a new password for this account. Copying it does not change the current password or send email.`
                : `Share this private link with ${staffName}. They will use it to set their password. No invitation email has been sent.`
              : `${staffName} already has a confirmed Auth account. If they do not have a password they can use, copy a link from the Reset password cell in the staff table. No email has been sent.`}
          </DialogDescription>
        </DialogHeader>
        {inviteUrl ? (
          <div className="grid gap-3">
            <Label htmlFor={id}>
              {isReset ? "Private password reset link" : "Private invite link"}
            </Label>
            <Input id={id} readOnly value={inviteUrl} onFocus={(event) => event.target.select()} />
            <p className="text-sm text-muted-foreground">
              This link expires and can only be accepted once. Share it only with this staff member.
              If it expires, create a fresh link from the staff table.
            </p>
            <p role="status" className="text-sm">
              {error ||
                (copied
                  ? `${isReset ? "Password reset" : "Invite"} link copied to clipboard.`
                  : "")}
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          {inviteUrl ? (
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteUrl);
                  setCopied(true);
                  setError("");
                } catch {
                  setError(
                    "Clipboard access is unavailable. Select the link above and copy it manually.",
                  );
                }
              }}
            >
              {copied ? "Copy again" : isReset ? "Copy reset link" : "Copy invite link"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
