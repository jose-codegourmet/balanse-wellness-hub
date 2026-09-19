import type { CustomerBooking } from "@balanse/domain";
import {
  bookingReference,
  formatHoldDeadline,
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  needsAttentionKind,
} from "@balanse/domain";
import { StatusBadge } from "@balanse/ui";
import Link from "next/link";

export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const attention = needsAttentionKind(booking.status);
  const showHold = booking.status === "HELD_AWAITING_PAYMENT" && booking.holdExpiresAt;

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{booking.session.className}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatSessionDate(booking.session.startsAt)} · {booking.session.coachName}
          </p>
          <p className="mt-1 text-sm">
            {formatSessionRange(booking.session.startsAt, booking.session.endsAt)}
          </p>
          <p className="mt-1 text-sm">{formatPeso(booking.session.pricePhp)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Ref {bookingReference(booking.id)}</p>
        </div>
        <StatusBadge
          status={
            booking.refundStatus === "REFUND_PENDING" || booking.refundStatus === "REFUNDED"
              ? booking.refundStatus
              : booking.status
          }
        />
      </div>
      {showHold ? (
        <p className="mt-3 text-sm font-medium">
          {formatHoldDeadline(booking.holdExpiresAt ?? "", booking.session.startsAt)}
        </p>
      ) : null}
      {attention === "payment_needed" ? (
        <p className="mt-2 text-sm">Payment is needed to keep this reservation.</p>
      ) : null}
      {attention === "payment_under_review" ? (
        <p className="mt-2 text-sm">Payment is under review. This is not a confirmation.</p>
      ) : null}
      {attention === "request_pending" ? (
        <p className="mt-2 text-sm">
          A request is waiting for studio review. Your slot stays held.
        </p>
      ) : null}
      <Link
        href={`/portal/bookings/${booking.id}`}
        className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
      >
        View booking
      </Link>
    </article>
  );
}
