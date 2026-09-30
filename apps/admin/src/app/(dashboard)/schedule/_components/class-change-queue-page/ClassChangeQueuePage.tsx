"use client";

import {
  auditConfirmationCopy,
  CLASS_CHANGE_APPROVAL_PERMISSION,
  type ClassChangeRequest,
  classChangeEffect,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { FeedbackState, ToggleGroup, ToggleGroupItem } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { adminNowIso } from "@/lib/clock";
import { useApproveClassChangeRequest, useDenyClassChangeRequest } from "@/lib/query/mutations";
import { adminClassChangeRequestsQuery } from "@/lib/query/queries";
import { AdminCan, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ClassChangeRequestCard } from "../class-change-request-card/ClassChangeRequestCard";

const TABS = ["pending", "resolved"] as const;
type QueueTab = (typeof TABS)[number];

function formatWhen(iso: string): string {
  return `${formatSessionDate(iso)} at ${formatSessionTime(iso)}`;
}

/**
 * Admin / Super Admin queue for coach class change requests (#337). Approving
 * applies the change (cancel, move, or coach swap); denying keeps the class.
 */
export function ClassChangeQueuePage({ empty = false }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminClassChangeRequestsQuery(principal));
  const [tab, setTab] = useTabParam("tab", TABS, "pending");
  const rows = empty ? [] : query.data;
  const pending = rows.filter((row) => row.status === "PENDING");
  const resolved = rows.filter((row) => row.status !== "PENDING");
  const visible = tab === "pending" ? pending : resolved;

  return (
    <AdminPageShell
      eyebrow="Coach requests"
      title="Class change requests"
      description="Coaches cannot cancel a class on their own. Review their requests to reschedule, hand a class to a substitute, or cancel it. Nothing changes until you approve."
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Change requests" }]}
      className="max-w-4xl"
      stats={
        <dl className="grid grid-cols-3 gap-3">
          <Stat label="Awaiting approval" value={pending.length} />
          <Stat
            label="Approved"
            value={resolved.filter((row) => row.status === "APPROVED").length}
            divided
          />
          <Stat
            label="Denied"
            value={resolved.filter((row) => row.status === "DENIED").length}
            divided
          />
        </dl>
      }
    >
      <ToggleGroup
        variant="outline"
        size="sm"
        value={[tab]}
        onValueChange={(next) => {
          const picked = Array.isArray(next) ? next[0] : next;
          if (picked === "pending" || picked === "resolved") setTab(picked as QueueTab);
        }}
        aria-label="Request status"
      >
        <ToggleGroupItem value="pending">
          Pending <span className="ml-1.5 tabular-nums opacity-70">{pending.length}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="resolved">
          Resolved <span className="ml-1.5 tabular-nums opacity-70">{resolved.length}</span>
        </ToggleGroupItem>
      </ToggleGroup>

      {visible.length === 0 ? (
        <FeedbackState
          id="admin.no-package-reviews"
          title={tab === "pending" ? "No requests waiting" : "No resolved requests yet"}
          description={
            tab === "pending"
              ? "When a coach asks to reschedule, swap, or cancel a class, it appears here."
              : "Approved, denied, and withdrawn requests stay here as a record."
          }
        />
      ) : (
        <ul className="grid gap-4">
          {visible.map((request) => (
            <li key={request.id}>
              <ClassChangeRequestCard
                request={request}
                actions={
                  request.status === "PENDING" ? <ReviewActions request={request} /> : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </AdminPageShell>
  );
}

function ReviewActions({ request }: { request: ClassChangeRequest }) {
  const actor = useStaffActor();
  const approve = useApproveClassChangeRequest();
  const deny = useDenyClassChangeRequest();
  const [busy, setBusy] = useState(false);
  const permission = CLASS_CHANGE_APPROVAL_PERMISSION[request.kind];
  const allowed = Boolean(actor?.permissions.includes(permission));
  const own = actor?.staffId === request.requestedByStaffId;
  const blockReason = own
    ? "You cannot review your own request."
    : allowed
      ? null
      : request.kind === "CANCEL"
        ? "Only staff who can cancel sessions can approve a cancellation."
        : "Only staff who can edit sessions can approve this change.";

  async function run(
    action: () => Promise<unknown>,
    done: "class-change.approved" | "class-change.denied",
  ) {
    setBusy(true);
    try {
      await action();
      notify.admin(done);
    } catch {
      notify.admin("class-change.review-failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <ConfirmAction
        triggerLabel="Approve"
        title={`Approve this ${request.kind === "CANCEL" ? "cancellation" : "change"}?`}
        description={`${auditConfirmationCopy("Approve class change", "Admin", adminNowIso())} ${classChangeEffect(request, formatWhen)}`}
        confirmLabel="Approve"
        variant={request.kind === "CANCEL" ? "destructive" : "default"}
        disabled={busy || blockReason !== null}
        onConfirm={() =>
          run(() => approve.mutateAsync({ id: request.id }), "class-change.approved")
        }
      />
      <ConfirmAction
        triggerLabel="Deny"
        title="Deny this request?"
        description="The class stays as it is. The coach sees your note."
        confirmLabel="Deny request"
        variant="outline"
        requireReason
        reasonLabel="Note to the coach"
        reasonPlaceholder="Explain why, or suggest another option."
        disabled={busy || blockReason !== null}
        onConfirm={(note) =>
          run(() => deny.mutateAsync({ id: request.id, note: note ?? "" }), "class-change.denied")
        }
      />
      <AdminCan action="roster-read">
        <Link
          href={`/sessions/${request.sessionId}/roster`}
          className="ml-auto text-sm underline underline-offset-4"
        >
          Who is booked
        </Link>
      </AdminCan>
      {blockReason ? <p className="w-full text-xs text-muted-foreground">{blockReason}</p> : null}
    </div>
  );
}

function Stat({
  label,
  value,
  divided = false,
}: {
  label: string;
  value: number;
  divided?: boolean;
}) {
  return (
    <div className={divided ? "border-l border-border pl-3 sm:pl-5" : undefined}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
