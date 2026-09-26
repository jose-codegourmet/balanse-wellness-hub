import type {
  AdminClass,
  AdminEvent,
  AdminSession,
  CustomerBooking,
  EventStatus,
} from "@balanse/domain";
import {
  computeSessionInventory,
  eventStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  manilaYmd,
} from "@balanse/domain";

export function eventClassName(
  event: AdminEvent,
  classes: readonly Pick<AdminClass, "id" | "name">[] | undefined,
): string {
  return classes?.find((row) => row.id === event.session.classId)?.name ?? event.session.classId;
}

export function eventPriceLabel(event: AdminEvent): string {
  const amount = Number(event.session.customerPrice);
  return Number.isFinite(amount) ? formatPeso(amount) : event.session.customerPrice;
}

/** Confirmed bookings on the linked session. Fixture-only sessions have none. */
export function eventBookedCount(
  event: AdminEvent,
  bookings: readonly CustomerBooking[] | undefined,
): number {
  if (!bookings) return 0;
  return computeSessionInventory(
    { capacity: event.session.capacity },
    bookings.filter((row) => row.sessionId === event.sessionId),
  ).confirmed;
}

export function eventSessionCoaches(
  event: AdminEvent,
  sessions: readonly AdminSession[] | undefined,
) {
  return sessions?.find((row) => row.id === event.sessionId)?.coaches ?? [];
}

/** A cancelled session surfaces the event as cancelled even before the row is rewritten. */
export function displayedEventStatus(event: AdminEvent): EventStatus {
  if (event.session.status === "CANCELLED") return "CANCELLED";
  return event.status;
}

export function displayedEventStatusLabel(event: AdminEvent): string {
  return eventStatusLabel(displayedEventStatus(event));
}

export function eventPublishBlocked(event: AdminEvent): boolean {
  if (event.session.status !== "DRAFT") return false;
  return event.status === "DRAFT" || event.status === "PUBLISHED";
}

export function eventSessionCancelled(event: AdminEvent): boolean {
  return event.session.status === "CANCELLED";
}

export function eventInDateRange(event: AdminEvent, from: string, to: string): boolean {
  const day = manilaYmd(event.session.startsAt);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function formatEventInstant(iso: string): string {
  return `${formatSessionDate(iso)} · ${formatSessionTime(iso)}`;
}

export function formatRegistrationWindow(event: AdminEvent): string {
  const { registrationOpensAt, registrationClosesAt } = event;
  if (!registrationOpensAt && !registrationClosesAt) {
    return "No separate registration window. The session booking cutoff still applies.";
  }
  if (registrationOpensAt && registrationClosesAt) {
    return `${formatEventInstant(registrationOpensAt)} – ${formatEventInstant(registrationClosesAt)} (Asia/Manila)`;
  }
  if (registrationOpensAt) return `Opens ${formatEventInstant(registrationOpensAt)} (Asia/Manila)`;
  if (registrationClosesAt) {
    return `Closes ${formatEventInstant(registrationClosesAt)} (Asia/Manila)`;
  }
  return "No separate registration window. The session booking cutoff still applies.";
}

export type EventStatusHistoryEntry = {
  id: string;
  at: string;
  statusLabel: string;
  detail: string;
};

/**
 * Mock events do not return audit rows. Created-as-draft is the engine default,
 * and a later `updatedAt` is the current status. A cancelled session is called out.
 */
export function eventStatusHistory(event: AdminEvent): EventStatusHistoryEntry[] {
  const current = displayedEventStatusLabel(event);
  const changed = event.updatedAt !== event.createdAt;
  const sessionCancelled = eventSessionCancelled(event);
  const entries: EventStatusHistoryEntry[] = [
    {
      id: `${event.id}-created`,
      at: event.createdAt,
      statusLabel: changed ? eventStatusLabel("DRAFT") : current,
      detail: "Event created",
    },
  ];
  if (changed) {
    entries.push({
      id: `${event.id}-status`,
      at: event.updatedAt,
      statusLabel: current,
      detail: sessionCancelled
        ? "Session cancelled. The event reads as cancelled."
        : "Status updated",
    });
  } else if (sessionCancelled) {
    entries[0] = {
      ...entries[0],
      detail: "Session cancelled. The event reads as cancelled.",
    };
  }
  return entries;
}
