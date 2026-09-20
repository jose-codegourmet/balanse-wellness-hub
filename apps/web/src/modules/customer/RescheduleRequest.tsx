"use client";

import type { CustomerBooking, PublicSession } from "@balanse/domain";
import { formatPeso, formatSessionDate, formatSessionRange } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";

export function RescheduleRequest({
  booking,
  sessions,
  forcedStatus,
}: {
  booking: CustomerBooking;
  sessions: PublicSession[];
  forcedStatus?: "submitting" | "empty";
}) {
  const router = useRouter();
  const alternatives = sessions.filter((session) => session.id !== booking.sessionId);
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  if (status === "submitting") {
    return <LocalizedSkeleton lines={4} label="Submitting reschedule request" />;
  }

  if (forcedStatus === "empty" || alternatives.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Request reschedule</h1>
        <div className="mt-6">
          <FeedbackState
            id="calendar.no-sessions"
            title="No alternative sessions"
            description="There are no other published sessions to prefer right now. Your current slot stays held."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">Request reschedule</h1>
      <section>
        <h2 className="font-display text-2xl">Current booking</h2>
        <p className="mt-2 text-sm">
          {booking.session.className} · {formatSessionDate(booking.session.startsAt)} ·{" "}
          {booking.session.coachName} · {formatPeso(booking.session.pricePhp)}
        </p>
      </section>
      <p className="text-sm">
        Pick a preferred new session. The studio reviews and resolves the request. Open rules such
        as same-class limits, price differences, cutoffs, and full-target behaviour are not applied
        here (OQ-2).
      </p>
      <fieldset className="grid gap-3">
        <legend className="font-display text-2xl">Select preferred new session</legend>
        {alternatives.map((session) => {
          const full = session.remainingSlots <= 0 || session.availability === "full_with_waitlist";
          return (
            <label
              key={session.id}
              className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm"
            >
              <input
                type="radio"
                name="target-session"
                value={session.id}
                checked={targetId === session.id}
                onChange={() => setTargetId(session.id)}
              />
              <span>
                <span className="font-medium">{session.className}</span>
                <span className="mt-1 block text-muted-foreground">
                  {formatSessionRange(session.startsAt, session.endsAt)} · {session.coachName}
                  {full ? " · Full" : ""}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <Button
        type="button"
        disabled={!targetId}
        onClick={() => {
          setStatus("submitting");
          void getMockAdapter()
            .createRescheduleRequest(booking.id, targetId)
            .then(() => {
              notify.portal("reschedule.submitted");
              router.push(`/portal/bookings/${booking.id}`);
            });
        }}
      >
        Submit Reschedule Request
      </Button>
    </div>
  );
}
