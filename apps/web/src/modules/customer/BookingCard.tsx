import type { CustomerBooking } from "@balanse/domain";
import {
  bookingReference,
  bookingStatusLabel,
  formatHoldDeadline,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
} from "@balanse/domain";
import { ArrowUpRight, CircleAlert } from "lucide-react";
import Link from "next/link";
import { bookingMood } from "@/components/balanse/portal/BookingSummary";
import { BookingStatusBanner } from "@/components/balanse/portal/booking-status-banner/BookingStatusBanner";
import "@/components/balanse/portal/portal-home.css";

/** Booking list ticket with a prominent status band and hold deadline. */
export function BookingCard({
  booking,
  density = "default",
}: {
  booking: CustomerBooking;
  density?: "default" | "preview";
}) {
  const showHold = booking.status === "HELD_AWAITING_PAYMENT" && booking.holdExpiresAt;
  const { session } = booking;

  if (density === "preview") {
    return (
      <article className="booking-card booking-card-preview" data-mood={bookingMood(booking)}>
        <Link href={`/portal/bookings/${booking.id}`} className="booking-card-preview-link">
          <div className="booking-card-preview-copy">
            <p className="booking-card-preview-status">{bookingStatusLabel(booking.status)}</p>
            <h3 className="font-display">{sessionDisplayName(session)}</h3>
            <p>
              {formatSessionDate(session.startsAt)} ·{" "}
              {formatSessionTimeRange(session.startsAt, session.endsAt)}
            </p>
          </div>
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </article>
    );
  }

  return (
    <article className="booking-card" data-mood={bookingMood(booking)}>
      <BookingStatusBanner booking={booking} compact />
      <div className="booking-card-head">
        <div className="booking-card-identity">
          <h3 className="font-display">{sessionDisplayName(session)}</h3>
          <p className="booking-card-when">
            {formatSessionDate(session.startsAt)} ·{" "}
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
          <p className="booking-card-meta">
            {session.coachName} · {formatPeso(session.pricePhp)} · Ref{" "}
            {bookingReference(booking.id)}
          </p>
        </div>
      </div>
      {showHold ? (
        <p className="booking-card-hold">
          <CircleAlert size={15} aria-hidden="true" />
          {formatHoldDeadline(booking.holdExpiresAt ?? "", session.startsAt)}
        </p>
      ) : null}
      <Link href={`/portal/bookings/${booking.id}`} className="booking-card-link">
        View booking <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
