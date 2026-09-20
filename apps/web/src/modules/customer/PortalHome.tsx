"use client";

import type { CustomerBooking, CustomerProfile } from "@balanse/domain";
import { bookingsForTab, needsAttentionBookings, upcomingConfirmed } from "@balanse/domain";
import { FeedbackState, Tabs, TabsContent, TabsList, TabsTrigger } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookingSummary } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-home.css";
import { Button } from "@/components/jabkit/button";
import { BookingCard } from "./BookingCard";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "history", label: "History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
}: {
  profile: CustomerProfile;
  bookings: CustomerBooking[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("upcoming");
  const browse = () => router.push("/portal/schedule");
  const confirmed = upcomingConfirmed(bookings);
  const attention = useMemo(() => needsAttentionBookings(bookings), [bookings]);

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
        <Button asChild className="portal-pill-button portal-home-browse">
          <Link href="/portal/schedule">
            Browse Schedule <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </Button>
      </header>

      <section data-section="upcoming" className="portal-section" aria-labelledby="home-upcoming">
        <div className="portal-section-title">
          <h2 id="home-upcoming">Upcoming</h2>
          <p>The next session the studio has confirmed.</p>
        </div>
        <div className="portal-home-next">
          {confirmed ? (
            <BookingSummary booking={confirmed} eyebrow="Next session" tone="hero" headingLevel={3}>
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
      </section>

      <section
        data-section="needs-attention"
        className="portal-section"
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
            {attention.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <section data-section="my-bookings" className="portal-section" aria-labelledby="home-list">
        <div className="portal-section-title">
          <h2 id="home-list">My bookings</h2>
          <p>Everything you have reserved, past and present.</p>
        </div>
        {/* Base UI tabs own the ARIA contract: panel wiring, roving tabindex,
            and Left/Right/Home/End. The active tab carries weight and an
            underline rail, so colour is never the only signal. */}
        <Tabs
          className="portal-home-tabs"
          value={tab}
          onValueChange={(value) => setTab(value as TabId)}
        >
          <TabsList variant="line" aria-label="Booking lists">
            {TABS.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((item) => (
            <TabsContent key={item.id} value={item.id} className="portal-home-panel">
              <BookingList bookings={bookings} tab={item.id} onBrowse={browse} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}

function BookingList({
  bookings,
  tab,
  onBrowse,
}: {
  bookings: CustomerBooking[];
  tab: TabId;
  onBrowse: () => void;
}) {
  const rows = bookingsForTab(bookings, tab);

  if (bookings.length === 0) return <FeedbackState id="customer.no-bookings" onAction={onBrowse} />;
  if (rows.length === 0 && tab === "upcoming") {
    return <FeedbackState id="customer.no-upcoming" onAction={onBrowse} />;
  }
  if (rows.length === 0 && tab === "history") return <FeedbackState id="customer.no-history" />;
  if (rows.length === 0) {
    return <p className="portal-quiet-note">No pending bookings in this list.</p>;
  }

  return (
    <div className="portal-home-list">
      {rows.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
