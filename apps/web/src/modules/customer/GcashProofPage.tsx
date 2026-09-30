"use client";

import type { CustomerBooking, PaymentInstructions, PolicyDocumentVersion } from "@balanse/domain";
import {
  bookingStatusLabel,
  formatPeso,
  PAYMENT_ACCOUNT_TYPE_META,
  toPolicyAcceptances,
} from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useState } from "react";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { notify } from "@/modules/notifications/notify";

export function GcashProofPage({
  booking,
  instructions,
  policies = [],
  forceFailure,
  forcedStatus,
}: {
  booking: CustomerBooking;
  instructions: PaymentInstructions;
  /** Current versions of the policies admin attached to GCash proof upload. */
  policies?: PolicyDocumentVersion[];
  forceFailure?: boolean;
  forcedStatus?: "submitting" | "failed" | "submitted";
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "failed" | "submitted">(
    forcedStatus ?? "idle",
  );
  const [current, setCurrent] = useState(booking);
  const policyAcceptance = usePolicyAcceptance(policies);

  if (status === "submitting") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LocalizedSkeleton lines={5} label="Submitting proof" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">Online payment</h1>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Amount</dt>
          <dd className="font-medium">{formatPeso(current.session.pricePhp)}</dd>
        </div>
      </dl>
      <section aria-labelledby="pay-to-heading" className="grid gap-3">
        <h2 id="pay-to-heading" className="font-display text-2xl">
          Pay to any of these
        </h2>
        {instructions.accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Online payment details are not available right now. Choose pay at the counter instead.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {instructions.accounts.map((account) => {
              const meta = PAYMENT_ACCOUNT_TYPE_META[account.type];
              return (
                <li
                  key={account.id}
                  className="grid gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <p className="flex items-center justify-between gap-2">
                    <span className="font-medium">{account.label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {meta.label}
                    </span>
                  </p>
                  {account.imageKey ? (
                    <div
                      role="img"
                      aria-label={`${meta.label} QR code for ${account.label}`}
                      className="mx-auto flex aspect-square w-full max-w-[12rem] items-center justify-center rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground"
                    >
                      Scan the studio {meta.label} QR
                    </div>
                  ) : null}
                  <dl className="grid gap-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Account name</dt>
                      <dd className="text-right">{account.accountName}</dd>
                    </div>
                    {account.accountNumber ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{meta.numberLabel}</dt>
                        <dd className="text-right tabular-nums">{account.accountNumber}</dd>
                      </div>
                    ) : null}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <p className="text-sm text-muted-foreground">{instructions.notes}</p>
      <p className="text-sm">
        Send the session amount to one account, then upload a screenshot. Uploading proof does not
        confirm the booking.
      </p>

      <section>
        <h2 className="font-display text-2xl">Upload proof</h2>
        {status === "failed" ? (
          <div className="mt-4">
            <FeedbackState id="customer.proof-upload-failed" onAction={() => setStatus("idle")} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <PolicyAcceptance {...policyAcceptance.props} title="Accept before uploading" />
            {policyAcceptance.allAccepted ? null : (
              <p className="text-sm text-muted-foreground">
                Accept each policy above to upload your proof.
              </p>
            )}
            <fieldset disabled={!policyAcceptance.allAccepted} className="contents">
              <ImageUpload
                label="Choose Image"
                fallbackLabel="Preview"
                chooseLabel="Choose Image"
                submitLabel="Submit Proof"
                forceFailure={forceFailure}
                onMockSubmit={async () => {
                  setStatus("submitting");
                  try {
                    await getMockAdapter().acceptPolicies(
                      current.customerId,
                      toPolicyAcceptances(policies, MOCK_NOW_ISO, "payment_proof"),
                    );
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
            </fieldset>
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
