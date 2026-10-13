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
  details,
  note,
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
      <Button type="button" variant={variant} disabled={disabled} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {details?.length ? (
          <dl className="grid min-w-0 gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex min-w-0 items-start justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">{detail.label}</dt>
                <dd className="min-w-0 break-all text-right font-medium">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
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
            variant={variant === "destructive" ? "destructive" : "default"}
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
