"use client";

import type { CustomerBooking, PaymentMethod } from "@balanse/domain";
import {
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
} from "@balanse/domain";
import { Button, FeedbackState } from "@balanse/ui";
import { ArrowLeft, CalendarDays, CircleX, Clock3, Hourglass, Ticket, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSetPaymentMethod } from "@/lib/query/mutations/payments";
import { notify } from "@/modules/notifications/notify";
import { useHoldCountdown } from "../../_hooks/use-hold-countdown";
import { PaymentMethodForm } from "./payment-method-form/PaymentMethodForm";

export function PaymentMethodPage({
  booking,
  forcedExpired,
  forcedStatus,
}: {
  booking: CustomerBooking;
  forcedExpired?: boolean;
  forcedStatus?: "submitting";
}) {
  const router = useRouter();
  const saveMethod = useSetPaymentMethod(booking.customerId, booking.id);
  const [submitting, setSubmitting] = useState(forcedStatus === "submitting");
  const { session } = booking;
  const bookingHref = `/portal/bookings/${booking.id}`;

  const { deadlineLabel, remainingLabel, expired } = useHoldCountdown(booking, { forcedExpired });

  if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
    const rejected = booking.status === "REJECTED";
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
          {rejected && booking.rejectReason ? (
            <blockquote className="mt-5 border-l-2 border-[var(--balanse-gold)] pl-4 text-sm leading-6">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Note from the studio
              </span>
              <span className="mt-1 block">{booking.rejectReason}</span>
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

  if (booking.entitlementId) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <section className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Ticket aria-hidden className="size-3.5" />
            Package applied
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-[-0.05em]">Nothing to pay here.</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {booking.packageName ?? "Your package"} covers this session, so no cash or GCash payment
            is needed. The front desk still confirms your spot.
          </p>
          <Button className="mt-7" nativeButton={false} render={<Link href={bookingHref} />}>
            Back to booking
          </Button>
        </section>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <FeedbackState
          id="customer.reservation-expired"
          onAction={() => router.push("/portal/schedule")}
        />
      </div>
    );
  }

  const choose = async (method: PaymentMethod) => {
    setSubmitting(true);
    try {
      await saveMethod.mutateAsync(method);
    } catch {
      notify.portal("payment.method-failed");
      setSubmitting(false);
      return;
    }
    if (method === "GCASH") {
      notify.portal("payment.gcash-selected");
      router.push(`${bookingHref}/payment/gcash`);
      return;
    }
    notify.portal("payment.counter-selected");
    router.push(bookingHref);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <Link
        href={bookingHref}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        Back to booking
      </Link>

      <section className="mt-5 overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
              <Wallet aria-hidden className="size-3.5" />
              Complete your booking
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-4xl tracking-[-0.05em] sm:text-5xl">
              {sessionDisplayName(session)}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/74 sm:text-base">
              Your spot is held while you pay. Once the front desk checks your payment, they confirm
              your booking.
            </p>
          </div>
          <dl className="grid content-end gap-5 border-t border-primary-foreground/15 bg-primary-foreground/10 p-7 text-sm sm:p-10 lg:border-l lg:border-t-0">
            <div>
              <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                <CalendarDays aria-hidden className="size-3.5" /> Date
              </dt>
              <dd className="mt-2 font-medium">{formatSessionDate(session.startsAt)}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                <Clock3 aria-hidden className="size-3.5" /> Time
              </dt>
              <dd className="mt-2 font-medium">
                {formatSessionTimeRange(session.startsAt, session.endsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                Amount due
              </dt>
              <dd className="font-display mt-1 text-3xl tracking-[-0.03em]">
                {formatPeso(session.pricePhp)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <PaymentMethodForm
          amountLabel={formatPeso(session.pricePhp)}
          deadlineLabel={deadlineLabel}
          submitting={submitting}
          onSubmit={(method) => void choose(method)}
        />

        <aside
          aria-labelledby="hold-heading"
          className="grid gap-6 rounded-[1.5rem] border border-border bg-card p-6 lg:sticky lg:top-24"
        >
          <div>
            <p
              id="hold-heading"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
            >
              <Hourglass aria-hidden className="size-3.5" />
              Your spot is held
            </p>
            <p className="font-display mt-3 text-3xl tracking-[-0.04em]">
              {remainingLabel ?? (deadlineLabel ? "Held for you" : "Until class starts")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {deadlineLabel
                ? `Until ${deadlineLabel}, studio time.`
                : "Held until your class begins, studio time."}
            </p>
          </div>
          <p className="border-l-2 border-[var(--balanse-gold)] pl-4 text-xs leading-5 text-muted-foreground">
            Send your GCash proof or pay at the front desk before then. If the hold ends first, the
            spot is released to other members.
          </p>
          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              What happens next
            </p>
            <ol className="mt-4 grid gap-4 text-sm">
              {[
                "Choose GCash or cash.",
                "Upload your GCash receipt, or pay at the front desk.",
                "The front desk checks it and confirms your spot.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold"
                  >
                    {index + 1}
                  </span>
                  <span className="leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
