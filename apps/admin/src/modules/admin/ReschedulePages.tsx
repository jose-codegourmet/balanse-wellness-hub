"use client";

import {
  auditConfirmationCopy,
  type CustomerBooking,
  computeSessionInventory,
  formatRelativeTime,
  formatSessionDate,
  formatSessionTimeRange,
  type PublicSession,
  RESCHEDULE_HISTORY_NOTE,
  sessionDisplayName,
} from "@balanse/domain";
import {
  Badge,
  cn,
  FeedbackState,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@balanse/ui";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminQueueCard } from "@/components/balanse/queue/admin-queue-card/AdminQueueCard";
import { AdminQueueList } from "@/components/balanse/queue/admin-queue-list/AdminQueueList";
import { adminNowIso } from "@/lib/clock";
import { useApproveAdminReschedule, useRejectAdminReschedule } from "@/lib/query/mutations";
import { adminBookingsQuery, adminReschedulesInfiniteQuery } from "@/lib/query/queries";
import { checkCanApproveReschedule } from "@/modules/admin/forms/session/session-form.schema";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const EXIT_MS = 220;

export type RescheduleQueueFocus = "approvable" | "blocked" | "cancelled-target";

export type RescheduleQueuePageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  fetchingNextPage?: boolean;
  nextPageError?: boolean;
  focus?: RescheduleQueueFocus;
};

function requestAge(row: CustomerBooking, nowIso: string): string {
  const iso = row.requestCreatedAt ?? row.createdAt;
  return formatRelativeTime(iso, nowIso) || "—";
}

function isCancelledTarget(target: PublicSession): boolean {
  return target.status === "CANCELLED" || target.availability === "cancelled";
}

function approveBlockReason(target: PublicSession | null | undefined): string | null {
  if (!target) return "No target session recorded. This request cannot be approved.";
  if (isCancelledTarget(target)) {
    return "The requested session is cancelled. This request cannot be approved.";
  }
  const allowed = checkCanApproveReschedule(target);
  return allowed.ok ? null : allowed.error;
}

function applyFocus(rows: CustomerBooking[], focus?: RescheduleQueueFocus): CustomerBooking[] {
  if (!focus) return rows;
  if (focus === "cancelled-target") {
    const row = rows[0];
    if (!row) return rows;
    if (!row.targetSession) return [row];
    return [
      {
        ...row,
        targetSession: {
          ...row.targetSession,
          status: "CANCELLED",
          availability: "cancelled",
          reservable: false,
        },
      },
    ];
  }
  if (focus === "blocked") {
    const blocked = rows.find((row) => {
      const target = row.targetSession;
      return !target || !checkCanApproveReschedule(target).ok;
    });
    return blocked ? [blocked] : rows.slice(0, 1);
  }
  const open = rows.find((row) => {
    const target = row.targetSession;
    return Boolean(target && !isCancelledTarget(target) && checkCanApproveReschedule(target).ok);
  });
  return open ? [open] : rows.slice(0, 1);
}

function SessionMoveSide({
  label,
  session,
  inventory,
  warning,
}: {
  label: string;
  session: PublicSession | null | undefined;
  inventory?: ReturnType<typeof computeSessionInventory> | null;
  warning?: string | null;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border border-border p-3",
        warning && "border-destructive/40 bg-destructive/5",
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      {session ? (
        <>
          <p className="mt-2 text-pretty font-medium wrap-break-word">
            {sessionDisplayName(session)}
          </p>
          <p className="text-pretty wrap-break-word text-muted-foreground">
            {formatSessionDate(session.startsAt)}
          </p>
          <p className="text-pretty wrap-break-word">
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
          <p className="text-pretty wrap-break-word">{session.coachName}</p>
          {inventory ? (
            <p className="mt-2 text-xs text-pretty wrap-break-word text-muted-foreground">
              {inventory.confirmed} confirmed · {inventory.held} held · {session.capacity} capacity
              · {inventory.available} open
            </p>
          ) : null}
          {session.status === "CANCELLED" || session.availability === "cancelled" ? (
            <Badge appearance="soft" size="sm" className="mt-2">
              Cancelled
            </Badge>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-sm">No target session recorded.</p>
      )}
      {warning ? <p className="mt-2 text-sm text-destructive">{warning}</p> : null}
    </div>
  );
}

function RescheduleRequestCard({
  row,
  stamp,
  nowIso,
  leaving,
  onLeaving,
  bookings,
  inventoryReady,
}: {
  row: CustomerBooking;
  stamp: string;
  nowIso: string;
  leaving: boolean;
  onLeaving: (row: CustomerBooking) => void;
  bookings: CustomerBooking[];
  inventoryReady: boolean;
}) {
  const approve = useApproveAdminReschedule();
  const reject = useRejectAdminReschedule();
  const busy = approve.isPending || reject.isPending;
  const target = row.targetSession;
  const blockReason = approveBlockReason(target);
  const canApprove = !blockReason;
  const inventory =
    target && inventoryReady
      ? computeSessionInventory(
          target,
          bookings.filter((booking) => booking.sessionId === target.id),
        )
      : null;

  async function run(
    action: () => Promise<unknown>,
    success: "reschedule.approved" | "reschedule.rejected",
  ) {
    try {
      await action();
      notify.admin(success);
      onLeaving(row);
    } catch {
      notify.admin("reschedule.action-failed");
    }
  }

  const approveTrigger = (
    <ConfirmAction
      triggerLabel="Approve & Move"
      title="Approve and move this booking?"
      description={`${stamp} ${RESCHEDULE_HISTORY_NOTE}`}
      disabled={busy || leaving || !canApprove}
      onConfirm={() => run(() => approve.mutateAsync(row.id), "reschedule.approved")}
    />
  );

  return (
    <div
      className={cn(
        leaving &&
          "pointer-events-none motion-safe:animate-out motion-safe:fade-out-0 motion-safe:slide-out-to-top-2 motion-safe:duration-200 motion-reduce:animate-none",
      )}
    >
      <AdminQueueCard
        who={row.customerName}
        what={`${sessionDisplayName(row.session)} · ${formatSessionDate(row.session.startsAt)}`}
        when={requestAge(row, nowIso)}
        status={row.status}
        emphasis
        body={
          <div className="grid gap-3">
            <p className="sr-only">
              Requested move from {sessionDisplayName(row.session)} to{" "}
              {target ? sessionDisplayName(target) : "an unspecified session"}
            </p>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
              <SessionMoveSide label="From" session={row.session} />
              <div className="flex items-center justify-center py-0.5 sm:px-1 sm:py-0" aria-hidden>
                <ArrowDown className="size-4 text-muted-foreground sm:hidden" />
                <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
              </div>
              <SessionMoveSide
                label="To"
                session={target}
                inventory={inventory}
                warning={blockReason}
              />
            </div>
          </div>
        }
        actions={
          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {canApprove ? (
                approveTrigger
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger render={<span className="inline-flex max-w-full" />}>
                      {approveTrigger}
                    </TooltipTrigger>
                    <TooltipContent>{blockReason}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <ConfirmAction
                triggerLabel="Reject"
                title="Reject this reschedule request?"
                description={stamp}
                variant="outline"
                requireReason
                reasonLabel="Reason"
                reasonPlaceholder="Tell the customer why this request is rejected."
                disabled={busy || leaving}
                onConfirm={(adminReason) =>
                  run(
                    () =>
                      reject.mutateAsync({
                        bookingId: row.id,
                        reason: adminReason ?? "",
                      }),
                    "reschedule.rejected",
                  )
                }
              />
            </div>
            {!canApprove ? <p className="text-xs text-muted-foreground">{blockReason}</p> : null}
          </div>
        }
      />
    </div>
  );
}

export function RescheduleQueuePage({
  empty,
  loading,
  error,
  fetchingNextPage,
  nextPageError,
  focus,
}: RescheduleQueuePageProps) {
  const { principal } = useMockPrincipal();
  const query = useInfiniteQuery(adminReschedulesInfiniteQuery(principal.role));
  const bookingsQuery = useQuery(adminBookingsQuery(principal.role));
  const nowIso = adminNowIso();
  const stamp = auditConfirmationCopy("This reschedule action", "Admin", nowIso);
  const [exiting, setExiting] = useState<Map<string, CustomerBooking>>(new Map());

  const queried = useMemo(
    () => applyFocus(query.data?.pages.flatMap((page) => page.items) ?? [], focus),
    [focus, query.data],
  );

  const onLeaving = useCallback((row: CustomerBooking) => {
    setExiting((current) => {
      const next = new Map(current);
      next.set(row.id, row);
      return next;
    });
  }, []);

  useEffect(() => {
    if (exiting.size === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => {
        setExiting((current) => {
          const next = new Map(current);
          for (const id of current.keys()) {
            if (!queried.some((row) => row.id === id)) next.delete(id);
          }
          return next;
        });
      },
      reduced ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [exiting, queried]);

  const items = useMemo(() => {
    if (empty || loading || error) return [];
    const queriedIds = new Set(queried.map((row) => row.id));
    const lingering = [...exiting.values()].filter((row) => !queriedIds.has(row.id));
    return [...queried, ...lingering];
  }, [empty, error, exiting, loading, queried]);

  const totalCount =
    empty || error ? 0 : focus ? items.length : (query.data?.pages[0]?.totalCount ?? items.length);
  const bookings = bookingsQuery.data ?? [];

  return (
    <AdminPageShell title="Reschedule Requests">
      <p className="max-w-2xl text-sm text-muted-foreground">{RESCHEDULE_HISTORY_NOTE}</p>
      <AdminQueueList
        className="mt-6"
        label="Reschedule requests"
        items={items}
        totalCount={totalCount}
        getItemKey={(row) => row.id}
        estimateSize={360}
        renderItem={(row) => (
          <RescheduleRequestCard
            row={row}
            stamp={stamp}
            nowIso={nowIso}
            leaving={exiting.has(row.id)}
            onLeaving={onLeaving}
            bookings={bookings}
            inventoryReady={bookingsQuery.isSuccess}
          />
        )}
        hasNextPage={!empty && !error && !focus && Boolean(query.hasNextPage)}
        isFetchingNextPage={fetchingNextPage || query.isFetchingNextPage}
        fetchNextPage={() => {
          void query.fetchNextPage();
        }}
        loading={Boolean(loading) || (!empty && !error && query.isPending)}
        error={
          error || query.isError ? (
            <FeedbackState
              id="calendar.load-failed"
              title="Could not load reschedule requests"
              description="Try again. Requests already on this page stay put if a later page fails."
              actionLabel="Retry"
              onAction={() => {
                void query.refetch();
              }}
            />
          ) : undefined
        }
        nextPageError={
          nextPageError || query.isFetchNextPageError ? (
            <FeedbackState
              id="calendar.load-failed"
              title="Could not load more requests"
              description="The first page is still here. Try again without losing what you already reviewed."
              actionLabel="Retry"
              onAction={() => {
                void query.fetchNextPage();
              }}
            />
          ) : undefined
        }
        empty={<FeedbackState id="admin.no-reschedule-requests" />}
      />
    </AdminPageShell>
  );
}
