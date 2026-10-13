"use client";

import {
  type CustomerBooking,
  effectiveHoldDeadline,
  formatSessionDate,
  formatSessionTime,
  isHoldExpired,
} from "@balanse/domain";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TICK_MS = 15_000;

/** "2h 14m left", "9m left", "Less than a minute left". */
export function holdRemainingLabel(ms: number): string {
  if (ms < 60_000) return "Less than a minute left";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m left`;
  return minutes === 0 ? `${hours}h left` : `${hours}h ${minutes}m left`;
}

/**
 * Payment hold for a held booking: the effective deadline (never past class
 * start), a label for it, a ticking remaining time, and whether it lapsed.
 * The clock is read only after mount so the server render stays deterministic.
 * Refreshes the route once when the hold lapses so the booking status updates.
 */
export function useHoldCountdown(
  booking: Pick<CustomerBooking, "status" | "holdExpiresAt" | "session">,
  options: { forcedExpired?: boolean } = {},
) {
  const router = useRouter();
  const deadline = booking.holdExpiresAt
    ? effectiveHoldDeadline(booking.holdExpiresAt, booking.session.startsAt)
    : null;
  const deadlineMs = deadline?.getTime() ?? null;
  const deadlineLabel = deadline
    ? `${formatSessionTime(deadline)} on ${formatSessionDate(deadline)}`
    : null;

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (deadlineMs === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [deadlineMs]);

  const remainingMs = deadlineMs !== null && now !== null ? deadlineMs - now : null;
  const expired =
    Boolean(options.forcedExpired) ||
    booking.status === "EXPIRED" ||
    (remainingMs !== null && remainingMs <= 0) ||
    isHoldExpired(booking.holdExpiresAt, booking.session.startsAt, new Date());

  const refreshed = useRef(false);
  useEffect(() => {
    if (expired && !options.forcedExpired && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [expired, options.forcedExpired, router]);

  return {
    deadlineLabel,
    remainingLabel: remainingMs === null ? null : holdRemainingLabel(Math.max(remainingMs, 0)),
    expired,
  };
}
