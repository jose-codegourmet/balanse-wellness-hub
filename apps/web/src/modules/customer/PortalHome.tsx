"use client";

import type { CustomerBooking, CustomerProfile } from "@balanse/domain";
import { bookingsForTab, upcomingConfirmed } from "@balanse/domain";
import { FeedbackState } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookingCard } from "./BookingCard";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "history", label: "History" },
] as const;

export function PortalHome({
  profile,
  bookings,
}: {
  profile: CustomerProfile;
  bookings: CustomerBooking[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("upcoming");
  const browse = () => router.push("/portal/schedule");
  const confirmed = upcomingConfirmed(bookings);
  const attention = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "HELD_AWAITING_PAYMENT" ||
          booking.status === "PAYMENT_SUBMITTED" ||
          booking.status === "CANCELLATION_REQUESTED" ||
          booking.status === "RESCHEDULE_REQUESTED",
      ),
    [bookings],
  );
  const tabRows = bookingsForTab(bookings, tab);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <header>
        <h1 className="font-display text-3xl">Welcome, {profile.fullName}</h1>
      </header>

      <section data-section="upcoming">
        <h2 className="font-display text-2xl">Upcoming</h2>
        <div className="mt-4">
          {confirmed ? (
            <BookingCard booking={confirmed} />
          ) : (
            <FeedbackState id="customer.no-upcoming" onAction={browse} />
          )}
        </div>
      </section>

      <section data-section="needs-attention">
        <h2 className="font-display text-2xl">Needs attention</h2>
        <div className="mt-4 grid gap-3">
          {attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
          ) : (
            attention.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <section data-section="my-bookings">
        <h2 className="font-display text-2xl">My bookings</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Booking lists">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`rounded-md px-3 py-2 text-sm ${
                tab === item.id ? "bg-secondary font-semibold" : "border border-border"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {bookings.length === 0 ? (
            <FeedbackState id="customer.no-bookings" onAction={browse} />
          ) : tabRows.length === 0 && tab === "upcoming" ? (
            <FeedbackState id="customer.no-upcoming" onAction={browse} />
          ) : tabRows.length === 0 && tab === "history" ? (
            <FeedbackState id="customer.no-history" />
          ) : tabRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending bookings in this list.</p>
          ) : (
            tabRows.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <Link
        href="/portal/schedule"
        className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
      >
        Browse Schedule
      </Link>
    </div>
  );
}
