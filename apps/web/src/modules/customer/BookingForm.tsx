"use client";

import type { CustomerEntitlement, CustomerProfile, PublicSession } from "@balanse/domain";
import {
  bookingCreatedToastId,
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  formatSessionsRemaining,
  REQUIRED_POLICY_DOCUMENTS,
  sessionDisplayName,
} from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import { Button, Input, Label, LocalizedSkeleton, PhPhoneInput } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";

export function BookingForm({
  session,
  profile,
  entitlements = [],
  intent = "reserve",
  forcedStatus,
}: {
  session: PublicSession;
  profile: CustomerProfile;
  entitlements?: CustomerEntitlement[];
  intent?: "reserve" | "waitlist";
  forcedStatus?: "submitting";
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [entitlementId, setEntitlementId] = useState<string>(
    entitlements.length === 1 ? (entitlements[0]?.id ?? "") : "",
  );
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
            <dd>{sessionDisplayName(session)}</dd>
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
            <PhPhoneInput
              id="book-contact"
              value={contactNumber}
              autoComplete="tel"
              onChange={(event) => setContactNumber(event.target.value)}
            />
          </div>
        </div>
      </section>

      {entitlements.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl">Use a package</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {waitlist
              ? "Joining the waitlist does not hold a session. The intended package is checked again if a spot opens."
              : "Using a package holds one session credit with the spot. It does not skip capacity, cutoff, or confirmation."}
          </p>
          <fieldset className="mt-4 grid gap-3">
            <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
              <input
                type="radio"
                name="package"
                className="mt-1 size-4"
                checked={entitlementId === ""}
                onChange={() => setEntitlementId("")}
              />
              <span>Pay for this session instead</span>
            </label>
            {entitlements.map((row) => (
              <label
                key={row.id}
                className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm"
              >
                <input
                  type="radio"
                  name="package"
                  className="mt-1 size-4"
                  checked={entitlementId === row.id}
                  onChange={() => setEntitlementId(row.id)}
                />
                <span>
                  <span className="font-medium">{row.snapshot.name}</span>
                  <span className="mt-1 block text-muted-foreground">
                    {formatSessionsRemaining(row.remainingCredits)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </section>
      ) : null}

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
              entitlementId: waitlist ? null : entitlementId || null,
              intendedEntitlementId: waitlist ? entitlementId || null : null,
              policyAcceptances: REQUIRED_POLICY_DOCUMENTS.map((doc) => ({
                documentName: doc.documentName,
                version: doc.version,
                acceptedAt: MOCK_NOW_ISO,
              })),
            })
            .then((booking) => {
              notify.portal(bookingCreatedToastId(booking.status));
              if (waitlist || booking.status === "WAITLISTED" || booking.entitlementId) {
                router.push(`/portal/bookings/${booking.id}`);
                return;
              }
              router.push(`/portal/bookings/${booking.id}/payment`);
            })
            .catch(() => {
              notify.portal("package.action-failed");
              setStatus("idle");
            });
        }}
      >
        {waitlist
          ? "Join waitlist"
          : entitlementId
            ? "Reserve with package"
            : "Continue to Payment"}
      </Button>
    </div>
  );
}
