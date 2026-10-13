"use client";

import type { CustomerBooking, PaymentInstructions, PolicyDocumentVersion } from "@balanse/domain";
import {
  bookingStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Button, FeedbackState } from "@balanse/ui";
import { ArrowLeft, CircleAlert, CircleX, Hourglass, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GcashPayStep } from "@/components/balanse/payment/gcash-pay-step/GcashPayStep";
import { PaymentProofForm } from "@/components/balanse/payment/payment-proof-form/PaymentProofForm";
import {
  type PaymentStep,
  PaymentStepper,
} from "@/components/balanse/payment/payment-stepper/PaymentStepper";
import { useSubmitPaymentProof } from "@/lib/query/mutations/payments";
import { useAcceptPolicies } from "@/lib/query/policies";
import { notify } from "@/modules/notifications/notify";
import { useHoldCountdown } from "../../../_hooks/use-hold-countdown";

export type GcashWizardStep = "pay" | "upload" | "review";

const STEPS: PaymentStep<GcashWizardStep>[] = [
  { id: "pay", label: "Send payment" },
  { id: "upload", label: "Upload receipt" },
  { id: "review", label: "Front desk confirms" },
];

function initialStep(booking: CustomerBooking): GcashWizardStep {
  if (booking.paymentStatus === "PROOF_SUBMITTED" || booking.status === "PAYMENT_SUBMITTED") {
    return "review";
  }
  return "pay";
}

export function GcashPaymentWizard({
  booking,
  instructions,
  policies = [],
  forcedStep,
  forcedExpired,
}: {
  booking: CustomerBooking;
  /** Null when payment details could not be loaded. */
  instructions: PaymentInstructions | null;
  /** Current versions of the policies attached to the payment_proof form. */
  policies?: PolicyDocumentVersion[];
  /** Storybook only. */
  forcedStep?: GcashWizardStep;
  /** Storybook only. */
  forcedExpired?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(booking);
  const [step, setStep] = useState<GcashWizardStep>(forcedStep ?? initialStep(booking));
  const [submitting, setSubmitting] = useState(false);
  const submitProof = useSubmitPaymentProof(booking.customerId, booking.id);
  const acceptPolicies = useAcceptPolicies(booking.customerId);
  const hold = useHoldCountdown(current, { forcedExpired });
  const { session } = current;
  const amount = formatPeso(session.pricePhp);
  const bookingHref = `/portal/bookings/${booking.id}`;
  const paymentHref = `${bookingHref}/payment`;

  if (current.status === "REJECTED" || current.status === "CANCELLED") {
    const rejected = current.status === "REJECTED";
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <section className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <CircleX aria-hidden className="size-3.5" />
            {rejected ? "Not accepted" : "Cancelled"}
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-[-0.05em]">
            {rejected ? "This booking wasn't accepted." : "This booking was cancelled."}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {rejected
              ? "The front desk couldn't accept this booking, so there's nothing to pay and the spot was released."
              : "There's nothing to pay for this booking."}
          </p>
          {rejected && current.rejectReason ? (
            <blockquote className="mt-5 border-l-2 border-[var(--balanse-gold)] pl-4 text-sm leading-6">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Note from the studio
              </span>
              <span className="mt-1 block">{current.rejectReason}</span>
            </blockquote>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/portal/schedule" />}>
              Find another class
            </Button>
            <Button variant="ghost" nativeButton={false} render={<Link href={bookingHref} />}>
              View booking
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (current.entitlementId) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <section className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Ticket aria-hidden className="size-3.5" />
            Package applied
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-[-0.05em]">Nothing to pay here.</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {current.packageName ?? "Your package"} covers this session. The front desk still
            confirms your spot.
          </p>
          <Button className="mt-7" nativeButton={false} render={<Link href={bookingHref} />}>
            Back to booking
          </Button>
        </section>
      </div>
    );
  }

  if (current.status === "CONFIRMED" || current.status === "CHECKED_IN") {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <section className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <ShieldCheck aria-hidden className="size-3.5" />
            {bookingStatusLabel(current.status)}
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-[-0.05em]">You’re all set.</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The front desk has confirmed your spot. There is nothing more to pay.
          </p>
          <Button className="mt-7" nativeButton={false} render={<Link href={bookingHref} />}>
            View booking
          </Button>
        </section>
      </div>
    );
  }

  if (step !== "review" && current.status !== "PAYMENT_SUBMITTED" && hold.expired) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <FeedbackState
          id="customer.reservation-expired"
          onAction={() => router.push("/portal/schedule")}
        />
      </div>
    );
  }

  const submit = (file: File, acceptedPolicyVersionIds: string[]) => {
    setSubmitting(true);
    void submitProof
      .mutateAsync(file)
      .then(async (result) => {
        if (acceptedPolicyVersionIds.length > 0) {
          await acceptPolicies.mutateAsync({
            form: "payment_proof",
            policyVersionIds: acceptedPolicyVersionIds,
            bookingId: booking.id,
          });
        }
        // The upload response omits the customer id and name; keep the ones we already have.
        setCurrent({
          ...result.booking,
          customerId: booking.customerId,
          customerName: booking.customerName,
        });
        setStep("review");
        notify.portal("payment.proof-submitted");
        router.refresh();
      })
      .catch(() => notify.portal("payment.proof-failed"))
      .finally(() => setSubmitting(false));
  };

  const rejected = current.paymentStatus === "REJECTED";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <Link
        href={step === "review" ? bookingHref : paymentHref}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        {step === "review" ? "Back to booking" : "Change payment method"}
      </Link>

      <header className="mt-5 grid gap-5 rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
            Pay with GCash
          </p>
          <h1 className="font-display mt-3 text-3xl tracking-[-0.05em] sm:text-4xl">
            {sessionDisplayName(session)}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/74">
            {formatSessionDate(session.startsAt)} ·{" "}
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
            Amount due
          </p>
          <p className="font-display mt-1 text-3xl tracking-[-0.03em]">{amount}</p>
          {step !== "review" && hold.deadlineLabel ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-foreground/74">
              <Hourglass aria-hidden className="size-3.5" />
              {hold.remainingLabel ?? "Held"} · until {hold.deadlineLabel}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-8">
        <PaymentStepper steps={STEPS} current={step} />
      </div>

      <section className="mt-8 min-w-0 rounded-[1.5rem] border border-border bg-card p-5 sm:p-8">
        {rejected && step !== "review" ? (
          <Alert className="mb-6" data-advisory="instruction">
            <CircleAlert aria-hidden />
            <AlertTitle>Your last receipt wasn’t accepted</AlertTitle>
            <AlertDescription>
              {current.rejectReason
                ? `The front desk said: “${current.rejectReason}”`
                : "The front desk couldn’t verify it."}{" "}
              Your spot is still held. Send the payment again if needed, then upload a clear
              screenshot.
            </AlertDescription>
          </Alert>
        ) : null}

        {step === "pay" ? (
          <GcashPayStep
            instructions={instructions}
            amountLabel={amount}
            counterHref={paymentHref}
            onSent={() => setStep("upload")}
          />
        ) : null}

        {step === "upload" ? (
          <PaymentProofForm
            amountLabel={amount}
            policies={policies}
            submitting={submitting}
            onBack={() => setStep("pay")}
            onSubmit={submit}
          />
        ) : null}

        {step === "review" ? (
          <div className="grid gap-6">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-secondary"
            >
              <Hourglass className="size-5" />
            </span>
            <div role="status">
              <h2 className="font-display text-3xl tracking-[-0.04em]">
                Receipt sent. The front desk is checking it.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your booking shows{" "}
                <strong className="font-semibold text-foreground">
                  {bookingStatusLabel(current.status)}
                </strong>{" "}
                until they confirm it. Sending a receipt doesn’t confirm the booking by itself. You
                can close this page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 max-sm:[&>*]:w-full">
              <Button size="lg" nativeButton={false} render={<Link href={bookingHref} />}>
                View booking
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep("upload")}>
                Upload a different screenshot
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
