/**
 * Money, date, and timezone helpers (FE-FND-012).
 *
 * Assumption: every session timestamp is instant (ISO) and **displays** in
 * `Asia/Manila` (Cebu local time) regardless of the viewer's device timezone.
 * The Philippines does not observe DST.
 */

export const BUSINESS_TIME_ZONE = "Asia/Manila";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPeso(amount: number): string {
  const formatted = pesoFormatter.format(amount);
  return formatted.replace(/PHP\s?/, "₱").replace(/^₱\s/, "₱");
}

function partsInManila(iso: string | Date): Record<string, string> {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const fmt = new Intl.DateTimeFormat("en-PH", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const entries = fmt.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of entries) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return map;
}

export function formatSessionDate(iso: string | Date): string {
  const p = partsInManila(iso);
  return `${p.weekday}, ${p.month} ${p.day}, ${p.year}`;
}

export function formatSessionTime(iso: string | Date): string {
  const p = partsInManila(iso);
  return `${p.hour}:${p.minute} ${p.dayPeriod}`.replace(/\s+/g, " ").trim();
}

/**
 * Clock range without the calendar date, for layouts that already show the day
 * in its own row or group heading.
 */
export function formatSessionTimeRange(startsAt: string | Date, endsAt: string | Date): string {
  const start = partsInManila(startsAt);
  const end = partsInManila(endsAt);
  return `${start.hour}:${start.minute} ${start.dayPeriod} – ${end.hour}:${end.minute} ${end.dayPeriod}`;
}

export function formatSessionRange(startsAt: string | Date, endsAt: string | Date): string {
  const start = partsInManila(startsAt);
  const end = partsInManila(endsAt);
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day;
  const startStamp = `${start.hour}:${start.minute} ${start.dayPeriod}`;
  const endStamp = `${end.hour}:${end.minute} ${end.dayPeriod}`;
  if (sameDay) {
    return `${start.weekday}, ${start.month} ${start.day}, ${start.year} · ${startStamp}–${endStamp} (Asia/Manila)`;
  }
  return `${start.weekday}, ${start.month} ${start.day}, ${start.year} ${startStamp} – ${end.weekday}, ${end.month} ${end.day}, ${end.year} ${endStamp} (Asia/Manila)`;
}

export function effectiveHoldDeadline(
  holdExpiresAt: string | Date,
  classStartsAt: string | Date,
): Date {
  const hold = new Date(holdExpiresAt);
  const start = new Date(classStartsAt);
  return hold.getTime() < start.getTime() ? hold : start;
}

export function formatHoldDeadline(
  holdExpiresAt: string | Date,
  classStartsAt: string | Date,
): string {
  const deadline = effectiveHoldDeadline(holdExpiresAt, classStartsAt);
  const p = partsInManila(deadline);
  return `Reservation held until ${p.weekday}, ${p.month} ${p.day}, ${p.year} · ${p.hour}:${p.minute} ${p.dayPeriod} (Asia/Manila)`;
}

/** Calendar date key in business timezone (`YYYY-MM-DD`). */
export function manilaYmd(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Instant for noon on a Manila calendar day (PH has no DST). */
export function manilaYmdToUtcDate(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 4, 0, 0));
}

export function addManilaDays(ymd: string, days: number): string {
  const date = manilaYmdToUtcDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return manilaYmd(date);
}

export function startOfManilaWeekMonday(ymd: string): string {
  const date = manilaYmdToUtcDate(ymd);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
  }).format(date);
  const offset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return addManilaDays(ymd, -(offset[weekday] ?? 0));
}

export function startOfManilaMonth(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

/**
 * Civil `YYYY-MM-DD` from a widget-local `Date` (year / month / date only).
 * Pair with FullscreenCalendar and DatePicker `Date` objects — not instants.
 */
export function ymdFromLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Inverse of `ymdFromLocalDate` for calendar widgets that speak local `Date`. */
export function localDateFromYmd(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const MANILA_YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isManilaYmd(value: string | null | undefined): value is string {
  return Boolean(value && MANILA_YMD_RE.test(value));
}

export function daysInManilaMonth(ymd: string): number {
  const [year, month] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

/**
 * Compact relative time between two instants. `nowIso` is injected so Storybook
 * and the mock clock stay deterministic (do not call `Date.now()` here).
 */
export function formatRelativeTime(iso: string, nowIso: string): string {
  const then = new Date(iso).getTime();
  const now = new Date(nowIso).getTime();
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "";
  const diffMs = then - now;
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("en-PH", { numeric: "auto" });
  if (abs < 45_000) return rtf.format(0, "second");
  if (abs < 45 * MINUTE_MS) return rtf.format(Math.round(diffMs / MINUTE_MS), "minute");
  if (abs < 36 * HOUR_MS) return rtf.format(Math.round(diffMs / HOUR_MS), "hour");
  if (abs < 10 * DAY_MS) return rtf.format(Math.round(diffMs / DAY_MS), "day");
  if (abs < 5 * WEEK_MS) return rtf.format(Math.round(diffMs / WEEK_MS), "week");
  if (abs < 18 * MONTH_MS) return rtf.format(Math.round(diffMs / MONTH_MS), "month");
  return rtf.format(Math.round(diffMs / YEAR_MS), "year");
}
