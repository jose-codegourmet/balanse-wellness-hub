"use client";

import type { PublicClass, PublicSession } from "@balanse/domain";
import { getMockAdapter, getMockRuntime, MOCK_NOW_ISO } from "@balanse/mock";
import { ScheduleCalendar } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function ScheduleCalendarSection({
  audience,
  initialSessions,
  initialClasses,
  initialLoadError = false,
}: {
  audience: "guest" | "customer";
  initialSessions: PublicSession[];
  initialClasses: PublicClass[];
  initialLoadError?: boolean;
}) {
  const router = useRouter();
  const { principal } = useMockPrincipal();
  const [sessions, setSessions] = useState(initialSessions);
  const [classes, setClasses] = useState(initialClasses);
  const [bookingSessionIds, setBookingSessionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <ScheduleCalendar
      sessions={sessions}
      classes={classes}
      nowIso={MOCK_NOW_ISO}
      audience={audience}
      loading={loading}
      loadError={loadError}
      sessionBecameFullId={fullId}
      viewerBookingSessionIds={bookingSessionIds}
      onRetry={() => void load()}
      onReserve={(session) => {
        const bookingPath = `/portal/bookings/new?sessionId=${session.id}`;
        if (audience === "guest" || principal.role === "guest") {
          router.push(`/login?returnTo=${encodeURIComponent(bookingPath)}`);
          return;
        }
        router.push(bookingPath);
      }}
    />
  );
}
