"use client";

import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { getMockAdapter, getMockRuntime, MOCK_NOW_ISO } from "@balanse/mock";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BalanseBookingCalendar } from "@/components/balanse/calendar/BalanseBookingCalendar";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function ScheduleCalendarSection({
  audience,
  initialSessions,
  initialClasses,
  initialCoaches = [],
  initialLoadError = false,
  initialClassFilter = "all",
  initialCoachFilter = "all",
}: {
  audience: "guest" | "customer";
  initialSessions: PublicSession[];
  initialClasses: PublicClass[];
  initialCoaches?: PublicCoach[];
  initialLoadError?: boolean;
  initialClassFilter?: string;
  initialCoachFilter?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { principal } = useMockPrincipal();
  const [sessions, setSessions] = useState(initialSessions);
  const [classes, setClasses] = useState(initialClasses);
  const [bookingSessionIds, setBookingSessionIds] = useState<string[]>([]);
  // Customer schedules depend on the current mock principal's bookings. Start in
  // a loading state so the public timetable never flashes before that scope loads.
  const [loading, setLoading] = useState(audience === "customer");
  const [loadError, setLoadError] = useState(initialLoadError);
  const [fullId, setFullId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const adapter = getMockAdapter();
      const [nextSessions, nextClasses] = await Promise.all([
        adapter.getPublicSessions(),
        adapter.getPublicClasses(),
      ]);
      setSessions(nextSessions);
      setClasses(nextClasses);
      setFullId(getMockRuntime().sessionBecameFullId);
      if (audience === "customer") {
        const bookings = await adapter.getBookings(principal.customerId);
        setBookingSessionIds(bookings.map((booking) => booking.sessionId));
      } else {
        setBookingSessionIds([]);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [audience, principal.customerId]);

  useEffect(() => {
    const runtime = getMockRuntime();
    if (runtime.failPublicSessions || runtime.sessionBecameFullId || audience === "customer") {
      void load();
    }
  }, [audience, load]);

  const scopedSessions = useMemo(
    () =>
      audience === "customer"
        ? sessions.filter((session) => bookingSessionIds.includes(session.id))
        : sessions,
    [audience, bookingSessionIds, sessions],
  );
  const scopedClasses = useMemo(
    () =>
      audience === "customer"
        ? classes.filter((item) => scopedSessions.some((session) => session.classId === item.id))
        : classes,
    [audience, classes, scopedSessions],
  );

  // The portal reuses the marketing calendar's responsive layout, with customer
  // sessions scoped to the authenticated customer's booking records.
  const Calendar = BalanseBookingCalendar;

  return (
    <Calendar
      sessions={scopedSessions}
      classes={scopedClasses}
      coaches={initialCoaches}
      nowIso={MOCK_NOW_ISO}
      audience={audience}
      loading={loading}
      loadError={loadError}
      sessionBecameFullId={fullId}
      viewerBookingSessionIds={bookingSessionIds}
      onRetry={() => void load()}
      initialClassFilter={initialClassFilter}
      initialCoachFilter={initialCoachFilter}
      onClearFilter={() => {
        if (pathname === "/") {
          router.replace(audience === "customer" ? "/portal/schedule" : "/#schedule");
        }
      }}
      onReserve={(session) => {
        const waitlist = !session.reservable && session.availability === "full_with_waitlist";
        const bookingPath = waitlist
          ? `/portal/book/${session.id}?intent=waitlist`
          : `/portal/book/${session.id}`;
        if (audience === "guest" || principal.role === "guest") {
          router.push(`/login?returnTo=${encodeURIComponent(bookingPath)}`);
          return;
        }
        router.push(bookingPath);
      }}
    />
  );
}
