"use client";

import { getMockRuntime, resetMockRuntime, setMockRuntime } from "@balanse/mock";
import { isMockHarnessEnabled } from "@balanse/mock/session";
import { MockHarnessAffordance } from "@balanse/ui";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

// Collapse store is duplicated with apps/admin MockSessionHarness (sessionStorage +
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
  { id: "cust-ana", label: "Ana Delgado (Google)" },
  { id: "cust-ben", label: "Ben Santos (email)" },
  { id: "cust-empty", label: "Empty Inbox" },
];

const BOOKINGS = [
  "booking-waitlisted",
  "booking-held_awaiting_payment",
  "booking-payment_submitted",
  "booking-confirmed",
  "booking-cancellation_requested",
  "booking-reschedule_requested",
  "booking-cancelled",
  "booking-expired",
  "booking-hold-capped",
];

type Scenario = "normal" | "schedule-failed" | "session-became-full" | "proof-upload-failed";

export function MockSessionHarness() {
  const enabled = isMockHarnessEnabled();
  const { principal, setPrincipal } = useMockPrincipal();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("normal");
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
                if (next === "proof-upload-failed") {
                  setMockRuntime({ failProofUpload: true });
                }
                router.refresh();
              }}
            >
              <option value="normal">Normal</option>
              <option value="schedule-failed">Schedule failed to load</option>
              <option value="session-became-full">Session became full while viewed</option>
              <option value="proof-upload-failed">GCash proof upload failed</option>
            </select>
          </label>
          <span className="sr-only">
            Runtime failPublicSessions={String(getMockRuntime().failPublicSessions)}
          </span>
        </div>
      </aside>
    </>
  );
}
