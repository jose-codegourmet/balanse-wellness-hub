"use client";

import {
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  sessionDisplayName,
} from "@balanse/domain";
import { CalendarSkeleton, FeedbackState, type ScheduleCalendarProps } from "@balanse/ui";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/jabkit/button";

export function BalanseQuickBooking({
  sessions,
  classes,
  nowIso,
  initialClassFilter = "all",
  initialCoachFilter = "all",
  loading,
  loadError,
  onRetry,
  onReserve,
  sessionBecameFullId,
}: ScheduleCalendarProps) {
  const [step, setStep] = useState(0);
  const [classId, setClassId] = useState(initialClassFilter);
  const [sessionId, setSessionId] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const available = sessions
    .filter(
      (session) =>
        new Date(session.startsAt) > new Date(nowIso) &&
        (session.reservable || session.availability === "full_with_waitlist") &&
        (initialCoachFilter === "all" ||
          session.coaches.some((coach) => coach.id === initialCoachFilter)) &&
        session.id !== sessionBecameFullId,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const matching = available.filter((session) => classId === "all" || session.classId === classId);
  const selected = matching.find((session) => session.id === sessionId);
  const className = classes.find((item) => item.id === classId)?.name ?? "Any class";

  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus();
      previousStep.current = step;
    }
  }, [step]);

  if (loading) return <CalendarSkeleton />;
  if (loadError) return <FeedbackState id="calendar.load-failed" onAction={onRetry} />;

  return (
    <div className="quick-booking">
      <ol className="quick-booking-progress" aria-label="Booking steps">
        {["Class", "Time", "Review"].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            data-complete={step > index}
          >
            <span>{step > index ? <Check size={12} aria-hidden="true" /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <h3 ref={heading} tabIndex={-1} className="quick-booking-title">
        {
          ["What would you like to try?", "Find a time for yourself.", "A moment just for you."][
            step
          ]
        }
      </h3>
      {step === 0 ? (
        <>
          <p className="quick-booking-description">
            Choose your practice. We’ll find the next available times.
          </p>
          <label className="quick-booking-label" htmlFor="quick-class">
            Your class
          </label>
          <select
            id="quick-class"
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setSessionId("");
            }}
          >
            <option value="all">I’m open to anything</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="quick-availability" role="status">
            {matching.length
              ? `${matching.length} upcoming ${matching.length === 1 ? "session" : "sessions"} to explore${initialCoachFilter !== "all" ? " with your selected coach" : ""}.`
              : "No bookable sessions for this selection yet. Try another class or explore the calendar."}
          </p>
          <Button
            className="quick-booking-primary"
            disabled={!matching.length}
            onClick={() => setStep(1)}
          >
            Find a time <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </>
      ) : step === 1 ? (
        <>
          <p className="quick-booking-description">{className} · Philippine time</p>
          <fieldset className="quick-session-list">
            <legend className="sr-only">Choose a session</legend>
            {matching.map((session) => (
              <label
                key={session.id}
                className="quick-session-option"
                data-selected={sessionId === session.id}
              >
                <input
                  type="radio"
                  name="quick-session"
                  value={session.id}
                  checked={sessionId === session.id}
                  onChange={() => setSessionId(session.id)}
                />
                <span className="quick-session-copy">
                  <strong>
                    {formatSessionDate(session.startsAt)} · {formatSessionTime(session.startsAt)}
                  </strong>
                  <span>
                    {sessionDisplayName(session)} with {session.coachName}
                  </span>
                </span>
                <span className="quick-session-price">
                  {formatPeso(session.pricePhp)}
                  <small>
                    {session.availability === "full_with_waitlist"
                      ? "Waitlist"
                      : `${session.remainingSlots} spots left`}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          {!matching.length ? (
            <p role="status" className="quick-availability">
              These sessions are no longer available. Choose another class.
            </p>
          ) : null}
          <div className="quick-booking-actions">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </Button>
            <Button disabled={!selected} onClick={() => setStep(2)}>
              Review class <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : selected ? (
        <>
          <div className="quick-booking-review">
            <p className="marketing-eyebrow">
              {selected.availability === "full_with_waitlist"
                ? "Waitlist request"
                : "Your selected class"}
            </p>
            <h4>{sessionDisplayName(selected)}</h4>
            <p>with {selected.coachName}</p>
            <div>
              <Clock3 size={16} aria-hidden="true" />
              <span>
                {formatSessionDate(selected.startsAt)}
                <br />
                {formatSessionTime(selected.startsAt)}–{formatSessionTime(selected.endsAt)}
              </span>
            </div>
            <footer>
              <span>Per person</span>
              <strong>{formatPeso(selected.pricePhp)}</strong>
            </footer>
          </div>
          <p className="quick-booking-description">
            {selected.availability === "full_with_waitlist"
              ? "This class is full. Continue to request a place on the waitlist."
              : "Continue to enter your details and reserve your space."}
          </p>
          <div className="quick-booking-actions">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </Button>
            <Button onClick={() => onReserve?.(selected)}>
              {selected.availability === "full_with_waitlist"
                ? "Join waitlist"
                : "Continue to booking"}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="quick-availability" role="status">
            This session is no longer available. Please choose another time.
          </p>
          <Button onClick={() => setStep(1)}>Choose another time</Button>
        </>
      )}
    </div>
  );
}
