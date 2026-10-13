"use client";

import { supabaseBrowserClient } from "@balanse/api-client/browser";
import { isInteractiveStaffActor } from "@balanse/domain";
import type { AuthChangeEvent, REALTIME_SUBSCRIBE_STATES, Session } from "@supabase/supabase-js";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AdminAuthScope } from "@/lib/query/auth-scope";
import { adminKeys } from "@/lib/query/keys";
import { invalidateForRole, useAdminAuthScope } from "@/lib/query/mutations/shared";
import { useStaffActor } from "@/modules/authorization/useAdminAccess";

/**
 * Tables in the `supabase_realtime` publication (`realtime_admin_queues`,
 * `realtime_class_change_requests`, `realtime_bundle_acquisitions`).
 */
const WATCHED_TABLES = [
  "bookings",
  "payments",
  "cancellation_requests",
  "reschedule_requests",
  "class_change_requests",
  "bundle_acquisitions",
  "bundle_acquisition_payments",
] as const;
type WatchedTable = (typeof WATCHED_TABLES)[number];

/** Batch bursts (a confirm touches bookings and payments) into one refetch. */
const FLUSH_DELAY_MS = 750;

function keysFor(table: WatchedTable, scope: AdminAuthScope): QueryKey[] {
  const shared: QueryKey[] = [adminKeys.dashboard(scope), adminKeys.queues.all(scope)];
  switch (table) {
    case "bookings":
      return [
        ...shared,
        adminKeys.bookings.all(scope),
        adminKeys.payments.all(scope),
        adminKeys.cancellations.all(scope),
        adminKeys.reschedules.all(scope),
        adminKeys.sessions.all(scope),
        adminKeys.rosterAll(scope),
      ];
    case "payments":
      return [...shared, adminKeys.payments.all(scope), adminKeys.bookings.all(scope)];
    case "cancellation_requests":
      return [...shared, adminKeys.cancellations.all(scope), adminKeys.bookings.all(scope)];
    case "reschedule_requests":
      return [...shared, adminKeys.reschedules.all(scope), adminKeys.bookings.all(scope)];
    case "class_change_requests":
      // Approval can move, re-coach, or cancel the class.
      return [
        ...shared,
        adminKeys.classChanges.all(scope),
        adminKeys.sessions.all(scope),
        adminKeys.rosterAll(scope),
      ];
    case "bundle_acquisitions":
    case "bundle_acquisition_payments":
      // Package payment review on /bundles and /transactions, plus the customer's packages.
      return [...shared, adminKeys.bundles.all(scope), adminKeys.customers.all(scope)];
  }
}

/**
 * Keeps the operations inbox and queues current without a page refresh.
 *
 * Supabase Realtime announces row changes on the watched tables to this
 * signed-in browser; Realtime applies each table's RLS, so staff only hear
 * about rows they may read. The payload is never rendered: a change only
 * invalidates React Query keys, and the refetch goes through `/api/*`, where
 * the usual permission checks and response shaping apply.
 *
 * Changes made while the tab was asleep or disconnected are caught up when the
 * tab becomes visible again or the channel resubscribes. Renders nothing.
 */
export function AdminRealtimeSync() {
  const actor = useStaffActor();
  const scope = useAdminAuthScope();
  const queryClient = useQueryClient();
  const active = Boolean(actor && isInteractiveStaffActor(actor));

  useEffect(() => {
    if (!active) return;

    let supabase: ReturnType<typeof supabaseBrowserClient>;
    try {
      supabase = supabaseBrowserClient();
    } catch {
      // Supabase env not configured (for example a local checkout); polling-free fallback is
      // the existing focus/refresh behaviour.
      return;
    }

    let cancelled = false;
    let subscribedOnce = false;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const pending = new Set<WatchedTable>();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const flush = () => {
      flushTimer = null;
      const keys = [...pending].flatMap((table) => keysFor(table, scope));
      pending.clear();
      if (keys.length > 0) void invalidateForRole(queryClient, keys);
    };
    const schedule = (table: WatchedTable) => {
      pending.add(table);
      if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
    };
    const catchUp = () => {
      for (const table of WATCHED_TABLES) pending.add(table);
      if (flushTimer) clearTimeout(flushTimer);
      flush();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") catchUp();
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        // Realtime must carry the staff JWT, or RLS treats the socket as anonymous.
        if (session) void supabase.realtime.setAuth(session.access_token);
      },
    );

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      const next = supabase.channel(`admin-operations:${scope}`);
      for (const table of WATCHED_TABLES) {
        next.on("postgres_changes", { event: "*", schema: "public", table }, () => schedule(table));
      }
      next.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
        if (status !== "SUBSCRIBED") return;
        // A resubscribe after a drop may have missed changes in between.
        if (subscribedOnce) catchUp();
        subscribedOnce = true;
      });
      channel = next;
    })();

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      authListener.subscription.unsubscribe();
      if (flushTimer) clearTimeout(flushTimer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [active, scope, queryClient]);

  return null;
}
