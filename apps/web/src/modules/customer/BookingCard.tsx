import type { CustomerBooking } from "@balanse/domain";
import {
  bookingReference,
  formatHoldDeadline,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  needsAttentionKind,
} from "@balanse/domain";
import { StatusBadge } from "@balanse/ui";
import { ArrowUpRight, CircleAlert, Hourglass, Wallet } from "lucide-react";
import Link from "next/link";
import { bookingMood, bookingStatusKey } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-home.css";

const ATTENTION_COPY = {
  payment_needed: {
    icon: Wallet,
    text: "Payment is needed to keep this reservation.",
  },
  payment_under_review: {
    icon: Hourglass,
    text: "Payment is under review. This is not a confirmation.",
  },
  request_pending: {
    icon: Hourglass,
    text: "A request is waiting for studio review. Your slot stays held.",
  },
} as const;

/**
 * One booking in a list. The mood attribute drives the surface treatment so a
 * held booking reads urgent and a cancelled one reads closed, while the words
 * on the badge still come from the FE-SHR-002 status vocabulary.
 */
export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const attention = needsAttentionKind(booking.status);
  const attentionCopy = attention ? ATTENTION_COPY[attention] : null;
  const AttentionIcon = attentionCopy?.icon;
  const showHold = booking.status === "HELD_AWAITING_PAYMENT" && booking.holdExpiresAt;
  const { session } = booking;

  return (
    <article className="booking-card" data-mood={bookingMood(booking)}>
      <div className="booking-card-head">
        <div className="booking-card-identity">
          <h3 className="font-display">{session.className}</h3>
          <p className="booking-card-when">
            {formatSessionDate(session.startsAt)} ·{" "}
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
          <p className="booking-card-meta">
            {session.coachName} · {formatPeso(session.pricePhp)} · Ref{" "}
            {bookingReference(booking.id)}
          </p>
        </div>
        <StatusBadge status={bookingStatusKey(booking)} />
      </div>
      {showHold ? (
        <p className="booking-card-hold">
          <CircleAlert size={15} aria-hidden="true" />
          {formatHoldDeadline(booking.holdExpiresAt ?? "", session.startsAt)}
        </p>
      ) : null}
      {attentionCopy && AttentionIcon ? (
        <p className="booking-card-attention">
          <AttentionIcon size={15} aria-hidden="true" />
          {attentionCopy.text}
        </p>
      ) : null}
      <Link href={`/portal/bookings/${booking.id}`} className="booking-card-link">
        View booking <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
