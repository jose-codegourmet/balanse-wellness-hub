"use client";

import { ApiError } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { CustomerBooking, PolicyDocumentVersion, PublicSession } from "@balanse/domain";
import {
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  manilaYmd,
  sessionAvailabilityLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Button, FeedbackState } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { BookingSummary } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-booking.css";
import { useCreateRescheduleRequest } from "@/lib/query/mutations/requests";
import { useAcceptPolicies } from "@/lib/query/policies";
import { publicSessionsQuery } from "@/lib/query/sessions";
import { notify } from "@/modules/notifications/notify";
import { SHOWCASE_SCHEDULE_RANGE } from "@/modules/schedule/showcase-range";
import { rescheduleFormDefaultValues } from "./RescheduleForm.defaults";
import { type RescheduleFormValues, rescheduleFormSchema } from "./RescheduleForm.schema";

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

function unavailableReason(session: PublicSession): string {
  switch (session.availability) {
    case "full_with_waitlist":
      return "Full — cannot request";
    case "past_cutoff":
      return "Booking cutoff has passed — cannot request";
    case "past":
      return "This session has ended — cannot request";
    case "cancelled":
      return "Cancelled — cannot request";
    default:
      return "Unavailable — cannot request";
  }
}

export function RescheduleForm({
  booking,
  policies = [],
}: {
  booking: CustomerBooking;
  /** Current versions of the policies admin attached to the reschedule form. */
  policies?: PolicyDocumentVersion[];
}) {
  const router = useRouter();
  const captionId = useId();
  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: rescheduleFormDefaultValues,
  });
  const request = useCreateRescheduleRequest(booking.customerId, booking.id);
  const acceptPolicies = useAcceptPolicies(booking.customerId);
  const policyAcceptance = usePolicyAcceptance(policies);
  const sessionsQuery = useQuery(publicSessionsQuery(SHOWCASE_SCHEDULE_RANGE, apiFetchBrowser));
  const sessions = sessionsQuery.data ?? [];
  const alternatives = useMemo(
    () =>
      sessions
        .filter((session) => session.id !== booking.sessionId && session.status === "PUBLISHED")
        .sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    [booking.sessionId, sessions],
  );
  const days = useMemo(() => groupByDay(alternatives), [alternatives]);
  const selected =
    alternatives.find((session) => session.id === form.watch("targetSessionId")) ?? null;
  const isEmpty = !sessionsQuery.isLoading && alternatives.length === 0;
  const submitting = request.isPending;

  const submit = ({ targetSessionId }: RescheduleFormValues) => {
    if (!policyAcceptance.check()) return;
    form.clearErrors("root");
    void request
      .mutateAsync(targetSessionId)
      .then(() => {
        if (policies.length > 0) {
          return acceptPolicies.mutateAsync({
            form: "reschedule",
            policyVersionIds: policies.map((p) => p.id),
            bookingId: booking.id,
          });
        }
      })
      .then(() => {
        notify.portal("reschedule.submitted");
        router.push(`/portal/bookings/${booking.id}`);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          if (error.code === "target_session_full" || error.code === "capacity_exceeded") {
            form.setError("targetSessionId", {
              type: error.code,
              message: "That session just filled. Choose another available session.",
            });
            return;
          }
          if (error.code === "cutoff" || error.code === "booking_cutoff_reached") {
            form.setError("targetSessionId", {
              type: error.code,
              message: "The booking cutoff for that session has passed. Choose another session.",
            });
            return;
          }
        }
        form.setError("root", {
          type: "request_failed",
          message: "We couldn't save your reschedule request. Try again.",
        });
      });
  };

  return (
    <main className="portal-page portal-reschedule">
      <header className="portal-page-head">
        <p className="portal-eyebrow">Booking confirmation</p>
        <h1 className="font-display">Request a reschedule</h1>
        <p className="portal-page-lead">
          Choose the session you prefer, then review it before submitting. The studio resolves the
          request, and your current slot stays held until then.
        </p>
      </header>

      <div className="reschedule-layout">
        <section className="reschedule-current" aria-labelledby="reschedule-current-title">
          <div className="portal-section-title">
            <h2 id="reschedule-current-title">Current booking</h2>
          </div>
          <BookingSummary booking={booking} eyebrow="What you have now" headingLevel={3} />
        </section>

        <form className="reschedule-choice" onSubmit={form.handleSubmit(submit)}>
          <Alert className="booking-advisory" data-advisory="informational">
            <Info aria-hidden="true" />
            <AlertTitle>The studio resolves this request</AlertTitle>
            <AlertDescription>
              Open rules such as same-class limits, price differences, cutoffs, and full-target
              behaviour are not applied here (OQ-2).
            </AlertDescription>
          </Alert>

          {form.formState.errors.root ? (
            <Alert className="booking-advisory" data-advisory="instruction" role="alert">
              <Info aria-hidden="true" />
              <AlertTitle>We couldn&apos;t save your request</AlertTitle>
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <fieldset className="reschedule-picker" disabled={submitting || sessionsQuery.isLoading}>
            <legend className="reschedule-legend">
              <span className="portal-eyebrow">Step 1 — Choose one</span>
              <strong className="font-display">Choose an available session</strong>
              <small>Sessions marked unavailable cannot be requested.</small>
            </legend>

            {sessionsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading available sessions…</p>
            ) : sessionsQuery.isError ? (
              <FeedbackState
                id="calendar.no-sessions"
                title="Sessions unavailable"
                description="We couldn't load alternative sessions. Please try again."
              />
            ) : isEmpty ? (
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
                          const selectable = session.reservable;
                          const noteId = `${captionId}-${session.id}`;
                          return (
                            <li key={session.id}>
                              <label
                                className="reschedule-option"
                                data-availability={session.availability}
                                data-selectable={selectable ? "true" : "false"}
                              >
                                <input
                                  type="radio"
                                  value={session.id}
                                  disabled={!selectable}
                                  aria-describedby={noteId}
                                  {...form.register("targetSessionId")}
                                />
                                <span className="reschedule-option-body">
                                  <span className="reschedule-option-title">
                                    {sessionDisplayName(session)}
                                  </span>
                                  {!selectable ? (
                                    <span className="reschedule-option-unavailable">
                                      {unavailableReason(session)}
                                    </span>
                                  ) : null}
                                  <span className="reschedule-option-meta">
                                    {formatSessionTimeRange(session.startsAt, session.endsAt)} ·{" "}
                                    {session.coachName} · {formatPeso(session.pricePhp)}
                                  </span>
                                  <span className="reschedule-option-capacity" id={noteId}>
                                    {sessionAvailabilityLabel(session.availability)} ·{" "}
                                    {remainingLabel(session)}
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
                {form.formState.errors.targetSessionId ? (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.targetSessionId.message}
                  </p>
                ) : null}
                <div className="reschedule-review" data-empty={selected ? "false" : "true"}>
                  {selected ? (
                    <>
                      <span className="reschedule-review-leg">
                        <span>Current</span>
                        <strong>{sessionDisplayName(booking.session)}</strong>
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
                        <strong>{sessionDisplayName(selected)}</strong>
                        <small>
                          {formatSessionDate(selected.startsAt)} ·{" "}
                          {formatSessionTimeRange(selected.startsAt, selected.endsAt)} ·{" "}
                          {formatPeso(selected.pricePhp)}
                        </small>
                      </span>
                    </>
                  ) : (
                    <span className="reschedule-review-empty">
                      <span>Step 2 — Review your request</span>
                      Choose an available session above. Your preferred new session appears here
                      before you submit.
                    </span>
                  )}
                </div>
              </>
            )}
          </fieldset>

          <div className="grid gap-2 text-sm">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0"
                disabled={submitting || sessionsQuery.isLoading}
                aria-invalid={form.formState.errors.acknowledgeReschedulePolicy ? true : undefined}
                {...form.register("acknowledgeReschedulePolicy")}
              />
              <span>
                I understand this is a request for studio review. My current booking stays held
                until the studio resolves the request.
              </span>
            </label>
            {form.formState.errors.acknowledgeReschedulePolicy ? (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.acknowledgeReschedulePolicy.message}
              </p>
            ) : null}
          </div>

          <PolicyAcceptance {...policyAcceptance.props} />

          <div className="reschedule-actions">
            <p>
              Submitting records a preference. Nothing on your current booking changes until the
              studio resolves it.
            </p>
            <div className="reschedule-action-buttons">
              <Button
                variant="secondary"
                nativeButton={false}
                render={<Link href={`/portal/bookings/${booking.id}`} />}
                disabled={submitting}
              >
                Back to booking
              </Button>
              <Button type="submit" disabled={isEmpty || sessionsQuery.isLoading || submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  "Submit reschedule request"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
