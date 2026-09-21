"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Label,
  Textarea,
} from "@balanse/ui";
import { useId, useState } from "react";
import type { ConfirmActionProps } from "./ConfirmAction.meta";

export function ConfirmAction({
  triggerLabel,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "default",
  disabled,
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const trimmed = reason.trim();
  const canConfirm = !requireReason || trimmed.length > 0;

  function closeAndReset(next: boolean) {
    setOpen(next);
    if (!next) setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={closeAndReset}>
      <Button
        type="button"
        variant={variant}
        disabled={disabled}
        className="min-h-11"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireReason ? (
          <div className="grid gap-1.5">
            <Label htmlFor={reasonId}>{reasonLabel}</Label>
            <Textarea
              id={reasonId}
              value={reason}
              required
              placeholder={reasonPlaceholder}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              void onConfirm(requireReason ? trimmed : undefined);
              closeAndReset(false);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
