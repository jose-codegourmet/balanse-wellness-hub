"use client";

import type { CustomerBooking, PaymentInstructions } from "@balanse/domain";
import { bookingStatusLabel, formatPeso } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useState } from "react";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import { notify } from "@/modules/notifications/notify";

export function GcashProofPage({
  booking,
  instructions,
  forceFailure,
  forcedStatus,
}: {
  booking: CustomerBooking;
  instructions: PaymentInstructions;
  forceFailure?: boolean;
  forcedStatus?: "submitting" | "failed" | "submitted";
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "failed" | "submitted">(
    forcedStatus ?? "idle",
  );
  const [current, setCurrent] = useState(booking);

  if (status === "submitting") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LocalizedSkeleton lines={5} label="Submitting proof" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">GCash payment</h1>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Amount</dt>
          <dd>{formatPeso(current.session.pricePhp)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>GCash name</dt>
          <dd>{instructions.gcashName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>GCash number</dt>
          <dd>{instructions.gcashNumber}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">{instructions.notes}</p>
      <p className="text-sm">
        Send the session amount, then upload a screenshot. Uploading proof does not confirm the
        booking.
      </p>

      <section>
        <h2 className="font-display text-2xl">Upload proof</h2>
        {status === "failed" ? (
          <div className="mt-4">
            <FeedbackState id="customer.proof-upload-failed" onAction={() => setStatus("idle")} />
          </div>
        ) : (
          <div className="mt-4">
            <ImageUpload
              label="Choose Image"
              fallbackLabel="Preview"
              chooseLabel="Choose Image"
              submitLabel="Submit Proof"
              forceFailure={forceFailure}
              onMockSubmit={async () => {
                setStatus("submitting");
                try {
                  const next = await getMockAdapter().uploadPaymentProof(current.id);
                  setCurrent(next);
                  setStatus("submitted");
                  notify.portal("payment.proof-submitted");
                } catch {
                  setStatus("failed");
                  notify.portal("payment.proof-failed");
                  throw new Error("Proof upload failed");
                }
              }}
            />
          </div>
        )}
      </section>

      {status === "submitted" ? (
        <p role="status" className="rounded-xl border border-border bg-card p-4 text-sm">
          Status after submit: {bookingStatusLabel(current.status)}. This is not a confirmation.
        </p>
      ) : null}
    </div>
  );
}
