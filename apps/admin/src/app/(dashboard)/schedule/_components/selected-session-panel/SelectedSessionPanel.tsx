"use client";

import {
  type AdminSession,
  auditConfirmationCopy,
  type computeSessionInventory,
  formatSessionDate,
  formatSessionTime,
  sessionDisplayName,
  sessionStatusLabel,
} from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { Repeat2 } from "lucide-react";
import Link from "next/link";
import { CoachOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { adminNowIso } from "@/lib/clock";
import { useCancelAdminSession } from "@/lib/query/mutations";
import { adminCoachesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { editSessionHref, rosterHref } from "../../_lib/schedule-href";

type Inventory = ReturnType<typeof computeSessionInventory>;

export function SelectedSessionPanel({
  session,
  inventory,
  daySessions,
  onSelectSession,
}: {
  session: AdminSession;
  inventory: Inventory;
  daySessions: AdminSession[];
  onSelectSession: (id: string) => void;
}) {
  const cancel = useCancelAdminSession();
  const { principal } = useMockPrincipal();
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const assignedCoaches = session.coaches.map(
    (coach) => coachesQuery.data?.find((row) => row.id === coach.id) ?? coach,
  );
  const canCancel = session.status !== "CANCELLED";

  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-display text-2xl">Selected Session</h2>
      {session.recurrenceRuleId ? (
        <Badge className="mt-2" variant="neutral">
          Recurring occurrence
        </Badge>
      ) : null}
      {daySessions.length > 1 ? (
        <ul className="mt-3 grid gap-1">
          {daySessions.map((row) => {
            const active = row.id === session.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onSelectSession(row.id)}
                >
                  <span className="min-w-0 truncate">
                    {sessionDisplayName(row)} · {formatSessionTime(row.startsAt)}
                  </span>
                  {active ? <Badge>Selected</Badge> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-3 text-sm">
        {sessionDisplayName(session)} · {formatSessionDate(session.startsAt)} ·{" "}
        {formatSessionTime(session.startsAt)}–{formatSessionTime(session.endsAt)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {assignedCoaches.map((coach) => (
          <CoachOption
            key={coach.id}
            coach={coach}
            layout="row"
            className="min-w-0 flex-1 text-foreground"
          />
        ))}
        <span>· {sessionStatusLabel(session.status)}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <InventoryStat label="Capacity" value={session.capacity} />
        <InventoryStat label="Confirmed" value={inventory.confirmed} />
        <InventoryStat label="Held" value={inventory.held} />
        <InventoryStat label="Waitlisted" value={inventory.waitlisted} />
        <InventoryStat label="Available" value={inventory.available} />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={rosterHref(session.id)} />}
        >
          View Roster
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={editSessionHref(session.id)} />}
        >
          Edit
        </Button>
        {canCancel && !session.recurrenceRuleId ? (
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href={`/schedule/${session.id}/recurrence`} />}
          >
            <Repeat2 className="size-4" aria-hidden />
            Make recurring
          </Button>
        ) : null}
        {canCancel ? (
          <ConfirmAction
            triggerLabel="Cancel Session"
            title="Cancel this session?"
            description={`${auditConfirmationCopy("Cancel session", "Admin", adminNowIso())} Affected bookings enter manual refund handling. The session stays in history.`}
            variant="outline"
            onConfirm={async () => {
              try {
                await cancel.mutateAsync(session.id);
                notify.admin("session.cancelled");
              } catch {
                notify.admin("session.cancel-failed");
              }
            }}
          />
        ) : null}
      </div>
    </aside>
  );
}

function InventoryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
