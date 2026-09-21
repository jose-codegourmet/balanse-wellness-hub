"use client";

import { Button, Label, Textarea } from "@balanse/ui";
import { useState } from "react";

export function CancellationForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(reason);
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="cancel-reason">Reason (optional)</Label>
        <Textarea
          id="cancel-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={submitting}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        Submit Request
      </Button>
    </form>
  );
}
