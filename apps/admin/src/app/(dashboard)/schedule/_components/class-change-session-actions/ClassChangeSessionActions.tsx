"use client";

import {
  type AdminSession,
  CLASS_CHANGE_KIND_META,
  CLASS_CHANGE_REQUEST_KINDS,
  CLASS_CHANGE_REVIEW_PERMISSIONS,
} from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { CalendarClockIcon, UserRoundCogIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { adminNowIso } from "@/lib/clock";
import { adminClassChangeRequestsQuery } from "@/lib/query/queries";
import { useStaffActor } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const KIND_ICON = {
  RESCHEDULE: CalendarClockIcon,
  SUBSTITUTE: UserRoundCogIcon,
  CANCEL: XCircleIcon,
} as const;

/**
 * Schedule panel block for coach class change requests (#337).
 * - Assigned coach without cancel rights: reschedule / substitute / cancel request entry points,
 *   or the status of their pending request.
 * - Reviewer: a notice when this class has a request waiting.
 */
export function ClassChangeSessionActions({
  session,
  canCancelDirectly,
}: {
  session: AdminSession;
  canCancelDirectly: boolean;
}) {
  const { principal } = useMockPrincipal();
  const actor = useStaffActor();
  const assigned = Boolean(
    actor?.coachId && session.coaches.some((coach) => coach.id === actor.coachId),
  );
  const canReview = CLASS_CHANGE_REVIEW_PERMISSIONS.some((key) => actor?.permissions.includes(key));
  const upcoming =
    session.status !== "CANCELLED" && Date.parse(session.startsAt) > Date.parse(adminNowIso());
  const showCoach = assigned && !canCancelDirectly && upcoming;
  const requestsQuery = useQuery({
    ...adminClassChangeRequestsQuery(principal),
    enabled: showCoach || canReview,
  });
  const pending = requestsQuery.data?.find(
    (row) => row.sessionId === session.id && row.status === "PENDING",
  );
  const changeHref = `/schedule/${session.id}/change`;

  if (showCoach) {
    return (
      <div className="grid gap-2 rounded-md border border-border bg-background p-3">
        <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Can&apos;t make it?
        </p>
        {pending ? (
          <div className="grid gap-2 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm" dot>
                Awaiting approval
              </Badge>
              <span>{CLASS_CHANGE_KIND_META[pending.kind].label} requested</span>
            </p>
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link href={changeHref} />}
            >
              View request
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Ask the studio. Nothing changes until an admin approves.
            </p>
            <div className="grid gap-1.5">
              {CLASS_CHANGE_REQUEST_KINDS.map((kind) => {
                const Icon = KIND_ICON[kind];
                return (
                  <Button
                    key={kind}
                    nativeButton={false}
                    variant={kind === "CANCEL" ? "ghost" : "outline"}
                    size="sm"
                    className="justify-start"
                    render={<Link href={`${changeHref}?kind=${kind.toLowerCase()}`} />}
                  >
                    <Icon aria-hidden />
                    {CLASS_CHANGE_KIND_META[kind].action}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  if (canReview && pending) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--balanse-gold)]/60 bg-[var(--balanse-gold)]/10 p-3 text-sm">
        <span>
          <span className="font-medium">{pending.requestedByName}</span> asked for a{" "}
          {CLASS_CHANGE_KIND_META[pending.kind].label.toLowerCase()}.
        </span>
        <Button nativeButton={false} size="sm" render={<Link href="/schedule/requests" />}>
          Review
        </Button>
      </div>
    );
  }

  return null;
}
