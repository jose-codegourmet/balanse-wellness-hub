import type { CustomerBooking, CustomerStatusKey } from "@balanse/domain";
import {
  BUSINESS_TIME_ZONE,
  bookingReference,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
} from "@balanse/domain";
import { StatusBadge } from "@balanse/ui";
import type { ReactNode } from "react";
import "./portal-booking.css";

/**
 * The one booking summary the portal reuses (FE-CUS-014 / 015 / 016).
 *
 * The portal home hero, the booking detail ticket, and the reschedule
 * "current booking" panel all need the same facts in the same order, so they
 * share this composition instead of each re-deriving a dot-joined line.
 */

export type BookingSummaryTone = "hero" | "panel" | "ticket";

/** Refunds ride in the same slot as the booking status, so resolve it once. */
export function bookingStatusKey(booking: CustomerBooking): CustomerStatusKey {
  return booking.refundStatus === "REFUND_PENDING" || booking.refundStatus === "REFUNDED"
    ? booking.refundStatus
    : booking.status;
}

export type BookingMood = "urgent" | "pending" | "settled" | "closed";

/**
 * Collapses the thirteen booking statuses into the four surface treatments the
 * portal uses. Only the treatment changes — the status vocabulary rendered to
 * the customer still comes from `StatusBadge` (FE-SHR-002).
 */
export function bookingMood(booking: CustomerBooking): BookingMood {
  switch (booking.status) {
    case "HELD_AWAITING_PAYMENT":
      return "urgent";
    case "PAYMENT_SUBMITTED":
    case "WAITLISTED":
    case "CANCELLATION_REQUESTED":
    case "RESCHEDULE_REQUESTED":
      return "pending";
    case "CONFIRMED":
    case "CHECKED_IN":
    case "COMPLETED":
      return "settled";
    default:
      return "closed";
  }
}

/** Front-desk scan target, so it gets its own block rather than a `dl` row. */
export function BookingReference({
  bookingId,
  size = "inline",
}: {
  bookingId: string;
  size?: "inline" | "primary";
}) {
  return (
    <p className="booking-reference" data-size={size}>
      <span>Reference</span>
      <strong>{bookingReference(bookingId)}</strong>
    </p>
  );
}

/**
 * Date, time, coach, price. The class name is always the surrounding
 * headline, so repeating it as a labelled row would just be noise.
 */
export function BookingFacts({ booking }: { booking: CustomerBooking }) {
  const { session } = booking;
  return (
    <dl className="booking-facts">
      <div>
        <dt>Date</dt>
        <dd>{formatSessionDate(session.startsAt)}</dd>
      </div>
      <div>
        <dt>Time</dt>
        <dd>
          {formatSessionTimeRange(session.startsAt, session.endsAt)}
          <span className="booking-facts-note">{BUSINESS_TIME_ZONE}</span>
        </dd>
      </div>
      <div>
        <dt>Coach</dt>
        <dd>{session.coachName}</dd>
      </div>
      <div>
        <dt>Price</dt>
        <dd>{formatPeso(session.pricePhp)}</dd>
      </div>
    </dl>
  );
}

export function BookingSummary({
  booking,
  eyebrow,
  tone = "panel",
  headingLevel = 2,
  showReference = true,
  children,
}: {
  booking: CustomerBooking;
  eyebrow?: string;
  tone?: BookingSummaryTone;
  headingLevel?: 2 | 3;
  showReference?: boolean;
  children?: ReactNode;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const { session } = booking;

  return (
    <article
      className="booking-summary"
      data-tone={tone}
      data-mood={bookingMood(booking)}
      data-booking-id={booking.id}
    >
      <header className="booking-summary-head">
        <div className="booking-summary-identity">
          {eyebrow ? <p className="portal-eyebrow">{eyebrow}</p> : null}
          <Heading className="booking-summary-title font-display">{session.className}</Heading>
        </div>
        <StatusBadge status={bookingStatusKey(booking)} />
      </header>
      <BookingFacts booking={booking} />
      {showReference ? <BookingReference bookingId={booking.id} /> : null}
      {children ? <div className="booking-summary-footer">{children}</div> : null}
    </article>
  );
}
