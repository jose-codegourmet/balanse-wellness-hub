"use client";

import type { CustomerBooking, PublicSession } from "@balanse/domain";
import {
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  manilaYmd,
  sessionAvailabilityLabel,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Alert, AlertDescription, AlertTitle, FeedbackState } from "@balanse/ui";
import { ArrowRight, Info, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { BookingSummary } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-booking.css";
import { Button } from "@/components/jabkit/button";
import { notify } from "@/modules/notifications/notify";

type SessionDay = { ymd: string; label: string; sessions: PublicSession[] };

function groupByDay(sessions: PublicSession[]): SessionDay[] {
  const days = new Map<string, SessionDay>();
  for (const session of sessions) {
    const ymd = manilaYmd(session.startsAt);
    const day = days.get(ymd);
    if (day) {
      day.sessions.push(session);
      continue;
    }
    days.set(ymd, { ymd, label: formatSessionDate(session.startsAt), sessions: [session] });
  }
  return [...days.values()];
}

function remainingLabel(session: PublicSession): string {
  if (session.remainingSlots <= 0) return "No spots left";
  return `${session.remainingSlots} of ${session.capacity} spots left`;
}

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
  const captionId = useId();
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  /**
   * Published sessions only, chronological, grouped by studio day. A cancelled
   * class is not something the studio could move anyone into, so it never
   * reaches the picker; every other open question stays with the studio (OQ-2).
   */
  const alternatives = useMemo(
    () =>
      sessions
        .filter((session) => session.id !== booking.sessionId && session.status === "PUBLISHED")
        .sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    [sessions, booking.sessionId],
  );
  const days = useMemo(() => groupByDay(alternatives), [alternatives]);
  const isEmpty = forcedStatus === "empty" || alternatives.length === 0;
  const selected = alternatives.find((session) => session.id === targetId) ?? null;
  const submitting = status === "submitting";

  return (
    <div className="portal-page portal-reschedule">
      <header className="portal-page-head">
        <p className="portal-eyebrow">My bookings</p>
        <h1 className="font-display">Request reschedule</h1>
        <p className="portal-page-lead">
          Pick a preferred new session. The studio reviews and resolves the request, and your
          current slot stays held until then.
        </p>
      </header>

      <div className="reschedule-layout">
        <section className="reschedule-current" aria-labelledby="reschedule-current-title">
          <div className="portal-section-title">
            <h2 id="reschedule-current-title">Current booking</h2>
          </div>
          <BookingSummary booking={booking} eyebrow="What you have now" headingLevel={3} />
        </section>

        <div className="reschedule-choice">
          {/* OQ-2 stays open, so the caveat is a standing advisory rather than
              body copy the eye slides past. Wording is unchanged. */}
          <Alert className="booking-advisory" data-advisory="informational">
            <Info aria-hidden="true" />
            <AlertTitle>The studio resolves this request</AlertTitle>
            <AlertDescription>
              Open rules such as same-class limits, price differences, cutoffs, and full-target
              behaviour are not applied here (OQ-2).
            </AlertDescription>
          </Alert>

          <fieldset className="reschedule-picker" disabled={submitting}>
            <legend className="reschedule-legend">
              <span className="portal-eyebrow">Step 2</span>
              <strong className="font-display">Select preferred new session</strong>
            </legend>

            {isEmpty ? (
              <FeedbackState
                id="calendar.no-sessions"
                title="No alternative sessions"
                description="There are no other published sessions to prefer right now. Your current slot stays held."
              />
            ) : (
              <>
                <div className="reschedule-days">
                  {days.map((day) => (
                    <div key={day.ymd}>
                      <p className="reschedule-day-label">{day.label}</p>
                      <ul className="reschedule-day-options">
                        {day.sessions.map((session) => {
                          const full =
                            session.remainingSlots <= 0 ||
                            session.availability === "full_with_waitlist";
                          const noteId = `${captionId}-${session.id}`;
                          return (
                            <li key={session.id}>
                              <label
                                className="reschedule-option"
                                data-availability={session.availability}
                                data-selectable={full ? "false" : "true"}
                              >
                                <input
                                  type="radio"
                                  name="target-session"
                                  value={session.id}
                                  checked={targetId === session.id}
                                  disabled={full}
                                  aria-describedby={noteId}
                                  onChange={() => setTargetId(session.id)}
                                />
                                <span className="reschedule-option-body">
                                  <span className="reschedule-option-title">
                                    {session.className}
                                  </span>
                                  <span className="reschedule-option-meta">
                                    {formatSessionTimeRange(session.startsAt, session.endsAt)} ·{" "}
                                    {session.coachName} · {formatPeso(session.pricePhp)}
                                  </span>
                                  <span className="reschedule-option-capacity" id={noteId}>
                                    {sessionAvailabilityLabel(session.availability)} ·{" "}
                                    {remainingLabel(session)}
                                    {full ? " · cannot be requested" : ""}
                                  </span>
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="reschedule-review" data-empty={selected ? "false" : "true"}>
                  {selected ? (
                    <>
                      <span className="reschedule-review-leg">
                        <span>Current</span>
                        <strong>{booking.session.className}</strong>
                        <small>
                          {formatSessionDate(booking.session.startsAt)} ·{" "}
                          {formatSessionTimeRange(booking.session.startsAt, booking.session.endsAt)}
                        </small>
                      </span>
                      <ArrowRight
                        className="reschedule-review-arrow"
                        size={18}
                        aria-hidden="true"
                      />
                      <span className="reschedule-review-leg">
                        <span>Preferred</span>
                        <strong>{selected.className}</strong>
                        <small>
                          {formatSessionDate(selected.startsAt)} ·{" "}
                          {formatSessionTimeRange(selected.startsAt, selected.endsAt)} ·{" "}
                          {formatPeso(selected.pricePhp)}
                        </small>
                      </span>
                    </>
                  ) : (
                    "Choose a session above and it appears here before you submit."
                  )}
                </div>

                <div className="reschedule-actions">
                  <p>
                    Submitting records a preference. Nothing on your current booking changes until
                    the studio resolves it.
                  </p>
                  <Button
                    type="button"
                    className="portal-pill-button"
                    disabled={!targetId || submitting}
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
                    {submitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{" "}
                        Submitting…
                      </>
                    ) : (
                      "Submit Reschedule Request"
                    )}
                  </Button>
                </div>
              </>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
