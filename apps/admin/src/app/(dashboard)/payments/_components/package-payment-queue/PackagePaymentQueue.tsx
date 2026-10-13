"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminBundleAcquisition,
  type AdminToastId,
  auditConfirmationCopy,
  formatPeso,
  formatRelativeTime,
  paymentMethodLabel,
} from "@balanse/domain";
import { Badge, FeedbackState } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import {
  AdminQueueCard,
  AdminQueueFacts,
} from "@/components/balanse/queue/admin-queue-card/AdminQueueCard";
import { AdminQueueList } from "@/components/balanse/queue/admin-queue-list/AdminQueueList";
import { adminNowIso } from "@/lib/clock";
import { useApproveBundleAcquisition, useRejectBundleAcquisition } from "@/lib/query/mutations";
import { adminBundleAcquisitionsQuery, adminPackageProofUrlQuery } from "@/lib/query/queries";
import { AdminCan, useHasPermission, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { PaymentProofDialog } from "../payment-proof-dialog/PaymentProofDialog";

/**
 * Paid package requests staff can act on: a submitted GCash receipt, or a
 * Pay at Counter choice waiting for cash. Receipts first, then oldest first.
 */
export function packagePaymentRows(
  rows: AdminBundleAcquisition[],
  search = "",
): AdminBundleAcquisition[] {
  const needle = search.trim().toLowerCase();
  return rows
    .filter(
      (row) =>
        row.kind === "CUSTOMER_PAID" &&
        (row.status === "PENDING_REVIEW" ||
          (row.status === "PENDING_PAYMENT" && row.payment?.method === "PAY_AT_COUNTER")),
    )
    .filter(
      (row) =>
        !needle ||
        [row.customerName, row.customerEmail, row.bundleName].some((value) =>
          value.toLowerCase().includes(needle),
        ),
    )
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "PENDING_REVIEW" ? -1 : 1;
      const at = a.payment?.submittedAt ?? a.createdAt;
      const bt = b.payment?.submittedAt ?? b.createdAt;
      return at.localeCompare(bt);
    });
}

/** Shares the acquisitions cache with /bundles and /transactions. */
export function usePackagePaymentRows(search: string, enabled = true) {
  const actor = useStaffActor();
  const query = useQuery({
    ...adminBundleAcquisitionsQuery(actor, apiFetchBrowser),
    enabled,
  });
  return { query, rows: packagePaymentRows(query.data ?? [], search) };
}

function PackagePaymentCard({ row, stamp }: { row: AdminBundleAcquisition; stamp: string }) {
  const actor = useStaffActor();
  const approve = useApproveBundleAcquisition();
  const reject = useRejectBundleAcquisition();
  const canReview = useHasPermission("bundles.manage");
  const review = row.status === "PENDING_REVIEW";
  const hasProof = Boolean(row.payment?.proofObjectKey);
  // Receipts live in a private bucket: fetch a short-lived signed URL (audited per view).
  const proofUrl = useQuery({
    ...adminPackageProofUrlQuery(actor, row.id, apiFetchBrowser),
    enabled: review && hasProof && canReview,
    staleTime: 60_000,
  });
  const amount = formatPeso(row.payment?.amountPhp ?? 0);
  const busy = approve.isPending || reject.isPending;
  const nowIso = adminNowIso();

  async function run(action: () => Promise<unknown>, success: AdminToastId) {
    try {
      await action();
      notify.admin(success);
    } catch {
      notify.admin("bundle.review-failed");
    }
  }

  return (
    <AdminQueueCard
      who={row.customerName}
      what={row.bundleName}
      when={formatRelativeTime(row.payment?.submittedAt ?? row.createdAt, nowIso) || "—"}
      badge={
        <Badge appearance="soft" size="sm">
          {review ? "Receipt submitted" : "Paying at counter"}
        </Badge>
      }
      emphasis={review}
      body={
        <AdminQueueFacts
          items={[
            { label: "Package", value: row.bundleName },
            { label: "Amount", value: amount },
            {
              label: "Method",
              value: (
                <Badge appearance="soft" size="sm">
                  {paymentMethodLabel(row.payment?.method ?? null)}
                </Badge>
              ),
            },
            { label: "Email", value: <span className="break-all">{row.customerEmail}</span> },
          ]}
        />
      }
      media={
        review ? (
          proofUrl.data?.signedUrl ? (
            <PaymentProofDialog url={proofUrl.data.signedUrl} customerName={row.customerName} />
          ) : (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              {hasProof && !canReview
                ? "Only package reviewers can view receipts."
                : hasProof
                  ? proofUrl.isError
                    ? "Couldn't load the screenshot. Try again in a moment."
                    : "Loading screenshot…"
                  : "No screenshot for this request."}
            </p>
          )
        ) : null
      }
      actions={
        <AdminCan action="bundles-manage">
          <div className="flex flex-wrap gap-2">
            {review ? (
              <>
                <ConfirmAction
                  triggerLabel="Approve payment"
                  title="Approve this package payment?"
                  description="The payment is marked verified and the customer's sessions become available right away."
                  details={[
                    { label: "Package", value: row.bundleName },
                    { label: "Amount", value: amount },
                    { label: "Customer", value: row.customerName },
                  ]}
                  note={stamp}
                  disabled={busy}
                  onConfirm={() =>
                    run(() => approve.mutateAsync(row.id), "bundle.acquisition-reviewed")
                  }
                />
                <ConfirmAction
                  triggerLabel="Reject receipt"
                  title="Reject this package payment?"
                  description={`${row.customerName}'s request is closed and no sessions are added. They can request the package again. ${stamp}`}
                  variant="outline"
                  requireReason
                  reasonLabel="Reason for the customer"
                  reasonPlaceholder="For example: the amount doesn't match, or the screenshot is unreadable."
                  confirmLabel="Reject receipt"
                  disabled={busy}
                  onConfirm={(reason) =>
                    run(
                      () => reject.mutateAsync({ id: row.id, reason: reason ?? "" }),
                      "bundle.acquisition-reviewed",
                    )
                  }
                />
              </>
            ) : (
              <ConfirmAction
                triggerLabel="Cash received"
                title={`Received ${amount} from ${row.customerName}?`}
                description={`This records the cash payment and activates ${row.bundleName}. ${stamp}`}
                confirmLabel="Activate package"
                disabled={busy}
                onConfirm={() =>
                  run(() => approve.mutateAsync(row.id), "bundle.acquisition-reviewed")
                }
              />
            )}
          </div>
        </AdminCan>
      }
    />
  );
}

export function PackagePaymentQueue({ search }: { search: string }) {
  const { query, rows } = usePackagePaymentRows(search);
  const stamp = auditConfirmationCopy("This payment action", "Admin", adminNowIso());
  return (
    <AdminQueueList
      label="Package payments"
      items={rows}
      totalCount={rows.length}
      getItemKey={(row) => row.id}
      estimateSize={320}
      renderItem={(row) => <PackagePaymentCard row={row} stamp={stamp} />}
      loading={query.isPending}
      error={
        query.isError ? (
          <FeedbackState
            id="calendar.load-failed"
            title="Could not load package payments"
            description="Try again in a moment."
            actionLabel="Retry"
            onAction={() => {
              void query.refetch();
            }}
          />
        ) : undefined
      }
      empty={
        <FeedbackState
          id="admin.no-package-reviews"
          title={search.trim() ? "No matching package payments" : undefined}
          description={search.trim() ? "Try another customer or package name." : undefined}
        />
      }
    />
  );
}
