"use client";

import { supabaseBrowserClient } from "@balanse/api-client/browser";
import type { AuthChangeEvent, REALTIME_SUBSCRIBE_STATES, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { webKeys } from "@/lib/query/keys";

/** Batch bursts (a front-desk confirm touches the booking and its payment). */
const FLUSH_DELAY_MS = 750;
/** Only catch up after a real absence, so tab switching does not re-render the route. */
const CATCH_UP_AFTER_HIDDEN_MS = 15_000;

/**
 * Keeps the signed-in customer's portal current when the front desk acts:
 * confirming a booking, approving or rejecting a GCash receipt, recording cash,
 * or resolving a cancellation or reschedule request.
 *
 * Supabase Realtime announces changes to the customer's own rows (RLS limits
 * every table to rows the customer may read; the booking and request channels
 * also filter by the customer's id). The payload is never rendered: a change
 * invalidates this customer's React Query cache and refreshes the route, so the
 * server re-reads through `/api/*`. Changes missed while the tab slept are caught
 * up when it becomes visible again or the channel resubscribes. Renders nothing.
 */
export function PortalRealtimeSync({ customerId }: { customerId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let supabase: ReturnType<typeof supabaseBrowserClient>;
    try {
      supabase = supabaseBrowserClient();
    } catch {
      return; // Supabase env not configured; pages still refresh on navigation.
    }

    let cancelled = false;
    let subscribedOnce = false;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refresh = () => {
      flushTimer = null;
      void queryClient.invalidateQueries({ queryKey: webKeys.all(customerId) });
      router.refresh();
    };
    const schedule = () => {
      if (!flushTimer) flushTimer = setTimeout(refresh, FLUSH_DELAY_MS);
    };
    let hiddenAt: number | null = null;
    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt !== null && Date.now() - hiddenAt >= CATCH_UP_AFTER_HIDDEN_MS) schedule();
      hiddenAt = null;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        // Realtime must carry the customer's JWT, or RLS treats the socket as anonymous.
        if (session) void supabase.realtime.setAuth(session.access_token);
      },
    );

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      const next = supabase
        .channel(`portal:${customerId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings", filter: `profileId=eq.${customerId}` },
          schedule,
        )
        // Payments have no customer column; RLS already limits them to own bookings.
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, schedule)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cancellation_requests",
            filter: `requesterId=eq.${customerId}`,
          },
          schedule,
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reschedule_requests",
            filter: `requesterId=eq.${customerId}`,
          },
          schedule,
        );
      next.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
        if (status !== "SUBSCRIBED") return;
        // A resubscribe after a drop may have missed changes in between.
        if (subscribedOnce) schedule();
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
  }, [customerId, queryClient, router]);

  return null;
}
