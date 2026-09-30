import {
  CLASS_CHANGE_KIND_META,
  CLASS_CHANGE_STATUS_LABELS,
  type ClassChangeRequest,
  type ClassChangeRequestStatus,
  formatSessionDate,
  formatSessionTime,
  formatSessionTimeRange,
} from "@balanse/domain";
import { Badge, cn } from "@balanse/ui";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import type * as React from "react";
import { AdminQueueFacts } from "@/components/balanse/queue/admin-queue-card/AdminQueueCard";

const STATUS_VARIANT: Record<
  ClassChangeRequestStatus,
  "warning" | "success" | "danger" | "neutral"
> = {
  PENDING: "warning",
  APPROVED: "success",
  DENIED: "danger",
  WITHDRAWN: "neutral",
};

function when(iso: string): string {
  return `${formatSessionDate(iso)} · ${formatSessionTime(iso)}`;
}

function slot(startsAt: string, endsAt: string): string {
  return `${formatSessionDate(startsAt)} · ${formatSessionTimeRange(startsAt, endsAt)}`;
}

/** One coach class change request: what was asked, why, and how it was decided. */
export function ClassChangeRequestCard({
  request,
  actions,
  className,
}: {
  request: ClassChangeRequest;
  actions?: React.ReactNode;
  className?: string;
}) {
  const pending = request.status === "PENDING";
  const kind = CLASS_CHANGE_KIND_META[request.kind];
  const facts =
    request.kind === "RESCHEDULE"
      ? [
          { label: "Now", value: slot(request.session.startsAt, request.session.endsAt) },
          {
            label: "Proposed",
            value:
              request.proposedStartsAt && request.proposedEndsAt
                ? slot(request.proposedStartsAt, request.proposedEndsAt)
                : "—",
          },
        ]
      : request.kind === "SUBSTITUTE"
        ? [
            { label: "When", value: slot(request.session.startsAt, request.session.endsAt) },
            {
              label: "Coach swap",
              value: (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {request.requestedByName}
                  <ArrowRightIcon className="size-3.5 text-muted-foreground" aria-hidden />
                  {request.substituteCoachName ?? "—"}
                </span>
              ),
            },
          ]
        : [
            { label: "When", value: slot(request.session.startsAt, request.session.endsAt) },
            { label: "If approved", value: "Class cancelled; bookings go to manual refunds" },
          ];

  return (
    <article
      data-slot="class-change-request-card"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      {pending ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary/70" />
      ) : null}
      <header className="grid gap-1.5 px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={request.kind === "CANCEL" ? "danger" : "neutral"} size="sm">
            {kind.label}
          </Badge>
          <Badge variant={STATUS_VARIANT[request.status]} size="sm" dot>
            {CLASS_CHANGE_STATUS_LABELS[request.status]}
          </Badge>
        </div>
        <h3 className="font-display text-xl leading-tight">{request.session.className}</h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Requested by {request.requestedByName}</span>
          <time className="inline-flex items-center gap-1 text-xs" dateTime={request.createdAt}>
            <ClockIcon className="size-3" aria-hidden />
            {when(request.createdAt)}
          </time>
        </p>
      </header>
      <div className="grid gap-4 border-t border-border/60 px-5 py-4 text-sm">
        <AdminQueueFacts items={facts} className="sm:grid-cols-2" />
        <blockquote className="border-l-2 border-[var(--balanse-gold)] pl-3 text-pretty">
          {request.reason}
        </blockquote>
        {request.status === "APPROVED" || request.status === "DENIED" ? (
          <p className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
            <span className="font-medium text-foreground">
              {request.status === "APPROVED" ? "Approved" : "Denied"} by{" "}
              {request.reviewedByName ?? "the studio"}
            </span>
            {request.reviewedAt ? ` · ${when(request.reviewedAt)}` : ""}
            {request.decisionNote ? (
              <span className="mt-1 block text-foreground">{request.decisionNote}</span>
            ) : null}
          </p>
        ) : null}
      </div>
      {actions ? (
        <footer className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/25 px-5 py-3">
          {actions}
        </footer>
      ) : null}
    </article>
  );
}
