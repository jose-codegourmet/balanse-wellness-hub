"use client";

import type {
  CustomerBooking,
  PaymentAccountSummary,
  PaymentInstructions,
  PolicyDocumentVersion,
} from "@balanse/domain";
import {
  bookingStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  PAYMENT_ACCOUNT_TYPE_META,
  sessionDisplayName,
} from "@balanse/domain";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  FeedbackState,
} from "@balanse/ui";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CircleX,
  Copy,
  Expand,
  Hourglass,
  QrCode,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubmitPaymentProof } from "@/lib/query/mutations/payments";
import { useAcceptPolicies } from "@/lib/query/policies";
import { notify } from "@/modules/notifications/notify";
import { useHoldCountdown } from "../../../_hooks/use-hold-countdown";
import { PaymentProofForm } from "./payment-proof-form/PaymentProofForm";
import "./payment-qr-lightbox.css";

export type GcashWizardStep = "pay" | "upload" | "review";

const STEPS: { id: GcashWizardStep; label: string }[] = [
  { id: "pay", label: "Send payment" },
  { id: "upload", label: "Upload receipt" },
  { id: "review", label: "Front desk confirms" },
];

/** Only render an image for something the browser can actually load. */
function qrSrc(account: PaymentAccountSummary): string | null {
  const key = account.imageKey;
  if (!key) return null;
  return /^(https?:|data:|\/)/.test(key) ? key : null;
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 break-words font-medium tabular-nums">{value}</dd>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2_000);
          });
        }}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function Stepper({ step }: { step: GcashWizardStep }) {
  const index = STEPS.findIndex((item) => item.id === step);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Payment steps">
      {STEPS.map((item, position) => {
        const state = position < index ? "done" : position === index ? "current" : "upcoming";
        return (
          <li
            key={item.id}
            aria-current={state === "current" ? "step" : undefined}
            data-state={state}
            className="group grid gap-2"
          >
            <span className="h-1 rounded-full bg-border group-data-[state=current]:bg-primary group-data-[state=done]:bg-primary/60" />
            <span className="flex items-center gap-2 text-xs font-semibold">
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-[0.65rem] group-data-[state=current]:border-primary group-data-[state=current]:bg-primary group-data-[state=current]:text-primary-foreground group-data-[state=done]:border-primary/60 group-data-[state=done]:bg-primary/60 group-data-[state=done]:text-primary-foreground">
                {state === "done" ? <Check aria-hidden className="size-3" /> : position + 1}
              </span>
              <span className="hidden text-muted-foreground group-data-[state=current]:text-foreground sm:inline">
                {item.label}
              </span>
              <span className="sr-only sm:hidden">{item.label}</span>
              {state === "done" ? <span className="sr-only">(done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

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
  const [qrOpen, setQrOpen] = useState(false);
  const accounts = instructions?.accounts ?? [];
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? null);
  const account = accounts.find((row) => row.id === accountId) ?? accounts[0] ?? null;
  const accountQr = account ? qrSrc(account) : null;
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
        <Stepper step={step} />
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
          <div className="grid gap-6 [&>*]:min-w-0">
            <div>
              <h2 className="font-display text-3xl tracking-[-0.04em]">Send {amount}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Open GCash, scan the studio QR or send to the number below, and pay exactly {amount}
                . Keep the confirmation screen open so you can screenshot it.
              </p>
            </div>

            {account ? (
              <>
                {accounts.length > 1 ? (
                  <fieldset className="flex flex-wrap gap-2">
                    <legend className="sr-only">Payment account</legend>
                    {accounts.map((row) => (
                      <Button
                        key={row.id}
                        type="button"
                        size="sm"
                        variant={row.id === account.id ? "default" : "outline"}
                        aria-pressed={row.id === account.id}
                        onClick={() => setAccountId(row.id)}
                      >
                        {row.label}
                      </Button>
                    ))}
                  </fieldset>
                ) : null}
                <div className="grid gap-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-start [&>*]:min-w-0">
                  {accountQr ? (
                    <button
                      type="button"
                      className="group relative grid aspect-square w-full max-w-[14rem] place-items-center justify-self-center overflow-hidden rounded-[1.25rem] border border-border bg-white p-3 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`Open ${account.label} QR code full screen`}
                      onClick={() => setQrOpen(true)}
                    >
                      <img
                        src={accountQr}
                        alt={`${PAYMENT_ACCOUNT_TYPE_META[account.type].label} QR code for ${account.label}`}
                        className="size-full min-h-0 min-w-0 object-contain"
                      />
                      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2 py-1 text-[0.65rem] font-medium text-background">
                        <Expand aria-hidden className="size-3" />
                        View full screen
                      </span>
                    </button>
                  ) : (
                    <div className="grid aspect-square w-full max-w-[14rem] place-items-center justify-self-center overflow-hidden rounded-[1.25rem] border border-border bg-white p-3">
                      <span className="grid place-items-center gap-2 p-4 text-center text-xs text-muted-foreground">
                        <QrCode aria-hidden className="size-8" />
                        No QR for this account. Send to the number instead.
                      </span>
                    </div>
                  )}
                  <dl className="rounded-[1.25rem] border border-border px-4">
                    <CopyValue label="Amount" value={amount} />
                    <CopyValue label="Account name" value={account.accountName} />
                    {account.accountNumber ? (
                      <CopyValue
                        label={PAYMENT_ACCOUNT_TYPE_META[account.type].numberLabel}
                        value={account.accountNumber}
                      />
                    ) : null}
                  </dl>
                </div>
              </>
            ) : (
              <Alert data-advisory="instruction">
                <CircleAlert aria-hidden />
                <AlertTitle>GCash details aren’t available right now</AlertTitle>
                <AlertDescription>
                  {instructions
                    ? "The studio hasn't set up a GCash account yet."
                    : "We couldn't load the studio's payment details."}{" "}
                  You can pay in cash at the front desk instead.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 max-sm:[&>*]:w-full">
              {account ? (
                <Button type="button" size="lg" onClick={() => setStep("upload")}>
                  I’ve sent the payment
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              ) : null}
              <Button
                variant={account ? "ghost" : "default"}
                size="lg"
                nativeButton={false}
                render={<Link href={paymentHref} />}
              >
                Pay at the front desk
              </Button>
            </div>
          </div>
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
      {account && accountQr ? (
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogContent
            className="payment-qr-lightbox"
            showCloseButton={false}
            style={{ translate: "none" }}
          >
            <header className="payment-qr-lightbox-header">
              <div>
                <DialogTitle>{account.label} QR code</DialogTitle>
                <DialogDescription className="sr-only">
                  Full-screen payment QR code. Press Escape or use Close to return to the payment
                  page.
                </DialogDescription>
              </div>
              <DialogClose className="payment-qr-lightbox-close" aria-label="Close QR code">
                <X aria-hidden className="size-5" />
                <span>Close</span>
              </DialogClose>
            </header>
            <div className="payment-qr-lightbox-viewport">
              <img
                src={accountQr}
                alt={`${PAYMENT_ACCOUNT_TYPE_META[account.type].label} QR code for ${account.label}, full screen`}
                className="payment-qr-lightbox-image"
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
