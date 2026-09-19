"use client";

import { resetMockRuntime, setMockRuntime } from "@balanse/mock";
import { isMockHarnessEnabled } from "@balanse/mock/session";
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
];

type Scenario = "normal" | "schedule-failed" | "session-became-full";

export function MockSessionHarness() {
  const enabled = isMockHarnessEnabled();
  const { principal, setPrincipal } = useMockPrincipal();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("normal");

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
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
            value={scenario}
            onChange={(event) => {
              const next = event.target.value as Scenario;
              setScenario(next);
              resetMockRuntime();
              if (next === "schedule-failed") {
                setMockRuntime({ failPublicSessions: true });
              }
              if (next === "session-became-full") {
                setMockRuntime({ sessionBecameFullId: "session-wed-open" });
              }
              router.refresh();
            }}
          >
            <option value="normal">Normal</option>
            <option value="schedule-failed">Schedule failed to load</option>
            <option value="session-became-full">Session became full while viewed</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
