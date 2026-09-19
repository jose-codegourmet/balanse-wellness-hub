"use client";

import type { CustomerProfile, PublicSession } from "@balanse/domain";
import {
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  REQUIRED_POLICY_DOCUMENTS,
} from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import { Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BookingForm({
  session,
  profile,
  intent = "reserve",
  forcedStatus,
}: {
  session: PublicSession;
  profile: CustomerProfile;
  intent?: "reserve" | "waitlist";
  forcedStatus?: "submitting";
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );
  const allAccepted = REQUIRED_POLICY_DOCUMENTS.every(
    (doc) => accepted[`${doc.documentName}:${doc.version}`],
  );
  const waitlist = intent === "waitlist" || !session.reservable;

  if (status === "submitting") {
    return <LocalizedSkeleton lines={6} label="Creating reservation" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">Reserve your spot</h1>

      <section>
        <h2 className="font-display text-2xl">Session</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Class</dt>
            <dd>{session.className}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Date</dt>
            <dd>{formatSessionDate(session.startsAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Time</dt>
            <dd>{formatSessionRange(session.startsAt, session.endsAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Coach</dt>
            <dd>{session.coachName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Price</dt>
            <dd>{formatPeso(session.pricePhp)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="font-display text-2xl">Your details</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You are booking only for yourself. There is no attendee or “someone else” option.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="book-name">Name</Label>
            <Input
              id="book-name"
              value={fullName}
              autoComplete="name"
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="book-email">Email</Label>
            <Input
              id="book-email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="book-contact">Contact</Label>
            <Input
              id="book-contact"
              type="tel"
              value={contactNumber}
              autoComplete="tel"
              onChange={(event) => setContactNumber(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Waivers / policies</h2>
        <ul className="mt-4 space-y-4">
          {REQUIRED_POLICY_DOCUMENTS.map((doc) => {
            const key = `${doc.documentName}:${doc.version}`;
            return (
              <li key={key} className="rounded-xl border border-border p-4">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={Boolean(accepted[key])}
                    onChange={(event) =>
                      setAccepted((current) => ({ ...current, [key]: event.target.checked }))
                    }
                  />
                  <span>
                    <span className="font-medium">
                      {doc.documentName} v{doc.version}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {doc.placeholderNotice}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <Button
        type="button"
        disabled={!allAccepted}
        onClick={() => {
          setStatus("submitting");
          void getMockAdapter()
            .createBooking({
              customerId: profile.id,
              sessionId: session.id,
              policyAcceptances: REQUIRED_POLICY_DOCUMENTS.map((doc) => ({
                documentName: doc.documentName,
                version: doc.version,
                acceptedAt: MOCK_NOW_ISO,
              })),
            })
            .then((booking) => {
              if (waitlist || booking.status === "WAITLISTED") {
                router.push(`/portal/bookings/${booking.id}`);
                return;
              }
              router.push(`/portal/bookings/${booking.id}/payment`);
            });
        }}
      >
        {waitlist ? "Join waitlist" : "Continue to Payment"}
      </Button>
    </div>
  );
}
