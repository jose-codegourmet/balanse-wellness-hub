"use client";

import type { CustomerBooking, CustomerProfile } from "@balanse/domain";
import {
  bookingReference,
  customerBookingActions,
  paymentMethodLabel,
  paymentStatusLabel,
  sessionChangeRulesLabel,
  sessionChangeRulesNotice,
  sessionDisplayName,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Button } from "@balanse/ui";
import { ArrowLeft, Check, Copy, Hourglass, Info, Ticket, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookingFacts,
  BookingReference,
  bookingMood,
} from "@/components/balanse/portal/BookingSummary";
import { BookingStatusBanner } from "@/components/balanse/portal/booking-status-banner/BookingStatusBanner";
import { InviteFriendsCard } from "@/components/balanse/portal/invite-friends-card/InviteFriendsCard";
import type { InviteFriendsCardProps } from "@/components/balanse/portal/invite-friends-card/InviteFriendsCard.meta";
import "@/components/balanse/portal/portal-booking.css";

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
  if (booking.status === "HELD_AWAITING_PAYMENT" && booking.paymentStatus === "REJECTED") {
    advisories.push({
      kind: "instruction",
      icon: Wallet,
      title: "Your payment wasn't accepted",
      body: booking.rejectReason
        ? `The front desk said: "${booking.rejectReason}" Your spot is still held, so you can pay again before the hold ends.`
        : "The front desk couldn't verify your payment. Your spot is still held, so you can pay again before the hold ends.",
    });
  }
  if (
    booking.status === "HELD_AWAITING_PAYMENT" &&
    booking.paymentMethod === "PAY_AT_COUNTER" &&
    booking.paymentStatus === "NONE"
  ) {
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
      body: booking.packagePromotionBlocked
        ? "Your intended package could not be reserved when a spot opened. You are still waiting. The studio will not pick another package or charge cash."
        : booking.intendedEntitlementId
          ? "No session is held on the waitlist. The intended package is checked again if you are promoted."
          : "No payment is due while you wait.",
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
  // #380 — explain a hidden request action rather than leaving a gap.
  const byStatus = customerBookingActions(booking.status);
  const changeRules = sessionChangeRulesNotice(booking.session);
  if (changeRules && (byStatus.cancel || byStatus.reschedule)) {
    advisories.push({
      kind: "informational",
      icon: Info,
      title: sessionChangeRulesLabel(booking.session) ?? "Change rules",
      body: changeRules,
    });
  }
  return advisories;
}

export function BookingDetail({
  booking,
  profile,
  invite = null,
}: {
  booking: CustomerBooking;
  profile: CustomerProfile | null;
  /** #350 — built by the route for upcoming active bookings; null hides the card. */
  invite?: InviteFriendsCardProps["invite"] | null;
}) {
  const actions = customerBookingActions(booking.status, booking.session);
  const advisories = advisoriesFor(booking);
  const mood = bookingMood(booking);
  const { session } = booking;
  const usesPackage = Boolean(booking.entitlementId);
  const hasActions = Boolean(actions.reschedule || actions.cancel);
  const router = useRouter();
  const [referenceCopied, setReferenceCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const expiresAt = booking.holdExpiresAt ? new Date(booking.holdExpiresAt).getTime() : null;
  useEffect(() => {
    if (!expiresAt || expiresAt <= now) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  // Once the hold actually expires, re-fetch the booking (WIRE-0805, #363) so
  // the page updates to EXPIRED/promoted-to-waitlist on its own, instead of
  // leaving the customer looking at a stale HELD_AWAITING_PAYMENT banner.
  const refreshedOnExpiry = useRef(false);
  useEffect(() => {
    if (expiresAt && expiresAt <= now && !refreshedOnExpiry.current) {
      refreshedOnExpiry.current = true;
      router.refresh();
    }
  }, [expiresAt, now, router]);
  const remainingMinutes = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 60_000)) : null;
  // "Pay now" while the hold is still running. GCash already chosen goes straight
  // to the proof upload; otherwise the payment page, where GCash or cash can be picked.
  const payNowHref =
    booking.status === "HELD_AWAITING_PAYMENT" &&
    !booking.entitlementId &&
    !(expiresAt !== null && expiresAt <= now)
      ? booking.paymentMethod === "GCASH"
        ? `/portal/bookings/${booking.id}/payment/gcash`
        : `/portal/bookings/${booking.id}/payment`
      : null;

  return (
    <div className="portal-page portal-booking-detail">
      <header className="portal-page-head">
        <Link className="booking-detail-back" href="/portal/bookings">
          <ArrowLeft aria-hidden="true" size={16} />
          All bookings
        </Link>
        <h1 className="font-display">
          {booking.status === "CONFIRMED" || booking.status === "CHECKED_IN"
            ? "Booking confirmation"
            : "Booking details"}
        </h1>
        {/* Spec guardrail: this stays directly under the title so it is read
            before the ticket, never demoted into fine print. */}
        <p className="portal-page-lead">
          Your current booking status and details for the front desk. This is not an official
          receipt.
        </p>
      </header>

      <section data-section="booking-status" className="booking-ticket" data-mood={mood}>
        <BookingStatusBanner booking={booking} />
        <div className="booking-ticket-body">
          <p className="booking-ticket-eyebrow">Your session</p>
          <h2 className="booking-summary-title font-display">{sessionDisplayName(session)}</h2>
          <BookingFacts booking={booking} />
        </div>
        <aside className="booking-ticket-stub" aria-label="Booking reference">
          <BookingReference bookingId={booking.id} size="primary" />
          <p className="booking-ticket-stub-note">Show this reference at the front desk.</p>
          <button
            className="booking-reference-copy"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(bookingReference(booking.id));
                setReferenceCopied(true);
              } catch {
                setReferenceCopied(false);
              }
            }}
          >
            {referenceCopied ? (
              <Check aria-hidden="true" size={14} />
            ) : (
              <Copy aria-hidden="true" size={14} />
            )}
            {referenceCopied ? "Copied" : "Copy reference"}
          </button>
        </aside>
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
      </section>

      <div className="booking-detail-lower">
        <section data-section="payment" className="portal-section booking-payment-panel">
          {usesPackage ? (
            <>
              <div className="booking-package-heading">
                <span className="booking-package-icon" aria-hidden="true">
                  <Ticket size={21} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="booking-ticket-eyebrow">Session covered</p>
                  <h2 className="font-display">{booking.packageName ?? "Your package"}</h2>
                </div>
              </div>
              <p className="booking-package-copy">
                This booking was made with one package session. No separate payment is due.
              </p>
            </>
          ) : (
            <>
              <div className="portal-section-title">
                <h2>Payment</h2>
                <p>
                  {booking.status === "WAITLISTED"
                    ? "No payment is due while you wait for a place."
                    : "Pay by GCash or at the front desk. The front desk confirms your spot."}
                </p>
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
            </>
          )}
          {booking.status === "HELD_AWAITING_PAYMENT" && remainingMinutes !== null ? (
            <p className="booking-hold-note" role="status">
              {remainingMinutes > 0
                ? `Your reservation hold expires in ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}.`
                : "Your reservation hold has expired. This page is refreshing to show the latest status."}
            </p>
          ) : null}
          {advisories.length > 0 ? (
            <div className="booking-advisories">
              {advisories.map((advisory) => {
                const Icon = advisory.icon;
                return (
                  <Alert
                    key={advisory.title}
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
        {invite ? <InviteFriendsCard invite={invite} /> : null}
      </div>

      <section data-section="actions" className="booking-actions">
        <div className="booking-actions-intro">
          <h2 className="font-display">Manage booking</h2>
          <p>
            {payNowHref || hasActions
              ? "Need to make a change? Send a request to the studio."
              : "This booking has no available customer actions."}
          </p>
        </div>
        <div className="booking-action-buttons">
          {payNowHref ? (
            <Button nativeButton={false} render={<Link href={payNowHref} />}>
              {booking.paymentStatus === "REJECTED" ? "Pay Again" : "Pay Now"}
            </Button>
          ) : null}
          {actions.reschedule ? (
            <Button
              variant={payNowHref ? "secondary" : "default"}
              nativeButton={false}
              render={<Link href={`/portal/bookings/${booking.id}/reschedule`} />}
            >
              Request Reschedule
            </Button>
          ) : null}
          {actions.cancel ? (
            <Button
              variant="destructive"
              nativeButton={false}
              render={<Link href={`/portal/bookings/${booking.id}/cancel`} />}
            >
              Request Cancellation
            </Button>
          ) : null}
          {!payNowHref && !actions.reschedule && !actions.cancel ? (
            <p className="booking-actions-note">
              No customer requests are available for this booking. The studio handles any further
              changes or pending requests.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
