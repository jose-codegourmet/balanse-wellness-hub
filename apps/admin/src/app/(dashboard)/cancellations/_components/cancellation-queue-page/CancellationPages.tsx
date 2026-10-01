"use client";

import {
  auditConfirmationCopy,
  bookingReference,
  type CustomerBooking,
  formatRelativeTime,
  formatSessionDate,
  MANUAL_REFUND_NOTE,
  paymentStatusLabel,
  SLOT_LOCKED_UNTIL_CANCEL_NOTE,
  sessionDisplayName,
} from "@balanse/domain";
import { Badge, cn, FeedbackState, Input, StatusBadge } from "@balanse/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  AdminQueueCard,
  AdminQueueFacts,
} from "@/components/balanse/queue/admin-queue-card/AdminQueueCard";
import { AdminQueueCount } from "@/components/balanse/queue/admin-queue-count/AdminQueueCount";
import { AdminQueueList } from "@/components/balanse/queue/admin-queue-list/AdminQueueList";
import { adminNowIso } from "@/lib/clock";
import {
  useCompleteAdminCancellation,
  useMarkRefunded,
  useMarkRefundPending,
  useRejectAdminCancellation,
} from "@/lib/query/mutations";
import { adminCancellationsInfiniteQuery } from "@/lib/query/queries";
import { AdminCan } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const EXIT_MS = 220;

export type CancellationQueuePageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  fetchingNextPage?: boolean;
  nextPageError?: boolean;
};

function requestAge(row: CustomerBooking, nowIso: string): string {
  const iso = row.requestCreatedAt ?? row.createdAt;
  return formatRelativeTime(iso, nowIso) || "—";
}

function CancellationRequestCard({
  row,
  stamp,
  nowIso,
  leaving,
  onLeaving,
}: {
  row: CustomerBooking;
  stamp: string;
  nowIso: string;
  leaving: boolean;
  onLeaving: (row: CustomerBooking) => void;
}) {
  const complete = useCompleteAdminCancellation();
  const reject = useRejectAdminCancellation();
  const markPending = useMarkRefundPending();
  const markRefunded = useMarkRefunded();
  const busy =
    complete.isPending || reject.isPending || markPending.isPending || markRefunded.isPending;
  const reason = row.cancellationReason?.trim() ?? "";
  async function runResolution(
    action: () => Promise<unknown>,
    success: "cancellation.completed" | "cancellation.rejected",
  ) {
    try {
      await action();
      notify.admin(success);
      onLeaving(row);
    } catch {
      notify.admin("cancellation.action-failed");
    }
  }

  async function runRefund(action: () => Promise<unknown>) {
    try {
      await action();
      notify.admin("refund.status-updated");
    } catch {
      notify.admin("refund.action-failed");
    }
  }

  return (
    <div
      className={cn(
        leaving &&
          "pointer-events-none motion-safe:animate-out motion-safe:fade-out-0 motion-safe:slide-out-to-top-2 motion-safe:duration-200 motion-reduce:animate-none",
      )}
    >
      <AdminQueueCard
        who={row.customerName}
        reference={bookingReference(row.id)}
        what={`${sessionDisplayName(row.session)} · ${formatSessionDate(row.session.startsAt)}`}
        when={requestAge(row, nowIso)}
        status={row.status}
        emphasis
        body={
          <div className="grid gap-4">
            <figure className="rounded-xl bg-muted/50 px-4 py-3">
              <figcaption className="text-xs font-medium text-muted-foreground">
                Customer’s reason
              </figcaption>
              {reason ? (
                <blockquote className="mt-1 text-pretty wrap-break-word text-sm leading-relaxed italic">
                  “{reason}”
                </blockquote>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">No reason given.</p>
              )}
            </figure>
            <AdminQueueFacts
              items={[
                {
                  label: "Payment",
                  value: (
                    <Badge appearance="soft" size="sm">
                      {paymentStatusLabel(row.paymentStatus)}
                    </Badge>
                  ),
                },
                ...(row.refundStatus === "REFUND_PENDING" || row.refundStatus === "REFUNDED"
                  ? [
                      {
                        label: "Refund",
                        value: <StatusBadge status={row.refundStatus} surface="admin" />,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        }
        actions={
          <div className="flex w-full min-w-0 flex-col gap-3">
            <AdminCan action="cancellations-manage">
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Complete Cancellation"
                  title="Complete cancellation?"
                  description={`${stamp} ${SLOT_LOCKED_UNTIL_CANCEL_NOTE}`}
                  disabled={busy || leaving}
                  onConfirm={() =>
                    runResolution(() => complete.mutateAsync(row.id), "cancellation.completed")
                  }
                />
                <ConfirmAction
                  triggerLabel="Reject Request"
                  title="Reject cancellation request?"
                  description={stamp}
                  variant="outline"
                  requireReason
                  reasonLabel="Reason"
                  reasonPlaceholder="Tell the customer why this request is rejected."
                  disabled={busy || leaving}
                  onConfirm={(adminReason) =>
                    runResolution(
                      () =>
                        reject.mutateAsync({
                          bookingId: row.id,
                          reason: adminReason ?? "",
                        }),
                      "cancellation.rejected",
                    )
                  }
                />
              </div>
            </AdminCan>
            <AdminCan action="refunds-manage">
              <div className="flex w-full min-w-0 flex-col gap-2 border-t border-border/60 pt-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Refund status.</span>{" "}
                  {MANUAL_REFUND_NOTE}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ConfirmAction
                    triggerLabel="Mark Refund Pending"
                    title="Mark refund pending?"
                    description={`${stamp} Refund status is separate from cancellation. ${MANUAL_REFUND_NOTE}`}
                    variant="outline"
                    disabled={busy || leaving || row.refundStatus === "REFUND_PENDING"}
                    onConfirm={() => runRefund(() => markPending.mutateAsync(row.id))}
                  />
                  <ConfirmAction
                    triggerLabel="Mark Refunded"
                    title="Mark refunded?"
                    description={`${stamp} ${MANUAL_REFUND_NOTE}`}
                    variant="outline"
                    disabled={busy || leaving || row.refundStatus === "REFUNDED"}
                    onConfirm={() => runRefund(() => markRefunded.mutateAsync(row.id))}
                  />
                </div>
              </div>
            </AdminCan>
          </div>
        }
      />
    </div>
  );
}

export function CancellationQueuePage({
  empty,
  loading,
  error,
  fetchingNextPage,
  nextPageError,
}: CancellationQueuePageProps) {
  const { principal } = useMockPrincipal();
  const [search, setSearch] = useState("");
  const query = useInfiniteQuery(adminCancellationsInfiniteQuery(principal, search.trim()));
  const nowIso = adminNowIso();
  const stamp = auditConfirmationCopy("This cancellation action", "Admin", nowIso);
  const [exiting, setExiting] = useState<Map<string, CustomerBooking>>(new Map());

  const queried = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
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

  const totalCount = empty || error ? 0 : (query.data?.pages[0]?.totalCount ?? items.length);

  return (
    <AdminPageShell
      eyebrow="Operations queue"
      title="Cancellation Requests"
      description={SLOT_LOCKED_UNTIL_CANCEL_NOTE}
      actions={<AdminQueueCount count={totalCount} label="open requests" />}
    >
      <Input
        type="search"
        aria-label="Search cancellation requests by customer or reference"
        placeholder="Search customer or reference"
        className="mb-4 w-full max-w-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <AdminQueueList
        label="Cancellation requests"
        items={items}
        totalCount={totalCount}
        getItemKey={(row) => row.id}
        estimateSize={280}
        renderItem={(row) => (
          <CancellationRequestCard
            row={row}
            stamp={stamp}
            nowIso={nowIso}
            leaving={exiting.has(row.id)}
            onLeaving={onLeaving}
          />
        )}
        hasNextPage={!empty && !error && Boolean(query.hasNextPage)}
        isFetchingNextPage={fetchingNextPage || query.isFetchingNextPage}
        fetchNextPage={() => {
          void query.fetchNextPage();
        }}
        loading={Boolean(loading) || (!empty && !error && query.isPending)}
        error={
          error || query.isError ? (
            <FeedbackState
              id="calendar.load-failed"
              title="Could not load cancellation requests"
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
        empty={
          <FeedbackState
            id="admin.no-cancellation-requests"
            title={search.trim() ? "No matching cancellation requests" : undefined}
            description={search.trim() ? "Try another customer or booking reference." : undefined}
          />
        }
      />
    </AdminPageShell>
  );
}
