import type { CustomerBooking, CustomerProfile } from "@balanse/domain";
import {
  bookingReference,
  customerBookingActions,
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@balanse/domain";
import { StatusBadge } from "@balanse/ui";
import Link from "next/link";

export function BookingDetail({
  booking,
  profile,
}: {
  booking: CustomerBooking;
  profile: CustomerProfile | null;
}) {
  const actions = customerBookingActions(booking.status);
  const statusKey =
    booking.refundStatus === "REFUND_PENDING" || booking.refundStatus === "REFUNDED"
      ? booking.refundStatus
      : booking.status;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <section data-section="booking-status">
        <h1 className="font-display text-3xl">Booking confirmation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a booking confirmation for the front desk. It is not an official receipt.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={statusKey} />
        </div>
        {profile ? (
          <p className="mt-4 text-sm">
            {profile.fullName} · {profile.email} · {profile.contactNumber}
          </p>
        ) : null}
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Class</dt>
            <dd>{booking.session.className}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Date</dt>
            <dd>{formatSessionDate(booking.session.startsAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Time</dt>
            <dd>{formatSessionRange(booking.session.startsAt, booking.session.endsAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Coach</dt>
            <dd>{booking.session.coachName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Price</dt>
            <dd>{formatPeso(booking.session.pricePhp)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Reference</dt>
            <dd>{bookingReference(booking.id)}</dd>
          </div>
        </dl>
      </section>

      <section data-section="payment">
        <h2 className="font-display text-2xl">Payment</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Method</dt>
            <dd>{paymentMethodLabel(booking.paymentMethod)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Payment status</dt>
            <dd>{paymentStatusLabel(booking.paymentStatus)}</dd>
          </div>
        </dl>
        {booking.paymentMethod === "PAY_AT_COUNTER" && booking.paymentStatus === "NONE" ? (
          <p className="mt-3 text-sm">
            Pay at the counter before class. Paying at the counter does not auto-confirm the
            booking.
          </p>
        ) : null}
        {booking.status === "WAITLISTED" ? (
          <p className="mt-3 text-sm">You are on the waitlist. No payment is due while you wait.</p>
        ) : null}
        {booking.status === "CANCELLATION_REQUESTED" ||
        booking.status === "RESCHEDULE_REQUESTED" ? (
          <p className="mt-3 text-sm">
            Your slot stays held until the studio finishes this request.
          </p>
        ) : null}
      </section>

      <section data-section="actions" className="flex flex-wrap gap-3">
        {actions.reschedule ? (
          <Link
            href={`/portal/bookings/${booking.id}/reschedule`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm"
          >
            Request Reschedule
          </Link>
        ) : null}
        {actions.cancel ? (
          <Link
            href={`/portal/bookings/${booking.id}/cancel`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm"
          >
            Request Cancellation
          </Link>
        ) : null}
        {!actions.reschedule && !actions.cancel ? (
          <p className="text-sm text-muted-foreground">
            No customer requests are available for this booking.
          </p>
        ) : null}
      </section>
    </div>
  );
}
