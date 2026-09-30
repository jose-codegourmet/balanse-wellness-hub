"use client";

import type { CustomerBooking } from "@balanse/domain";
import { bookingsForTab } from "@balanse/domain";
import { FeedbackState, Tabs, TabsContent, TabsList, TabsTrigger } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookingCard } from "@/modules/customer/BookingCard";
import type { MyBookingsPageProps } from "./MyBookingsPage.meta";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "history", label: "History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function validTab(tab: string | undefined): TabId {
  return TABS.some((item) => item.id === tab) ? (tab as TabId) : "upcoming";
}

export function MyBookingsPage({ bookings, initialTab }: MyBookingsPageProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>(() => validTab(initialTab));
  const browse = () => router.push("/portal/schedule");

  return (
    <div className="portal-page portal-bookings-page">
      <header className="portal-page-head portal-bookings-head">
        <p className="portal-eyebrow">Your reservations</p>
        <h1 className="font-display">My bookings</h1>
        <p>View every class you have reserved and open a booking to manage it.</p>
      </header>

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
