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
import { Button, LocalizedSkeleton } from "@balanse/ui";
import { CalendarDays, Check, Clock3, ShieldCheck, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
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
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <section className="overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
              <Ticket aria-hidden className="size-3.5" />
              {waitlist ? "Join the waitlist" : "Reserve your spot"}
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-4xl tracking-[-0.05em] sm:text-5xl">
              {sessionDisplayName(session)}
            </h1>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/74 sm:text-base">
              {waitlist
                ? "We will let you know if a space opens. No package session is held while you wait."
                : "You are one step away from making time for your next class."}
            </p>
          </div>
          <dl className="grid content-end gap-5 border-t border-primary-foreground/15 bg-primary-foreground/10 p-7 text-sm sm:p-10 lg:border-l lg:border-t-0">
            <div>
              <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                <CalendarDays aria-hidden className="size-3.5" /> Date
              </dt>
              <dd className="mt-2 font-medium">{formatSessionDate(session.startsAt)}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                <Clock3 aria-hidden className="size-3.5" /> Time
              </dt>
              <dd className="mt-2 font-medium">
                {formatSessionRange(session.startsAt, session.endsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                Session price
              </dt>
              <dd className="mt-2 font-medium">{formatPeso(session.pricePhp)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid gap-10">
          <section
            aria-labelledby="booking-account-heading"
            className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Your booking</p>
                <h2
                  id="booking-account-heading"
                  className="font-display mt-2 text-3xl tracking-[-0.04em]"
                >
                  Signed in and ready.
                </h2>
              </div>
              <span
                className="grid size-11 place-items-center rounded-full bg-secondary text-foreground"
                aria-hidden="true"
              >
                <UserRound className="size-5" />
              </span>
            </div>
            <div className="mt-7 grid gap-1 border-l-2 border-[var(--balanse-gold)] pl-4 text-sm">
              <strong className="font-medium">{profile.fullName}</strong>
              <span className="text-muted-foreground">{profile.email}</span>
              <span className="text-muted-foreground">{profile.contactNumber}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <p className="text-xs leading-5 text-muted-foreground">
                This reservation is linked to your account. You can only book for yourself.
              </p>
              <Link
                href="/portal/profile"
                className="shrink-0 text-xs font-semibold underline underline-offset-4"
              >
                Update details
              </Link>
            </div>
          </section>

          <section aria-labelledby="session-details-heading">
            <p className="text-sm font-semibold text-muted-foreground">Class details</p>
            <h2
              id="session-details-heading"
              className="font-display mt-2 text-3xl tracking-[-0.04em]"
            >
              A quick look at your class.
            </h2>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-[1.25rem] border border-border bg-border text-sm sm:grid-cols-2">
              <div className="bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Class
                </dt>
                <dd className="mt-2 font-medium">{sessionDisplayName(session)}</dd>
              </div>
              <div className="bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Coaches
                </dt>
                <dd className="mt-2 font-medium">{session.coachName}</dd>
              </div>
            </dl>
          </section>

          {entitlements.length > 0 ? (
            <section aria-labelledby="package-choice-heading">
              <p className="text-sm font-semibold text-muted-foreground">Choose how to reserve</p>
              <h2
                id="package-choice-heading"
                className="font-display mt-2 text-3xl tracking-[-0.04em]"
              >
                Use a package
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {waitlist
                  ? "Joining the waitlist does not hold a session. The intended package is checked again if a spot opens."
                  : "Using a package holds one session credit with the spot. It does not skip capacity, cutoff, or confirmation."}
              </p>
              <fieldset className="mt-6 grid gap-3">
                <label className="flex items-start gap-3 rounded-[1.15rem] border border-border bg-card p-5 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-secondary/35">
                  <input
                    type="radio"
                    name="package"
                    className="mt-1 size-4"
                    checked={entitlementId === ""}
                    onChange={() => setEntitlementId("")}
                  />
                  <span>
                    <span className="font-medium">Pay for this session instead</span>
                    <span className="mt-1 block text-muted-foreground">
                      Continue with the standard payment flow.
                    </span>
                  </span>
                </label>
                {entitlements.map((row) => (
                  <label
                    key={row.id}
                    className="flex items-start gap-3 rounded-[1.15rem] border border-border bg-card p-5 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-secondary/35"
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

          <section aria-labelledby="booking-policies-heading">
            <p className="text-sm font-semibold text-muted-foreground">Before you reserve</p>
            <h2
              id="booking-policies-heading"
              className="font-display mt-2 text-3xl tracking-[-0.04em]"
            >
              Waivers and policies
            </h2>
            <ul className="mt-6 grid gap-3">
              {REQUIRED_POLICY_DOCUMENTS.map((doc) => {
                const key = `${doc.documentName}:${doc.version}`;
                return (
                  <li key={key} className="rounded-[1.15rem] border border-border bg-card p-5">
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
            className="w-full rounded-full sm:w-auto"
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
                : "Continue to payment"}
          </Button>
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-border bg-secondary/45 p-6 lg:sticky lg:top-8">
          <ShieldCheck aria-hidden className="size-5 text-[var(--balanse-gold-deep)]" />
          <h2 className="font-display mt-5 text-2xl tracking-[-0.035em]">
            A considered reservation
          </h2>
          <ul className="mt-6 grid gap-4 text-xs leading-5 text-muted-foreground">
            <li className="flex gap-3">
              <Check
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
              />
              You are reserving a scheduled class, not an individual coach.
            </li>
            <li className="flex gap-3">
              <Check
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
              />
              Your package is only used if it is eligible for this class.
            </li>
            <li className="flex gap-3">
              <Check
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
              />
              Studio capacity and booking cutoffs always apply.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
