"use client";

import { MOCK_STAFF_IDENTITIES, resetMockRuntime, setMockRuntime } from "@balanse/mock";
import { isMockHarnessEnabled } from "@balanse/mock/session";
import { MockHarnessAffordance } from "@balanse/ui";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { useSwitchAuthorizedIdentity } from "@/modules/session/useSwitchAuthorizedIdentity";

// Collapse store is duplicated with apps/web MockSessionHarness (sessionStorage +
// event contract from #258). Collapsed chrome is shared MockHarnessAffordance.
const HARNESS_COLLAPSE_KEY = "balanse-mock-harness-collapsed";
const HARNESS_COLLAPSE_EVENT = "balanse-mock-harness-collapsed";
const HARNESS_PANEL_ID = "mock-session-harness-panel";
const MOBILE_QUERY = "(max-width: 767px)";

function readHarnessCollapsed(): boolean {
  try {
    const stored = sessionStorage.getItem(HARNESS_COLLAPSE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // sessionStorage may be unavailable (private mode)
  }
  return window.matchMedia(MOBILE_QUERY).matches;
}

function subscribeHarnessCollapsed(onStoreChange: () => void) {
  window.addEventListener(HARNESS_COLLAPSE_EVENT, onStoreChange);
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener(HARNESS_COLLAPSE_EVENT, onStoreChange);
    media.removeEventListener("change", onStoreChange);
  };
}

function useMockHarnessCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribeHarnessCollapsed,
    readHarnessCollapsed,
    () => true,
  );

  function persistCollapsed(next: boolean) {
    try {
      sessionStorage.setItem(HARNESS_COLLAPSE_KEY, String(next));
    } catch {
      // sessionStorage may be unavailable (private mode)
    }
    window.dispatchEvent(new Event(HARNESS_COLLAPSE_EVENT));
  }

  return { collapsed, persistCollapsed };
}

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
  const { principal } = useMockPrincipal();
  const switchIdentity = useSwitchAuthorizedIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [latencyMs, setLatencyMs] = useState(0);

  const identityValue =
    principal.role === "admin" && principal.staffId ? principal.staffId : principal.role;

  function applyRuntimeAndRefetch(next: Parameters<typeof setMockRuntime>[0]) {
    // Runtime knobs live on the browser adapter only. Do not router.refresh() —
    // a server prefetch would dehydrate pristine fixtures and hide the knob.
    // resetQueries drops cached results and refetches observers so pending /
    // error / empty states are visible. clear() alone can leave the last
    // observer result on screen.
    setMockRuntime(next);
    void queryClient.resetQueries();
  }

  const { collapsed, persistCollapsed } = useMockHarnessCollapsed();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);
  const restoreTriggerFocus = useRef(false);
  const restoreHideFocus = useRef(false);

  useEffect(() => {
    if (collapsed && restoreTriggerFocus.current) {
      triggerRef.current?.focus();
      restoreTriggerFocus.current = false;
    }
    if (!collapsed && restoreHideFocus.current) {
      hideRef.current?.focus();
      restoreHideFocus.current = false;
    }
  }, [collapsed]);

  if (!enabled) return null;

  return (
    <>
      {collapsed ? (
        <MockHarnessAffordance
          ref={triggerRef}
          panelId={HARNESS_PANEL_ID}
          onClick={() => {
            restoreHideFocus.current = true;
            persistCollapsed(false);
          }}
        />
      ) : null}
      <aside
        id={HARNESS_PANEL_ID}
        hidden={collapsed}
        aria-label="Mock session harness"
        className="sticky top-0 z-50 border-b border-accent bg-accent px-3 py-2 text-accent-foreground"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Mock harness — not production
          </p>
          <button
            ref={hideRef}
            type="button"
            aria-expanded={true}
            aria-controls={HARNESS_PANEL_ID}
            aria-label="Collapse mock session harness"
            className="inline-flex items-center gap-1 rounded-md border border-accent-foreground/30 px-2 py-1 text-xs font-semibold uppercase tracking-wide"
            onClick={() => {
              restoreTriggerFocus.current = true;
              persistCollapsed(true);
            }}
          >
            Hide
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2">
            Identity
            <select
              data-testid="harness-identity"
              className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
              value={identityValue}
              onChange={(event) => {
                const next = event.target.value;
                if (next === "guest" || next === "customer") {
                  switchIdentity({ role: next, staffId: null });
                  return;
                }
                switchIdentity({ role: "admin", staffId: next });
              }}
            >
              <option value="guest">Guest (rejected)</option>
              <option value="customer">Customer (rejected)</option>
              {MOCK_STAFF_IDENTITIES.map((identity) => (
                <option key={identity.id} value={identity.id}>
                  {identity.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Customer
            <select
              className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-foreground"
              value={principal.customerId}
              onChange={(event) => {
                switchIdentity({ customerId: event.target.value }, { navigate: false });
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
                switchIdentity({ showcaseBookingId: event.target.value }, { navigate: false });
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
    </>
  );
}
