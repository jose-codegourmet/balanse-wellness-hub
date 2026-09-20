import type { CustomerBooking, CustomerProfile } from "@balanse/domain";
import {
  customerBookingActions,
  formatSessionDate,
  formatSessionTimeRange,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, StatusBadge } from "@balanse/ui";
import { Hourglass, Info, Wallet } from "lucide-react";
import Link from "next/link";
import {
  BookingFacts,
  BookingReference,
  bookingMood,
  bookingStatusKey,
} from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-booking.css";
import { Button } from "@/components/jabkit/button";

type Advisory = {
  kind: "instruction" | "informational" | "held";
  icon: typeof Wallet;
  title: string;
  body: string;
};

/**
 * The conditional payment notices differ in kind, not just in wording: one is
 * an instruction the customer must act on, one is background information, and
 * one explains a state the studio is holding. Keeping them in one list makes
 * that distinction explicit instead of three identical paragraphs.
 */
function advisoriesFor(booking: CustomerBooking): Advisory[] {
  const advisories: Advisory[] = [];
  if (booking.paymentMethod === "PAY_AT_COUNTER" && booking.paymentStatus === "NONE") {
    advisories.push({
      kind: "instruction",
      icon: Wallet,
      title: "Pay at the counter before class",
      body: "Paying at the counter does not auto-confirm the booking.",
    });
  }
  if (booking.status === "WAITLISTED") {
    advisories.push({
      kind: "informational",
      icon: Info,
      title: "You are on the waitlist",
      body: "No payment is due while you wait.",
    });
  }
  if (booking.status === "CANCELLATION_REQUESTED" || booking.status === "RESCHEDULE_REQUESTED") {
    advisories.push({
      kind: "held",
      icon: Hourglass,
      title: "A request is with the studio",
      body: "Your slot stays held until the studio finishes this request.",
    });
  }
  return advisories;
}

export function BookingDetail({
  booking,
  profile,
}: {
  booking: CustomerBooking;
  profile: CustomerProfile | null;
}) {
  const actions = customerBookingActions(booking.status);
  const advisories = advisoriesFor(booking);
  const mood = bookingMood(booking);
  const { session } = booking;

  return (
    <div className="portal-page portal-booking-detail">
      <header className="portal-page-head">
        <p className="portal-eyebrow">My bookings</p>
        <h1 className="font-display">Booking confirmation</h1>
        {/* Spec guardrail: this stays directly under the title so it is read
            before the ticket, never demoted into fine print. */}
        <p className="portal-page-lead">
          This is a booking confirmation for the front desk. It is not an official receipt.
        </p>
      </header>

      <section data-section="booking-status" className="booking-ticket" data-mood={mood}>
        <div className="booking-ticket-stub">
          <StatusBadge status={bookingStatusKey(booking)} />
          <BookingReference bookingId={booking.id} size="primary" />
          <p className="booking-ticket-stub-note">
            Show this reference at the front desk. Studio time is Asia/Manila.
          </p>
        </div>
        <div className="booking-ticket-body">
          <h2 className="booking-summary-title font-display">{session.className}</h2>
          <p className="booking-summary-when">
            {formatSessionDate(session.startsAt)} ·{" "}
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
          <BookingFacts booking={booking} />
          {profile ? (
            <dl className="booking-identity">
              <div>
                <dt>Booked by</dt>
                <dd>{profile.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Contact number</dt>
                <dd>{profile.contactNumber}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      <section data-section="payment" className="portal-section">
        <div className="portal-section-title">
          <h2>Payment</h2>
          <p>Handled by the studio, never on this page.</p>
        </div>
        <dl className="booking-facts">
          <div>
            <dt>Method</dt>
            <dd>{paymentMethodLabel(booking.paymentMethod)}</dd>
          </div>
          <div>
            <dt>Payment status</dt>
            <dd>{paymentStatusLabel(booking.paymentStatus)}</dd>
          </div>
        </dl>
        {advisories.length > 0 ? (
          <div className="booking-advisories">
            {advisories.map((advisory) => {
              const Icon = advisory.icon;
              return (
                <Alert
                  key={advisory.kind}
                  className="booking-advisory"
                  data-advisory={advisory.kind}
                >
                  <Icon aria-hidden="true" />
                  <AlertTitle>{advisory.title}</AlertTitle>
                  <AlertDescription>{advisory.body}</AlertDescription>
                </Alert>
              );
            })}
          </div>
        ) : null}
      </section>

      <section data-section="actions" className="booking-actions">
        {actions.reschedule ? (
          <Button asChild variant="primary" className="portal-pill-button">
            <Link href={`/portal/bookings/${booking.id}/reschedule`}>Request Reschedule</Link>
          </Button>
        ) : null}
        {actions.cancel ? (
          <Button asChild variant="secondary" className="portal-pill-button">
            <Link href={`/portal/bookings/${booking.id}/cancel`}>Request Cancellation</Link>
          </Button>
        ) : null}
        {!actions.reschedule && !actions.cancel ? (
          <p className="booking-actions-note">
            No customer requests are available for this booking. Nothing is wrong — this status is
            already resolved, so the studio handles any further change.
          </p>
        ) : null}
      </section>
    </div>
  );
}
