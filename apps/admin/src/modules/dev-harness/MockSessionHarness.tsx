"use client";

import { resetMockRuntime, setMockRuntime } from "@balanse/mock";
import { isMockHarnessEnabled } from "@balanse/mock/session";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const CUSTOMERS = [
  { id: "cust-ana", label: "Ana Delgado" },
  { id: "cust-ben", label: "Ben Santos" },
];

const BOOKINGS = [
  "booking-waitlisted",
  "booking-held_awaiting_payment",
  "booking-payment_submitted",
  "booking-confirmed",
  "booking-cancellation_requested",
  "booking-reschedule_requested",
  "booking-reschedule-full",
  "booking-counter-held",
];

const QUEUES = [
  { id: "payments", label: "Payments", href: "/payments" },
  { id: "cancellations", label: "Cancellations", href: "/cancellations" },
  { id: "reschedules", label: "Reschedules", href: "/reschedules" },
  { id: "roster", label: "Roster (Wed open)", href: "/sessions/session-wed-open/roster" },
] as const;

type Scenario = "normal" | "schedule-failed" | "session-became-full" | "empty-admin-queues";

export function MockSessionHarness() {
  const enabled = isMockHarnessEnabled();
  const { principal, setPrincipal } = useMockPrincipal();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [latencyMs, setLatencyMs] = useState(0);

  function clearAdminCache() {
    // Clear (do not invalidate): another role's data must not stay reachable.
    queryClient.clear();
  }

  function applyRuntimeAndRefetch(next: Parameters<typeof setMockRuntime>[0]) {
    // Runtime knobs live on the browser adapter only. Do not router.refresh() —
    // a server prefetch would dehydrate pristine fixtures and hide the knob.
    // resetQueries drops cached results and refetches observers so pending /
    // error / empty states are visible. clear() alone can leave the last
    // observer result on screen.
    setMockRuntime(next);
    void queryClient.resetQueries();
  }

  if (!enabled) return null;

  return (
    <aside
      aria-label="Mock session harness"
      className="sticky top-0 z-50 border-b border-accent bg-accent px-3 py-2 text-accent-foreground"
    >
      <p className="text-xs font-semibold uppercase tracking-wide">Mock harness — not production</p>
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          Principal
          <select
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={principal.role}
            onChange={(event) => {
              clearAdminCache();
              setPrincipal({ role: event.target.value as typeof principal.role });
              router.refresh();
            }}
          >
            <option value="guest">Guest</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Customer
          <select
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={principal.customerId}
            onChange={(event) => {
              clearAdminCache();
              setPrincipal({ customerId: event.target.value });
              router.refresh();
            }}
          >
            {CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Showcase booking
          <select
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={principal.showcaseBookingId}
            onChange={(event) => {
              clearAdminCache();
              setPrincipal({ showcaseBookingId: event.target.value });
              router.refresh();
            }}
          >
            {BOOKINGS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Calendar scenario
          <select
            data-testid="harness-scenario"
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={scenario}
            onChange={(event) => {
              const next = event.target.value as Scenario;
              setScenario(next);
              setLatencyMs(0);
              resetMockRuntime();
              if (next === "schedule-failed") {
                applyRuntimeAndRefetch({ failPublicSessions: true });
              } else if (next === "session-became-full") {
                applyRuntimeAndRefetch({ sessionBecameFullId: "session-wed-open" });
              } else if (next === "empty-admin-queues") {
                applyRuntimeAndRefetch({ emptyAdminQueues: true });
              } else {
                void queryClient.resetQueries();
              }
            }}
          >
            <option value="normal">Normal</option>
            <option value="schedule-failed">Schedule failed to load</option>
            <option value="session-became-full">Session became full while viewed</option>
            <option value="empty-admin-queues">Empty admin queues</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Admin queue
          <select
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            defaultValue=""
            onChange={(event) => {
              const href = event.target.value;
              if (href) router.push(href);
            }}
          >
            <option value="">Jump to…</option>
            {QUEUES.map((queue) => (
              <option key={queue.id} value={queue.href}>
                {queue.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Adapter latency
          <select
            data-testid="harness-latency"
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={latencyMs}
            onChange={(event) => {
              const next = Number(event.target.value);
              setLatencyMs(next);
              applyRuntimeAndRefetch({ latencyMs: next });
            }}
          >
            <option value={0}>0 ms</option>
            <option value={1500}>1500 ms</option>
          </select>
        </label>
        <button
          type="button"
          data-testid="harness-fail-next"
          className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
          onClick={() => {
            applyRuntimeAndRefetch({ failNext: true });
          }}
        >
          Fail next adapter call
        </button>
      </div>
    </aside>
  );
}
