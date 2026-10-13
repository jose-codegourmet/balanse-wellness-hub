"use client";

import type { CustomerBooking, PaymentInstructions, PolicyDocumentVersion } from "@balanse/domain";
import { bookingStatusLabel, formatPeso, PAYMENT_ACCOUNT_TYPE_META } from "@balanse/domain";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { useSubmitPaymentProof } from "@/lib/query/mutations/payments";
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
  const [file, setFile] = useState<File | null>(null);
  const form = useForm<{ proof: FileList }>({ defaultValues: { proof: undefined } });
  const submitProof = useSubmitPaymentProof(booking.customerId, booking.id);
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
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                aria-label="Choose payment proof"
                {...form.register("proof", {
                  onChange: (event) => setFile(event.target.files?.[0] ?? null),
                })}
              />
              <button
                type="button"
                disabled={!file || forceFailure}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                onClick={() => {
                  if (!file) return;
                  setStatus("submitting");
                  void submitProof
                    .mutateAsync(file)
                    .then((result) => {
                      setCurrent(result.booking);
                      setStatus("submitted");
                      notify.portal("payment.proof-submitted");
                    })
                    .catch(() => {
                      setStatus("failed");
                      notify.portal("payment.proof-failed");
                    });
                }}
              >
                Submit proof
              </button>
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
