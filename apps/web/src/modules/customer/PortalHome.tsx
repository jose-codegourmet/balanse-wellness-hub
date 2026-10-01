"use client";

import type { CustomerBooking, CustomerOnboardingAnswers, CustomerProfile } from "@balanse/domain";
import { needsAttentionBookings, onboardingCompletion, upcomingConfirmed } from "@balanse/domain";
import { Button, FeedbackState } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CompleteProfileCard } from "@/components/balanse/complete-profile-card/CompleteProfileCard";
import { BookingSummary } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-home.css";
import { BookingCard } from "./BookingCard";

const ATTENTION_PREVIEW_LIMIT = 3;

/** One orienting line under the greeting, derived from what is actually here. */
function orientation(bookings: CustomerBooking[], attention: number, hasNext: boolean): string {
  if (attention > 0) {
    return attention === 1
      ? "One booking needs something from you before it can be confirmed."
      : `${attention} bookings need something from you before they can be confirmed.`;
  }
  if (hasNext) return "Your next session is confirmed. Everything the front desk needs is below.";
  if (bookings.length > 0) {
    return "Nothing is confirmed right now. Browse the week to reserve your next class.";
  }
  return "You have not reserved a class yet. The schedule is the place to start.";
}

export function PortalHome({
  profile,
  bookings,
  onboardingAnswers = null,
}: {
  profile: CustomerProfile;
  bookings: CustomerBooking[];
  /** Onboarding answers for the "Complete your profile" nudge (#352). */
  onboardingAnswers?: CustomerOnboardingAnswers | null;
}) {
  const router = useRouter();
  const browse = () => router.push("/portal/schedule");
  const confirmed = upcomingConfirmed(bookings);
  const attention = useMemo(() => needsAttentionBookings(bookings), [bookings]);
  const attentionPreview = attention.slice(0, ATTENTION_PREVIEW_LIMIT);
  const hasMoreAttention = attention.length > attentionPreview.length;
  const onboardingStatus = profile.onboardingStatus;
  const completion = useMemo(
    () => onboardingCompletion(onboardingAnswers, profile),
    [onboardingAnswers, profile],
  );

  return (
    <div className="portal-page portal-home">
      <header className="portal-home-greeting">
        <div className="portal-home-greeting-copy">
          <p className="portal-eyebrow">Your bookings</p>
          <h1 className="font-display">Welcome, {profile.fullName}</h1>
          <p className="portal-home-orient">
            {orientation(bookings, attention.length, Boolean(confirmed))}
          </p>
        </div>
        {/* The schedule is the only way to reserve, so it is anchored to the
            greeting instead of trailing the page as a loose link. */}
        <Button
          className="portal-home-browse"
          nativeButton={false}
          render={<Link href="/portal/schedule" />}
        >
          Browse Schedule <ArrowUpRight size={17} aria-hidden="true" />
        </Button>
      </header>

      <div className="portal-home-overview">
        <section
          data-section="upcoming"
          className="portal-section portal-home-upcoming"
          aria-labelledby="home-upcoming"
        >
          <div className="portal-section-title">
            <h2 id="home-upcoming">Next up</h2>
            <p>The next session the studio has confirmed.</p>
          </div>
          <div className="portal-home-next">
            {confirmed ? (
              <BookingSummary
                booking={confirmed}
                eyebrow="Next session"
                tone="hero"
                headingLevel={3}
              >
                <Link href={`/portal/bookings/${confirmed.id}`} className="portal-inline-link">
                  View booking <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <span className="portal-quiet-note">
                  Show the reference at the front desk when you arrive.
                </span>
              </BookingSummary>
            ) : (
              <FeedbackState id="customer.no-upcoming" onAction={browse} />
            )}
          </div>
          {/* Below the next booking, compact, never dismissible (#352). */}
          {onboardingStatus === "completed" ? null : (
            <CompleteProfileCard
              className="mt-4"
              status={onboardingStatus}
              completion={completion}
            />
          )}
        </section>

        <section
          data-section="needs-attention"
          className="portal-section portal-home-attention-section"
          data-empty={attention.length === 0 ? "true" : "false"}
          aria-labelledby="home-attention"
        >
          <div className="portal-section-title">
            <h2 id="home-attention">Needs attention</h2>
            {attention.length > 0 ? <p>Act on these to keep the reservation.</p> : null}
          </div>
          {attention.length === 0 ? (
            <p className="portal-quiet-note portal-home-clear">
              Nothing needs your attention right now.
            </p>
          ) : (
            <div className="portal-home-attention">
              {attentionPreview.map((booking) => (
                <BookingCard key={booking.id} booking={booking} density="preview" />
              ))}
              <Link href="/portal/bookings?tab=pending" className="portal-home-attention-link">
                {hasMoreAttention
                  ? `View all ${attention.length} bookings that need attention`
                  : "View all bookings"}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
