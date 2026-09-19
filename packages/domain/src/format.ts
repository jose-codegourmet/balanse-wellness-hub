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
