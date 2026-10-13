"use client";

import type { PolicyDocumentVersion } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImageUp, RefreshCw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { paymentProofFormDefaultValues } from "./PaymentProofForm.defaults";
import {
  PAYMENT_PROOF_ACCEPT,
  type PaymentProofFormValues,
  paymentProofFormSchema,
} from "./PaymentProofForm.schema";

export function PaymentProofForm({
  amountLabel,
  policies = [],
  submitting = false,
  onBack,
  onSubmit,
}: {
  amountLabel: string;
  /** Current versions of the policies attached to the payment_proof form. */
  policies?: PolicyDocumentVersion[];
  submitting?: boolean;
  onBack: () => void;
  onSubmit: (file: File, acceptedPolicyVersionIds: string[]) => void;
}) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const policyAcceptance = usePolicyAcceptance(policies);
  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofFormSchema),
    defaultValues: paymentProofFormDefaultValues,
  });
  const proof = form.watch("proof");
  const error = form.formState.errors.proof?.message;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!proof) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proof);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proof]);

  const choose = (file: File | undefined) => {
    if (!file) return;
    form.setValue("proof", file, { shouldValidate: true });
  };

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) => {
        if (!policyAcceptance.check()) return;
        if (values.proof)
          onSubmit(
            values.proof,
            policies.map((policy) => policy.id),
          );
      })}
    >
      <div>
        <h2 className="font-display text-3xl tracking-[-0.04em]">Upload your receipt</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Take a screenshot of the GCash confirmation showing {amountLabel}, the date, and the
          reference number.
        </p>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!submitting) choose(event.dataTransfer.files?.[0]);
          }}
          data-dragging={dragging || undefined}
          data-invalid={error ? true : undefined}
          className="grid cursor-pointer place-items-center gap-3 rounded-[1.25rem] border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-foreground/30 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 data-dragging:border-primary data-dragging:bg-secondary/60 data-invalid:border-destructive sm:p-8"
        >
          <input
            id={inputId}
            type="file"
            accept={PAYMENT_PROOF_ACCEPT}
            className="sr-only"
            disabled={submitting}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
            onChange={(event) => {
              choose(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {previewUrl && proof ? (
            <>
              <img
                src={previewUrl}
                alt="Your GCash receipt screenshot"
                className="max-h-72 w-auto rounded-xl border border-border object-contain"
              />
              <span className="text-sm font-medium">{proof.name}</span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <RefreshCw aria-hidden className="size-3.5" />
                Choose a different image
              </span>
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full bg-secondary"
              >
                <ImageUp className="size-5" />
              </span>
              <span className="text-sm font-semibold">
                Drop your screenshot here, or tap to choose
              </span>
              <span id={`${inputId}-hint`} className="text-xs text-muted-foreground">
                JPG, PNG, WEBP or HEIC, up to 5 MB.
              </span>
            </>
          )}
        </label>
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      {policies.length > 0 ? (
        <PolicyAcceptance {...policyAcceptance.props} title="Before you submit" />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 max-sm:[&>*]:w-full">
        <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={submitting}>
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </Button>
        <Button type="submit" size="lg" loading={submitting}>
          {submitting ? "Uploading" : "Submit receipt"}
        </Button>
      </div>
    </form>
  );
}
