"use client";

import {
  type AdminPaymentTab,
  type AdminToastId,
  auditConfirmationCopy,
  type CustomerBooking,
  formatHoldDeadline,
  formatPeso,
  formatRelativeTime,
  formatSessionDate,
  formatSessionTime,
  MANUAL_REFUND_NOTE,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@balanse/domain";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FeedbackState,
  StatusBadge,
} from "@balanse/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { AdminQueueCard } from "@/components/balanse/queue/AdminQueueCard";
import { AdminQueueList } from "@/components/balanse/queue/AdminQueueList";
import { adminNowIso } from "@/lib/clock";
import {
  useCheckIn,
  useConfirmAdminBooking,
  useMarkRefunded,
  useMarkRefundPending,
  useRecordCash,
  useRejectAdminBooking,
} from "@/lib/query/mutations";
import { adminPaymentsQueueInfiniteQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const EXIT_MS = 220;

const PAYMENT_TABS: { id: AdminPaymentTab; label: string }[] = [
  { id: "gcash", label: "GCash Pending" },
  { id: "counter", label: "Pay at Counter" },
  { id: "refunds", label: "Refunds" },
];

const QUEUE_LABEL: Record<AdminPaymentTab, string> = {
  gcash: "GCash pending payments",
  counter: "Pay at counter payments",
  refunds: "Refund payments",
};

export type PaymentReviewPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  fetchingNextPage?: boolean;
  nextPageError?: boolean;
  tab?: AdminPaymentTab;
  proofOpen?: boolean;
};

function queueAge(row: CustomerBooking, nowIso: string): string {
  return formatRelativeTime(row.requestCreatedAt ?? row.createdAt, nowIso) || "—";
}

function FixtureProofImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  // Fixture `/assets` paths are not next/image remote sources. One shared <img> for thumbnail + zoom.
  return <img src={src} alt={alt} className={className} />;
}

function PaymentProofDialog({
  url,
  customerName,
  defaultOpen = false,
}: {
  url: string;
  customerName: string;
  defaultOpen?: boolean;
}) {
  const alt = `GCash payment proof from ${customerName}`;
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="block w-full max-w-xs rounded-md text-left focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <FixtureProofImage
          src={url}
          alt={alt}
          className="max-h-48 w-full rounded-md border object-contain"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment proof</DialogTitle>
          <DialogDescription>
            Fit-to-viewport view of the uploaded screenshot for {customerName}.
          </DialogDescription>
        </DialogHeader>
        <FixtureProofImage
          src={url}
          alt={`Enlarged GCash payment proof from ${customerName}`}
          className="max-h-[80vh] w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}

function CounterHelpNote() {
  return (
    <Collapsible defaultOpen className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Pay at Counter procedure</h2>
        <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
          Toggle help
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Find the held booking in this list.</li>
          <li>Receive cash at the counter.</li>
          <li>Record payment on the card.</li>
          <li>Confirm payment and booking.</li>
          <li>Check the guest in when they arrive.</li>
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

function PaymentQueueCard({
  row,
  tab,
  stamp,
  nowIso,
  leaving,
  proofOpen,
  onLeaving,
}: {
  row: CustomerBooking;
  tab: AdminPaymentTab;
  stamp: string;
  nowIso: string;
  leaving: boolean;
  proofOpen?: boolean;
  onLeaving: (row: CustomerBooking) => void;
}) {
  const confirm = useConfirmAdminBooking();
  const reject = useRejectAdminBooking();
  const recordCash = useRecordCash();
  const checkIn = useCheckIn();
  const markPending = useMarkRefundPending();
  const markRefunded = useMarkRefunded();
  const busy =
    confirm.isPending ||
    reject.isPending ||
    recordCash.isPending ||
    checkIn.isPending ||
    markPending.isPending ||
    markRefunded.isPending;

  async function run(
    action: () => Promise<unknown>,
    success: AdminToastId,
    failure: AdminToastId,
    leavesQueue = false,
  ) {
    try {
      await action();
      notify.admin(success);
      if (leavesQueue) onLeaving(row);
    } catch {
      notify.admin(failure);
    }
  }

  const hold = row.holdExpiresAt
    ? formatHoldDeadline(row.holdExpiresAt, row.session.startsAt)
    : "No hold deadline";

  return (
    <div
      className={cn(
        leaving &&
          "pointer-events-none motion-safe:animate-out motion-safe:fade-out-0 motion-safe:slide-out-to-top-2 motion-safe:duration-200 motion-reduce:animate-none",
      )}
    >
      <AdminQueueCard
        who={row.customerName}
        what={`${row.session.className} · ${formatSessionDate(row.session.startsAt)}`}
        when={queueAge(row, nowIso)}
        status={row.status}
        emphasis
        body={
          <div className="grid gap-3">
            <p>
              {formatSessionTime(row.session.startsAt)} · {formatPeso(row.session.pricePhp)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge appearance="soft" size="sm">
                {paymentMethodLabel(row.paymentMethod)}
              </Badge>
              <Badge appearance="soft" size="sm">
                {paymentStatusLabel(row.paymentStatus)}
              </Badge>
              {row.refundStatus === "REFUND_PENDING" || row.refundStatus === "REFUNDED" ? (
                <StatusBadge status={row.refundStatus} surface="admin" />
              ) : null}
            </div>
            <p className="text-muted-foreground">{hold}</p>
          </div>
        }
        media={
          row.proofPreviewUrl ? (
            <PaymentProofDialog
              url={row.proofPreviewUrl}
              customerName={row.customerName}
              defaultOpen={proofOpen}
            />
          ) : tab === "gcash" ? (
            <p className="text-sm text-muted-foreground">No screenshot for this GCash item.</p>
          ) : (
            <p className="text-sm text-muted-foreground">No screenshot for cash payments.</p>
          )
        }
        actions={
          <div className="flex w-full min-w-0 flex-col gap-3">
            {tab === "gcash" ? (
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Confirm Payment & Booking"
                  title="Confirm payment and booking?"
                  description={stamp}
                  disabled={busy || leaving}
                  onConfirm={() =>
                    run(
                      () => confirm.mutateAsync(row.id),
                      "payment.confirmed",
                      "payment.action-failed",
                      true,
                    )
                  }
                />
                <ConfirmAction
                  triggerLabel="Reject"
                  title="Reject this payment?"
                  description={stamp}
                  variant="outline"
                  requireReason
                  reasonLabel="Reject reason"
                  reasonPlaceholder="Tell the customer why this payment is rejected."
                  disabled={busy || leaving}
                  onConfirm={(reason) =>
                    run(
                      () => reject.mutateAsync({ id: row.id, reason: reason ?? "" }),
                      "payment.rejected",
                      "payment.action-failed",
                      true,
                    )
                  }
                />
              </div>
            ) : null}
            {tab === "counter" ? (
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Record payment"
                  title="Record cash received?"
                  description={stamp}
                  disabled={busy || leaving}
                  onConfirm={() =>
                    run(
                      () => recordCash.mutateAsync(row.id),
                      "payment.cash-recorded",
                      "payment.action-failed",
                    )
                  }
                />
                <ConfirmAction
                  triggerLabel="Confirm Payment & Booking"
                  title="Confirm payment and booking?"
                  description={stamp}
                  disabled={busy || leaving}
                  onConfirm={() =>
                    run(
                      () => confirm.mutateAsync(row.id),
                      "payment.confirmed",
                      "payment.action-failed",
                    )
                  }
                />
                <ConfirmAction
                  triggerLabel="Check in"
                  title="Check this guest in?"
                  description={stamp}
                  variant="outline"
                  disabled={busy || leaving}
                  onConfirm={() =>
                    run(
                      () => checkIn.mutateAsync(row.id),
                      "booking.checked-in",
                      "booking.check-in-failed",
                    )
                  }
                />
              </div>
            ) : null}
            {tab === "refunds" ? (
              <div className="flex w-full min-w-0 flex-col gap-2">
                <p className="text-xs text-muted-foreground">{MANUAL_REFUND_NOTE}</p>
                <div className="flex flex-wrap gap-2">
                  <ConfirmAction
                    triggerLabel="Mark Refund Pending"
                    title="Mark refund pending?"
                    description={`${stamp} ${MANUAL_REFUND_NOTE}`}
                    disabled={busy || leaving || row.refundStatus === "REFUND_PENDING"}
                    onConfirm={() =>
                      run(
                        () => markPending.mutateAsync(row.id),
                        "refund.status-updated",
                        "refund.action-failed",
                      )
                    }
                  />
                  <ConfirmAction
                    triggerLabel="Mark Refunded"
                    title="Mark refunded?"
                    description={`${stamp} ${MANUAL_REFUND_NOTE}`}
                    variant="outline"
                    disabled={busy || leaving || row.refundStatus === "REFUNDED"}
                    onConfirm={() =>
                      run(
                        () => markRefunded.mutateAsync(row.id),
                        "refund.status-updated",
                        "refund.action-failed",
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        }
      />
    </div>
  );
}

export function PaymentReviewPage({
  empty,
  loading,
  error,
  fetchingNextPage,
  nextPageError,
  tab: tabOverride,
  proofOpen,
}: PaymentReviewPageProps) {
  const { principal } = useMockPrincipal();
  const [urlTab, setUrlTab] = useTabParam("tab", PAYMENT_TABS, "gcash");
  const tab = tabOverride ?? urlTab;
  const query = useInfiniteQuery(adminPaymentsQueueInfiniteQuery(principal.role, tab));
  const nowIso = adminNowIso();
  const stamp = auditConfirmationCopy("This payment action", "Admin", nowIso);
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
    setExiting(new Map());
  }, [tab]);

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
      title="Payments"
      tabs={
        <AdminPageTabs
          tabs={PAYMENT_TABS}
          value={tab}
          onValueChange={(id) => setUrlTab(id as AdminPaymentTab)}
        >
          {tab === "counter" ? <CounterHelpNote /> : null}
          <AdminQueueList
            key={tab}
            className="mt-6"
            label={QUEUE_LABEL[tab]}
            items={items}
            totalCount={totalCount}
            getItemKey={(row) => row.id}
            estimateSize={320}
            renderItem={(row, index) => (
              <PaymentQueueCard
                row={row}
                tab={tab}
                stamp={stamp}
                nowIso={nowIso}
                leaving={exiting.has(row.id)}
                proofOpen={Boolean(proofOpen && index === 0 && row.proofPreviewUrl)}
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
                  title="Could not load payments"
                  description="Try again. Items already on this page stay put if a later page fails."
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
                  title="Could not load more payments"
                  description="The first page is still here. Try again without losing what you already reviewed."
                  actionLabel="Retry"
                  onAction={() => {
                    void query.fetchNextPage();
                  }}
                />
              ) : undefined
            }
            empty={<FeedbackState id="admin.no-pending-payments" />}
          />
        </AdminPageTabs>
      }
    />
  );
}
