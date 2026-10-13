"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminSession,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
} from "@balanse/domain";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminNowIso } from "@/lib/clock";
import { useMoveAdminSession } from "@/lib/query/mutations";
import { adminSessionRosterQuery } from "@/lib/query/queries";
import { useCanAdminAction, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import type { SessionTimeMove } from "../day-session-timeline/DaySessionTimeline.meta";

export function SessionMoveReview({
  move,
  sessions,
  onClose,
}: {
  move: SessionTimeMove;
  sessions: AdminSession[];
  onClose: () => void;
}) {
  const mutation = useMoveAdminSession();
  const [error, setError] = useState<string | null>(null);
  const actor = useStaffActor();
  const canReadRoster = useCanAdminAction("roster-read");
  const roster = useQuery({
    ...adminSessionRosterQuery(actor, apiFetchBrowser, move.session.id),
    enabled: canReadRoster,
  });
  const current = sessions.find((row) => row.id === move.session.id);
  const overlaps = sessions.filter(
    (row) =>
      row.id !== move.session.id &&
      row.status !== "CANCELLED" &&
      Date.parse(row.startsAt) < Date.parse(move.endsAt) &&
      Date.parse(row.endsAt) > Date.parse(move.startsAt) &&
      (row.venueId === move.session.venueId ||
        row.coaches.some((coach) =>
          move.session.coaches.some((assigned) => assigned.id === coach.id),
        )),
  );
  const booked = roster.data
    ? roster.data.confirmedCount + roster.data.heldCount
    : move.session.capacity - move.session.remainingSlots;
  async function confirm() {
    const now = Date.parse(adminNowIso());
    if (
      !current ||
      current.startsAt !== move.session.startsAt ||
      current.endsAt !== move.session.endsAt
    ) {
      setError(
        "This session changed while you were reviewing. Close this dialog and choose its new time again.",
      );
      return;
    }
    if (
      current.status === "CANCELLED" ||
      Date.parse(current.startsAt) <= now ||
      Date.parse(move.startsAt) <= now
    ) {
      setError("Sessions that have started cannot be moved. Choose a future session and time.");
      return;
    }
    try {
      setError(null);
      await mutation.mutateAsync({
        id: current.id,
        startsAt: move.startsAt,
        endsAt: move.endsAt,
        expectedStartsAt: current.startsAt,
        expectedEndsAt: current.endsAt,
      });
      notify.admin("session.saved");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The session could not be moved. Please try again.",
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg [&>*]:min-w-0"
        showCloseButton={!mutation.isPending}
      >
        <DialogTitle>Review time change</DialogTitle>
        <DialogDescription>
          {sessionDisplayName(move.session)} · {formatSessionDate(move.startsAt)}
        </DialogDescription>
        <dl className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Current time</dt>
            <dd>{formatSessionTimeRange(move.session.startsAt, move.session.endsAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">New time</dt>
            <dd className="font-semibold">{formatSessionTimeRange(move.startsAt, move.endsAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Affected bookings</dt>
            <dd>
              {canReadRoster && roster.isPending
                ? "Loading booking count…"
                : `${booked} booked ${booked === 1 ? "place" : "places"}${roster.data ? ` · ${roster.data.waitlistedCount} on the waitlist` : ""}`}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-muted-foreground">
          Existing bookings stay with this session. Its duration stays the same.
          {move.session.recurrenceRuleId
            ? " Only this occurrence moves; the weekly series stays as scheduled."
            : ""}
        </p>
        {overlaps.length ? (
          <div className="rounded-lg border border-border bg-secondary p-3 text-sm">
            <p className="font-semibold">Check overlapping sessions</p>
            <ul className="mt-1 list-disc pl-4">
              {overlaps.map((row) => (
                <li key={row.id}>
                  {sessionDisplayName(row)} · {formatSessionTimeRange(row.startsAt, row.endsAt)} (
                  {row.venueId === move.session.venueId ? "same venue" : "shared coach"})
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Overlaps are allowed. Confirm the coach and space are available.
            </p>
          </div>
        ) : null}
        {roster.isError && canReadRoster ? (
          <p className="text-sm text-destructive">
            Could not verify booking counts.{" "}
            <button type="button" className="underline" onClick={() => void roster.refetch()}>
              Retry
            </button>
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={mutation.isPending} onClick={onClose}>
            Keep current time
          </Button>
          <Button
            disabled={mutation.isPending || (canReadRoster && !roster.data)}
            onClick={() => void confirm()}
          >
            {mutation.isPending ? "Saving…" : "Confirm time change"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
