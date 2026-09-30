"use client";

import { Button, Label, Textarea } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { cancellationFormDefaultValues } from "./CancellationForm.defaults";
import { type CancellationFormValues, cancellationFormSchema } from "./CancellationForm.schema";

export function CancellationForm({
  backHref,
  submitting,
  onSubmit,
}: {
  backHref: string;
  submitting: boolean;
  onSubmit: (reason: string) => void;
}) {
  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: cancellationFormDefaultValues,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(({ reason }) => onSubmit(reason.trim()))}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="cancel-reason">Reason (optional)</Label>
        <Textarea id="cancel-reason" {...form.register("reason")} disabled={submitting} />
      </div>
      <div className="cancellation-form-actions">
        <Button
          variant="secondary"
          nativeButton={false}
          render={<Link href={backHref} />}
          disabled={submitting}
        >
          Back to booking
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Submit cancellation request"
          )}
        </Button>
      </div>
    </form>
  );
}
