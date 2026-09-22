import {
  hasPermission,
  type PermissionKey,
  SETTINGS_SECTION_PERMISSIONS,
  type SettingsSection,
} from "@balanse/domain";
import type { AdminApiActor } from "./deps";
import { staffAuthorizationOf } from "./deps";
import { ApiError } from "./errors";

const RATE_KEYS = new Set([
  "defaultRate",
  "rateType",
  "coachRate",
  "coachRateType",
  "coachRatePhp",
  "isPlaceholder",
]);

export function canReadRates(actor: AdminApiActor): boolean {
  return hasPermission(staffAuthorizationOf(actor), "coach_rates.read");
}

export function canManageRates(actor: AdminApiActor): boolean {
  return hasPermission(staffAuthorizationOf(actor), "coach_rates.manage");
}

export function stripRateFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripRateFields(item)) as T;
  }
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(record)) {
    if (RATE_KEYS.has(key)) continue;
    next[key] = stripRateFields(item);
  }
  return next as T;
}

export function maybeStripRates<T>(actor: AdminApiActor, value: T): T {
  return canReadRates(actor) ? value : stripRateFields(value);
}

export function actorHas(actor: AdminApiActor, key: PermissionKey): boolean {
  return hasPermission(staffAuthorizationOf(actor), key);
}

export function shapeDashboard(actor: AdminApiActor, body: Record<string, unknown>) {
  const financial = actorHas(actor, "dashboard.financial.read");
  const schedule = Array.isArray(body.todaysSchedule)
    ? maybeStripRates(actor, body.todaysSchedule)
    : body.todaysSchedule;
  const scopedSchedule = Array.isArray(schedule)
    ? actorHas(actor, "schedule.read.all")
      ? schedule
      : schedule.filter((row) => sessionOwnedByActor(actor, row))
    : schedule;
  const next: Record<string, unknown> = {
    ...body,
    todaysSchedule: scopedSchedule,
    todaysClasses: Array.isArray(scopedSchedule) ? scopedSchedule.length : body.todaysClasses,
    pendingPayments: actorHas(actor, "payments.read") ? body.pendingPayments : 0,
    cancellations: actorHas(actor, "cancellations.read") ? body.cancellations : 0,
    reschedules: actorHas(actor, "reschedules.read") ? body.reschedules : 0,
    waitlisted: actorHas(actor, "bookings.read") ? body.waitlisted : 0,
    attention: {
      payments: actorHas(actor, "payments.read")
        ? ((body.attention as { payments?: number } | undefined)?.payments ?? 0)
        : 0,
      cancellations: actorHas(actor, "cancellations.read")
        ? ((body.attention as { cancellations?: number } | undefined)?.cancellations ?? 0)
        : 0,
      reschedules: actorHas(actor, "reschedules.read")
        ? ((body.attention as { reschedules?: number } | undefined)?.reschedules ?? 0)
        : 0,
    },
  };
  if (!financial) {
    delete next.todaysSalesPhp;
    delete next.pendingRefundsPhp;
    delete next.coachCostTodayPhp;
    const comparisons = next.comparisons as Record<string, unknown> | undefined;
    if (comparisons) {
      const { todaysSalesPhp: _sales, coachCostTodayPhp: _cost, ...rest } = comparisons;
      next.comparisons = rest;
    }
    if (Array.isArray(next.series)) {
      next.series = (next.series as Array<{ metric: string }>).filter(
        (row) => row.metric !== "gross_sales" && row.metric !== "coach_cost",
      );
    }
  }
  return next;
}

export function sessionOwnedByActor(actor: AdminApiActor, session: unknown): boolean {
  if (!actor.coachId || !session || typeof session !== "object") return false;
  const coaches = (session as { coaches?: unknown }).coaches;
  if (!Array.isArray(coaches)) return false;
  return coaches.some((row) => {
    if (!row || typeof row !== "object") return false;
    const coach = "coach" in row ? (row as { coach?: { id?: string } }).coach : row;
    const id = (coach as { id?: string } | undefined)?.id ?? (row as { coachId?: string }).coachId;
    return id === actor.coachId;
  });
}

export function shapeClassPerformance(actor: AdminApiActor, items: Array<Record<string, unknown>>) {
  const sales = actorHas(actor, "reports.sales.read");
  const capacity = actorHas(actor, "reports.capacity.read");
  return items.map((row) => {
    const next = { ...row };
    if (!sales) delete next.Revenue;
    if (!capacity) delete next.Occupancy;
    return next;
  });
}

export function shapeRoster(
  actor: AdminApiActor,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const next = maybeStripRates(actor, payload) as Record<string, unknown>;
  if (actorHas(actor, "payments.read")) return next;
  const stripPayment = (rows: unknown) =>
    Array.isArray(rows)
      ? rows.map((row) => {
          if (!row || typeof row !== "object") return row;
          const { payment: _payment, ...rest } = row as Record<string, unknown>;
          return rest;
        })
      : rows;
  return {
    ...next,
    confirmed: stripPayment(next.confirmed),
    held: stripPayment(next.held),
  };
}

export function permittedSettingsSections(actor: AdminApiActor): SettingsSection[] {
  return (Object.keys(SETTINGS_SECTION_PERMISSIONS) as SettingsSection[]).filter((section) =>
    actorHas(actor, SETTINGS_SECTION_PERMISSIONS[section]),
  );
}

export function shapeSettingsPayload(actor: AdminApiActor, payload: Record<string, unknown>) {
  const allowed = new Set(permittedSettingsSections(actor));
  const next = { ...payload };
  if (!allowed.has("business")) delete next.business;
  if (!allowed.has("payment")) delete next.payment;
  if (!allowed.has("content")) delete next.content;
  if (!allowed.has("policies")) delete next.policies;
  return next;
}

export function requireSettingsSection(actor: AdminApiActor, section: SettingsSection): void {
  const key = SETTINGS_SECTION_PERMISSIONS[section];
  if (!actorHas(actor, key)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: key, section },
    });
  }
}
