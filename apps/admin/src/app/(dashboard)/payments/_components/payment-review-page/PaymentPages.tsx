"use client";

import {
  type AdminPaymentTab,
  type AdminToastId,
  auditConfirmationCopy,
  bookingReference,
  type CustomerBooking,
  formatHoldDeadline,
  formatPeso,
  formatRelativeTime,
  formatSessionDate,
  formatSessionTime,
  MANUAL_REFUND_NOTE,
  paymentMethodLabel,
  paymentStatusLabel,
  sessionDisplayName,
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
  Input,
  StatusBadge,
} from "@balanse/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InfoIcon, TimerIcon, ZoomInIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import {
  AdminQueueCard,
  AdminQueueFacts,
} from "@/components/balanse/queue/admin-queue-card/AdminQueueCard";
import { AdminQueueCount } from "@/components/balanse/queue/admin-queue-count/AdminQueueCount";
import { AdminQueueList } from "@/components/balanse/queue/admin-queue-list/AdminQueueList";
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
import { AdminCan, useHasPermission } from "@/modules/authorization/useAdminAccess";
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
            className="group relative block w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 text-left focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <FixtureProofImage
          src={url}
          alt={alt}
          className="h-40 w-full object-contain transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-foreground/70 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100">
          <ZoomInIcon className="size-3.5" aria-hidden />
          View proof
        </span>
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

const COUNTER_STEPS = [
  "Find the held booking in this list.",
  "Receive cash at the counter.",
  "Record payment on the card.",
  "Confirm payment and booking.",
  "Check the guest in when they arrive.",
];

function CounterHelpNote() {
  return (
    <Collapsible
      defaultOpen
      className="rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <InfoIcon className="size-4 text-primary" aria-hidden />
          Pay at Counter procedure
        </h2>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="group" />}>
          <span className="group-data-[panel-open]:hidden">Show steps</span>
          <span className="hidden group-data-[panel-open]:inline">Hide steps</span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-5">
          {COUNTER_STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-2.5 sm:flex-col sm:gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
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
        reference={bookingReference(row.id)}
        what={`${sessionDisplayName(row.session)} · ${formatSessionDate(row.session.startsAt)}`}
        when={queueAge(row, nowIso)}
        status={row.status}
        emphasis
        body={
          <div className="grid gap-4">
            <AdminQueueFacts
              items={[
                { label: "Class time", value: formatSessionTime(row.session.startsAt) },
                { label: "Amount", value: formatPeso(row.session.pricePhp) },
                {
                  label: "Method",
                  value: (
                    <Badge appearance="soft" size="sm">
                      {paymentMethodLabel(row.paymentMethod)}
                    </Badge>
                  ),
                },
                {
                  label: "Payment",
                  value: (
                    <>
                      <Badge appearance="soft" size="sm">
                        {paymentStatusLabel(row.paymentStatus)}
                      </Badge>
                      {row.refundStatus === "REFUND_PENDING" || row.refundStatus === "REFUNDED" ? (
                        <StatusBadge status={row.refundStatus} surface="admin" />
                      ) : null}
                    </>
                  ),
                },
              ]}
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TimerIcon className="size-3.5 shrink-0" aria-hidden />
              {hold}
            </p>
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
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No screenshot for this GCash item.
            </p>
          ) : null
        }
        actions={
          <div className="flex w-full min-w-0 flex-col gap-3">
            {tab === "gcash" ? (
              <div className="flex flex-wrap gap-2">
                <AdminCan action="bookings-confirm">
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
                </AdminCan>
                <AdminCan action="bookings-reject">
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
                </AdminCan>
              </div>
            ) : null}
            {tab === "counter" ? (
              <div className="flex flex-wrap gap-2">
                <AdminCan action="payments-record-cash">
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
                </AdminCan>
                <AdminCan action="bookings-confirm">
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
                </AdminCan>
                <AdminCan action="attendance">
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
                </AdminCan>
              </div>
            ) : null}
            {tab === "refunds" ? (
              <AdminCan action="refunds-manage">
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
              </AdminCan>
            ) : null}
          </div>
        }
      />
    </div>
  );
}

/** Server totals for each tab so the tab strip can show queue sizes. */
function usePaymentTabCounts(
  canReadPayments: boolean,
  canReadRefunds: boolean,
  search: string,
): Partial<Record<AdminPaymentTab, number>> {
  const { principal } = useMockPrincipal();
  const gcash = useInfiniteQuery({
    ...adminPaymentsQueueInfiniteQuery(principal, "gcash", search),
    enabled: canReadPayments,
  });
  const counter = useInfiniteQuery({
    ...adminPaymentsQueueInfiniteQuery(principal, "counter", search),
    enabled: canReadPayments,
  });
  const refunds = useInfiniteQuery({
    ...adminPaymentsQueueInfiniteQuery(principal, "refunds", search),
    enabled: canReadRefunds,
  });
  return {
    gcash: gcash.data?.pages[0]?.totalCount,
    counter: counter.data?.pages[0]?.totalCount,
    refunds: refunds.data?.pages[0]?.totalCount,
  };
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
  const canReadPayments = useHasPermission("payments.read");
  const canReadRefunds = useHasPermission("refunds.read");
  const visibleTabs = PAYMENT_TABS.filter((item) =>
    item.id === "refunds" ? canReadRefunds : canReadPayments,
  );
  const defaultTab = visibleTabs[0]?.id ?? "gcash";
  const [urlTab, setUrlTab] = useTabParam(
    "tab",
    visibleTabs.length ? visibleTabs : PAYMENT_TABS,
    defaultTab,
  );
  const tab =
    tabOverride && visibleTabs.some((item) => item.id === tabOverride) ? tabOverride : urlTab;
  const [search, setSearch] = useState("");
  const query = useInfiniteQuery(adminPaymentsQueueInfiniteQuery(principal, tab, search.trim()));
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
    if (exiting.size === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setExiting(new Map()), reduced ? 0 : EXIT_MS);
    return () => window.clearTimeout(timeout);
  }, [exiting, queried]);

  const items = useMemo(() => {
    if (empty || loading || error) return [];
    const queriedIds = new Set(queried.map((row) => row.id));
    const lingering = [...exiting.values()].filter((row) => !queriedIds.has(row.id));
    return [...queried, ...lingering];
  }, [empty, error, exiting, loading, queried]);

  const totalCount = empty || error ? 0 : (query.data?.pages[0]?.totalCount ?? items.length);
  const tabCounts = usePaymentTabCounts(canReadPayments, canReadRefunds, search.trim());
  const tabsWithCounts = (visibleTabs.length ? visibleTabs : PAYMENT_TABS).map((item) => {
    const count = item.id === tab ? totalCount : tabCounts[item.id];
    return count === undefined ? item : { ...item, label: `${item.label} · ${count}` };
  });

  return (
    <AdminPageShell
      eyebrow="Operations queue"
      title="Payments"
      description="Verify GCash proofs, record counter payments, and track manual refunds."
      actions={<AdminQueueCount count={totalCount} label="in this queue" />}
      tabs={
        <AdminPageTabs
          tabs={tabsWithCounts}
          value={tab}
          onValueChange={(id) => {
            setExiting(new Map());
            setUrlTab(id as AdminPaymentTab);
          }}
        >
          <Input
            type="search"
            aria-label="Search payments by customer or reference"
            placeholder="Search customer or reference"
            className="mb-4 w-full max-w-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {tab === "counter" ? <CounterHelpNote /> : null}
          <AdminQueueList
            key={tab}
            className={tab === "counter" ? "mt-4" : undefined}
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
            empty={
              <FeedbackState
                id="admin.no-pending-payments"
                title={search.trim() ? "No matching payments" : undefined}
                description={
                  search.trim() ? "Try another customer or booking reference." : undefined
                }
              />
            }
          />
        </AdminPageTabs>
      }
    />
  );
}
