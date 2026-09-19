"use client";

import {
  type AdminClass,
  type AdminCoach,
  type AdminSession,
  addManilaDays,
  type CustomerBooking,
  coachRateTypeLabel,
  computeSessionInventory,
  formatSessionDate,
  formatSessionTime,
  manilaYmd,
  SESSION_RATE_SNAPSHOT_NOTE,
  startOfManilaMonth,
  validateSessionCapacity,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, FeedbackState, Input, Label, LocalizedSkeleton, NativeSelect } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmAction, PageHeader } from "./shared";

export function ScheduleListPage({ empty }: { empty?: boolean }) {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [cursor, setCursor] = useState(() => startOfManilaMonth("2026-09-16"));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getAdminSessions(),
      getMockAdapter().getAdminBookings(),
    ]).then(([rows, bookingRows]) => {
      setSessions(empty ? [] : rows);
      setBookings(bookingRows);
    });
  }, [empty]);

  const monthLabel = useMemo(() => {
    const [year, month] = cursor.split("-").map(Number);
    return new Intl.DateTimeFormat("en-PH", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Manila",
    }).format(new Date(Date.UTC(year, month - 1, 1, 4)));
  }, [cursor]);

  const visible = (sessions ?? []).filter((session) =>
    manilaYmd(session.startsAt).startsWith(cursor.slice(0, 7)),
  );
  const selected = visible.find((session) => session.id === selectedId) ?? visible[0] ?? null;

  if (!sessions) return <LocalizedSkeleton lines={8} label="Loading schedule" />;

  return (
    <section>
      <PageHeader title="Schedule">
        <Link
          href="/schedule/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
        >
          Create Session
        </Link>
      </PageHeader>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setCursor("2026-09-01")}>
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCursor(startOfManilaMonth(addManilaDays(cursor, -28)))}
        >
          &lt;
        </Button>
        <p className="min-w-40 text-center font-medium">{monthLabel}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCursor(startOfManilaMonth(addManilaDays(cursor, 32)))}
        >
          &gt;
        </Button>
      </div>
      {visible.length === 0 ? (
        <FeedbackState id="admin.no-sessions" className="mt-6" />
      ) : (
        <ul className="mt-6 space-y-2">
          {visible.map((session) => (
            <li key={session.id}>
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-card p-4 text-left"
                onClick={() => setSelectedId(session.id)}
              >
                <p className="font-medium">
                  {session.className} · {session.coachName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const inv = computeSessionInventory(
                      session,
                      bookings.filter((booking) => booking.sessionId === session.id),
                    );
                    return `Capacity ${session.capacity} · ${inv.confirmed} confirmed / ${inv.held} held / ${inv.waitlisted} waitlisted`;
                  })()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected ? <SelectedSessionPanel session={selected} /> : null}
    </section>
  );
}

function SelectedSessionPanel({ session }: { session: AdminSession }) {
  return (
    <aside className="mt-8 rounded-xl border border-border bg-card p-4">
      <h2 className="font-display text-2xl">Selected Session</h2>
      <p className="mt-2">
        {session.className} · {formatSessionDate(session.startsAt)} ·{" "}
        {formatSessionTime(session.startsAt)}
      </p>
      <p className="text-sm text-muted-foreground">
        {session.coachName} · Capacity {session.capacity}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="underline underline-offset-4" href={`/sessions/${session.id}/roster`}>
          View Roster
        </Link>
        <Link className="underline underline-offset-4" href={`/schedule/${session.id}`}>
          Edit
        </Link>
        <ConfirmAction
          triggerLabel="Cancel Session"
          title="Cancel this session?"
          description="Affected bookings enter manual refund handling. The session stays in history."
          variant="outline"
          onConfirm={() => getMockAdapter().cancelAdminSession(session.id)}
        />
      </div>
    </aside>
  );
}

export function SessionFormPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const isNew = sessionId === "new";
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [form, setForm] = useState({
    classId: "",
    date: "2026-09-21",
    start: "08:00",
    end: "09:30",
    coachId: "",
    pricePhp: "500",
    capacity: "12",
    bookable: true,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT" | "CANCELLED",
    coachRatePhp: "650",
    coachRateType: "PER_SESSION" as "PER_SESSION" | "PER_HOUR",
  });
  const [error, setError] = useState<string | null>(null);
  const [consumed, setConsumed] = useState(0);

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getAdminClasses(),
      getMockAdapter().getAdminCoaches(),
      getMockAdapter().getAdminSessions(),
    ]).then(([classRows, coachRows, sessionRows]) => {
      setClasses(classRows.filter((row) => row.active));
      setCoaches(coachRows.filter((row) => row.active));
      if (!isNew) {
        const existing = sessionRows.find((row) => row.id === sessionId);
        if (existing) {
          setForm({
            classId: existing.classId,
            date: manilaYmd(existing.startsAt),
            start: formatSessionTime(existing.startsAt).includes("PM") ? "15:00" : "08:00",
            end: "09:30",
            coachId: existing.coachId,
            pricePhp: String(existing.pricePhp),
            capacity: String(existing.capacity),
            bookable: existing.bookable,
            status: existing.status,
            coachRatePhp: String(existing.coachRatePhp),
            coachRateType: existing.coachRateType,
          });
          void getMockAdapter()
            .getAdminSessionRoster(existing.id)
            .then((roster) => setConsumed(roster.confirmedCount + roster.heldCount));
        }
      } else if (classRows[0] && coachRows[0]) {
        setForm((current) => ({
          ...current,
          classId: classRows.find((row) => row.active)?.id ?? "",
          coachId: coachRows[0].id,
          coachRatePhp: String(coachRows[0].defaultRatePhp),
          coachRateType: coachRows[0].rateType,
        }));
      }
    });
  }, [isNew, sessionId]);

  return (
    <section className="max-w-xl">
      <PageHeader title={isNew ? "Create Session" : "Edit Session"} />
      <p className="mt-3 text-sm text-muted-foreground">{SESSION_RATE_SNAPSHOT_NOTE}</p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const capacity = Number(form.capacity);
          const check = validateSessionCapacity(capacity, consumed);
          if (!check.ok) {
            setError(check.error);
            return;
          }
          const startsAt = `${form.date}T00:00:00.000Z`;
          const endsAt = `${form.date}T01:30:00.000Z`;
          void getMockAdapter()
            .upsertAdminSession({
              id: isNew ? undefined : sessionId,
              classId: form.classId,
              coachId: form.coachId,
              startsAt,
              endsAt,
              pricePhp: Number(form.pricePhp),
              capacity,
              bookable: form.bookable,
              status: form.status,
              coachRatePhp: Number(form.coachRatePhp),
              coachRateType: form.coachRateType,
            })
            .then(() => router.push("/schedule"));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="session-class">Class</Label>
          <NativeSelect
            id="session-class"
            value={form.classId}
            onChange={(event) => setForm({ ...form, classId: event.target.value })}
          >
            {classes.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="session-date">Date</Label>
          <Input
            id="session-date"
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="session-start">Start</Label>
          <Input
            id="session-start"
            type="time"
            value={form.start}
            onChange={(event) => setForm({ ...form, start: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="session-end">End</Label>
          <Input
            id="session-end"
            type="time"
            value={form.end}
            onChange={(event) => setForm({ ...form, end: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="session-coach">Coach</Label>
          <NativeSelect
            id="session-coach"
            value={form.coachId}
            onChange={(event) => {
              const coach = coaches.find((row) => row.id === event.target.value);
              setForm({
                ...form,
                coachId: event.target.value,
                coachRatePhp: coach ? String(coach.defaultRatePhp) : form.coachRatePhp,
                coachRateType: coach?.rateType ?? form.coachRateType,
              });
            }}
          >
            {coaches.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="customer-price">Customer Price</Label>
          <Input
            id="customer-price"
            type="number"
            value={form.pricePhp}
            onChange={(event) => setForm({ ...form, pricePhp: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="coach-rate">Coach Rate</Label>
          <Input
            id="coach-rate"
            type="number"
            value={form.coachRatePhp}
            onChange={(event) => setForm({ ...form, coachRatePhp: event.target.value })}
          />
          <p className="text-sm text-muted-foreground">{SESSION_RATE_SNAPSHOT_NOTE}</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="coach-rate-type">Coach Rate Type</Label>
          <NativeSelect
            id="coach-rate-type"
            value={form.coachRateType}
            onChange={(event) =>
              setForm({ ...form, coachRateType: event.target.value as "PER_SESSION" | "PER_HOUR" })
            }
          >
            <option value="PER_SESSION">{coachRateTypeLabel("PER_SESSION")}</option>
            <option value="PER_HOUR">{coachRateTypeLabel("PER_HOUR")}</option>
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="session-capacity">Capacity</Label>
          <Input
            id="session-capacity"
            type="number"
            value={form.capacity}
            onChange={(event) => setForm({ ...form, capacity: event.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.bookable}
            onChange={(event) => setForm({ ...form, bookable: event.target.checked })}
          />
          Publish / bookable
        </label>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit">Save session</Button>
      </form>
    </section>
  );
}
