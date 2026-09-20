import { ADMIN_CURSOR_LIMIT_DEFAULT, ADMIN_CURSOR_LIMIT_MAX, type CursorPage } from "./contracts";
import type { FieldErrors, LoginInput } from "./customer-portal";
import { HOLD_DURATION_HOURS } from "./customer-portal";
import type { CoachRateType, PaymentStatus, SessionStatus } from "./enums";
import { BOOKING_STATUSES } from "./enums";
import { manilaYmd } from "./format";
import type {
  AdminCoach,
  AdminCustomer,
  AdminStaff,
  CustomerBooking,
  PaymentInstructions,
  PolicyAcceptance,
  PublicClass,
  PublicContent,
  PublicSession,
} from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mock admin credentials. Not real auth. */
export const MOCK_ADMIN_CREDENTIALS = [
  { email: "rex@balanse.example", password: "welcome", staffId: "staff-rex" },
  { email: "partner@balanse.example", password: "welcome", staffId: "staff-partner" },
] as const;

/** Known customer emails used to demonstrate a non-admin rejection. */
export const MOCK_NON_ADMIN_CREDENTIALS = [
  { email: "ana@example.com", password: "welcome" },
  { email: "ben@example.com", password: "welcome" },
] as const;

export const ADMIN_LOGIN_HELP = "Need access or password help? Contact the system administrator.";

export const ADMIN_ROLE_CAPABILITY_NOTE =
  "Admin role: coach compensation rates, sales reports, refund totals, coach-cost reports, and capacity/utilization reporting. Coach compensation stays internal.";

export const SESSION_RATE_SNAPSHOT_NOTE =
  "Coach rate and rate type are stored on this session. Changing a coach’s default rate later does not rewrite this snapshot.";

export const COACH_DEFAULT_RATE_NOTE =
  "Changing the default rate does not rewrite existing session snapshots.";

export const SLOT_LOCKED_UNTIL_CANCEL_NOTE =
  "The slot stays locked until an admin completes the cancellation. Completing cancellation releases the slot and may promote the waitlist.";

export const NO_REFUND_ON_NOSHOW_NOTE = "No-show receives no refund.";

export const MANUAL_REFUND_NOTE =
  "Refund money moves outside the app. These controls only record refund status.";

export const RESCHEDULE_HISTORY_NOTE = "Approving a move preserves the original booking history.";

export const REPORT_TERMS = [
  "Gross Sales",
  "Refunds",
  "Net Sales",
  "Coach Cost",
  "Gross Contribution",
  "Occupancy",
  "Attendance Utilization",
] as const;

export const FORBIDDEN_REPORT_TERM = "profit";

export const COACH_RATE_TYPE_LABELS: Record<CoachRateType, string> = {
  PER_SESSION: "Per Session",
  PER_HOUR: "Per Hour",
};

export function coachRateTypeLabel(type: CoachRateType): string {
  return COACH_RATE_TYPE_LABELS[type];
}

export function validateAdminLogin(
  input: LoginInput,
):
  | { ok: false; errors: FieldErrors<"email" | "password" | "form"> }
  | { ok: true; staffId: string } {
  const errors: FieldErrors<"email" | "password" | "form"> = {};
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (!input.password) errors.password = "Password is required.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const email = input.email.trim().toLowerCase();
  const nonAdmin = MOCK_NON_ADMIN_CREDENTIALS.find(
    (row) => row.email.toLowerCase() === email && row.password === input.password,
  );
  if (nonAdmin) {
    return {
      ok: false,
      errors: { form: "This account is not an admin. Contact the system administrator." },
    };
  }

  const match = MOCK_ADMIN_CREDENTIALS.find(
    (row) => row.email.toLowerCase() === email && row.password === input.password,
  );
  if (!match) {
    return { ok: false, errors: { form: "Those credentials are not recognised in this mock." } };
  }
  return { ok: true, staffId: match.staffId };
}

export function safeAdminPath(
  returnTo: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!returnTo) return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  return returnTo;
}

export type AdminSession = PublicSession & {
  bookable: boolean;
  coachRatePhp: number;
  coachRateType: CoachRateType;
};

export function toPublicSession(session: AdminSession): PublicSession {
  const {
    bookable: _bookable,
    coachRatePhp: _rate,
    coachRateType: _type,
    ...publicSession
  } = session;
  return publicSession;
}

export type AdminClass = PublicClass & {
  associatedCoachIds: string[];
};

export type PolicyDocumentVersion = {
  id: string;
  documentName: string;
  version: string;
  promotedAt: string;
  current: boolean;
};

export type AdminSettings = PublicContent &
  PaymentInstructions & {
    businessName: string;
    openingHours: string;
    policyDocuments: PolicyDocumentVersion[];
  };

export type AdminCustomerDetail = AdminCustomer & {
  upcoming: CustomerBooking[];
  pending: CustomerBooking[];
  history: CustomerBooking[];
  requestHistory: CustomerBooking[];
  attendanceHistory: CustomerBooking[];
  paymentHistory: CustomerBooking[];
  policyAcceptances: PolicyAcceptance[];
};

export type AdminDashboardSnapshot = {
  todaysClasses: number;
  pendingPayments: number;
  cancellations: number;
  reschedules: number;
  waitlisted: number;
  attention: {
    payments: number;
    cancellations: number;
    reschedules: number;
  };
  todaysSchedule: AdminSession[];
  todaysSalesPhp: number;
  pendingRefundsPhp: number;
  todaysOccupancy: number;
  coachCostTodayPhp: number;
};

export type AdminBookingTab = "pending" | "confirmed" | "waitlisted" | "expired" | "history";

export const ADMIN_BOOKING_TABS: { id: AdminBookingTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "waitlisted", label: "Waitlisted" },
  { id: "expired", label: "Expired" },
  { id: "history", label: "History" },
];

export function adminBookingTab(status: CustomerBooking["status"]): AdminBookingTab[] {
  const tabs: AdminBookingTab[] = [];
  if (
    status === "HELD_AWAITING_PAYMENT" ||
    status === "PAYMENT_SUBMITTED" ||
    status === "CANCELLATION_REQUESTED" ||
    status === "RESCHEDULE_REQUESTED"
  ) {
    tabs.push("pending");
  }
  if (status === "CONFIRMED" || status === "CHECKED_IN") tabs.push("confirmed");
  if (status === "WAITLISTED") tabs.push("waitlisted");
  if (status === "EXPIRED") tabs.push("expired");
  if (
    status === "CANCELLED" ||
    status === "REJECTED" ||
    status === "EXPIRED" ||
    status === "COMPLETED" ||
    status === "NO_SHOW"
  ) {
    tabs.push("history");
  }
  return tabs;
}

export function filterAdminBookings(
  bookings: CustomerBooking[],
  filters: { tab: AdminBookingTab; query?: string; classId?: string; date?: string },
  customerName: (customerId: string) => string,
): CustomerBooking[] {
  return bookings.filter((booking) => {
    if (!adminBookingTab(booking.status).includes(filters.tab)) return false;
    if (
      filters.classId &&
      filters.classId !== "all" &&
      booking.session.classId !== filters.classId
    ) {
      return false;
    }
    if (filters.date && manilaYmd(booking.session.startsAt) !== filters.date) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!customerName(booking.customerId).toLowerCase().includes(q) && !booking.id.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export const ADMIN_BOOKING_PAGE_SIZE = 8;

export function paginateRows<T>(rows: T[], page: number, pageSize = ADMIN_BOOKING_PAGE_SIZE): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/** BE-050 sort ids — mock queues must use these, not invented names. */
export const ADMIN_REQUEST_QUEUE_SORT = "requestedAt_desc_id_desc";
export const ADMIN_PAYMENT_HOLD_SORT = "holdExpiresAt_asc_id_asc";
export const ADMIN_PAYMENT_REFUND_SORT = "createdAt_desc_id_desc";

type CursorPayload = { v: 1; s: string; k: string | null; i: string };

/**
 * Opaque keyset cursor. Shape is mirrored from `packages/api/src/cursor.ts`
 * so BE-050 and the mock stay byte-compatible. Do not import `@balanse/api`.
 */
function encodeCursor(sort: string, key: string | null, id: string): string {
  const payload: CursorPayload = { v: 1, s: sort, k: key, i: id };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/**
 * Decode + validate. A mismatched `s` or malformed payload throws
 * `invalid_cursor` — never silently restart at page 1.
 * Mirrored from `packages/api/src/cursor.ts`.
 */
function decodeCursor(
  raw: string | null | undefined,
  expectedSort: string,
): { key: string | null; id: string } | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as CursorPayload;
    if (parsed.v !== 1 || parsed.s !== expectedSort || typeof parsed.i !== "string") {
      throw new Error("shape");
    }
    return { key: parsed.k ?? null, id: parsed.i };
  } catch {
    throw Object.assign(new Error("Cursor is malformed or does not match this list."), {
      code: "invalid_cursor",
    });
  }
}

function parseSortDirections(sort: string): { keyDir: "asc" | "desc"; idDir: "asc" | "desc" } {
  const match = sort.match(/_(asc|desc)_id_(asc|desc)$/);
  if (!match || (match[1] !== "asc" && match[1] !== "desc")) {
    throw Object.assign(new Error("Cursor is malformed or does not match this list."), {
      code: "invalid_cursor",
    });
  }
  const idDir = match[2] === "asc" || match[2] === "desc" ? match[2] : "desc";
  return { keyDir: match[1], idDir };
}

function compareNullable(a: string | null, b: string | null): number {
  return (a ?? "").localeCompare(b ?? "");
}

function isAfterCursor(
  key: string | null,
  id: string,
  cursorKey: string | null,
  cursorId: string,
  keyDir: "asc" | "desc",
  idDir: "asc" | "desc",
): boolean {
  const keyCmp = compareNullable(key, cursorKey);
  if (keyCmp !== 0) {
    return keyDir === "asc" ? keyCmp > 0 : keyCmp < 0;
  }
  const idCmp = id.localeCompare(cursorId);
  return idDir === "asc" ? idCmp > 0 : idCmp < 0;
}

/**
 * Keyset page over an already-sorted array. Mirrors packages/api/src/cursor.ts so
 * BE-050 and the mock agree on cursor shape and sort ids.
 */
export function sliceCursorPage<T extends { id: string }>(
  sorted: T[],
  opts: { sort: string; limit?: number; cursor?: string | null; keyOf: (row: T) => string | null },
): CursorPage<T> {
  const rawLimit = opts.limit ?? ADMIN_CURSOR_LIMIT_DEFAULT;
  const limit = Math.min(
    ADMIN_CURSOR_LIMIT_MAX,
    Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : ADMIN_CURSOR_LIMIT_DEFAULT),
  );
  const decoded = decodeCursor(opts.cursor, opts.sort);
  const { keyDir, idDir } = parseSortDirections(opts.sort);
  const remaining = decoded
    ? sorted.filter((row) =>
        isAfterCursor(opts.keyOf(row), row.id, decoded.key, decoded.id, keyDir, idDir),
      )
    : sorted;
  const hasMore = remaining.length > limit;
  const items = hasMore ? remaining.slice(0, limit) : remaining;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(opts.sort, opts.keyOf(last), last.id) : null,
    totalCount: sorted.length,
  };
}

export function countsTowardGrossSales(booking: CustomerBooking): boolean {
  if (booking.status === "WAITLISTED") return false;
  if (booking.status === "HELD_AWAITING_PAYMENT") return false;
  if (booking.paymentStatus !== "VERIFIED" && booking.paymentStatus !== "CASH_RECEIVED") {
    return false;
  }
  return true;
}

export function countsTowardRefunds(booking: CustomerBooking): boolean {
  return booking.refundStatus === "REFUNDED";
}

export type AdminReportFilters = {
  from: string;
  to: string;
  classId?: string;
  coachId?: string;
  sessionStatus?: SessionStatus | "all";
};

export type SalesOverview = {
  grossSalesPhp: number;
  refundsPhp: number;
  netSalesPhp: number;
  paidBookings: number;
};

export type ClassPerformanceRow = {
  classId: string;
  className: string;
  sessions: number;
  revenuePhp: number;
  occupancy: number;
  noShows: number;
};

export type CoachCostRow = {
  coachId: string;
  coachName: string;
  sessions: number;
  coachCostPhp: number;
  relatedRevenuePhp: number;
};

export type SessionPerformanceRow = {
  sessionId: string;
  startsAt: string;
  className: string;
  capacity: number;
  confirmed: number;
  revenuePhp: number;
  coachCostPhp: number;
};

export type SessionReportDrilldown = {
  sessionId: string;
  className: string;
  startsAt: string;
  capacity: number;
  confirmed: number;
  held: number;
  available: number;
  waitlisted: number;
  checkedIn: number;
  noShow: number;
  customerPricePhp: number;
  grossRevenuePhp: number;
  refundsPhp: number;
  coachCostPhp: number;
  grossContributionPhp: number;
  occupancy: number;
  attendanceUtilisation: number;
};

export type AdminReports = {
  overview: SalesOverview;
  classPerformance: ClassPerformanceRow[];
  coachCosts: CoachCostRow[];
  sessionPerformance: SessionPerformanceRow[];
};

export function sessionInReportRange(session: PublicSession, filters: AdminReportFilters): boolean {
  const day = manilaYmd(session.startsAt);
  if (day < filters.from || day > filters.to) return false;
  if (filters.classId && filters.classId !== "all" && session.classId !== filters.classId) {
    return false;
  }
  if (filters.coachId && filters.coachId !== "all" && session.coachId !== filters.coachId) {
    return false;
  }
  if (
    filters.sessionStatus &&
    filters.sessionStatus !== "all" &&
    session.status !== filters.sessionStatus
  ) {
    return false;
  }
  return true;
}

export function computeSessionInventory(
  session: Pick<PublicSession, "capacity">,
  bookings: CustomerBooking[],
): {
  confirmed: number;
  held: number;
  available: number;
  waitlisted: number;
  checkedIn: number;
  noShow: number;
  lockedByCancellation: number;
} {
  const confirmed = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "COMPLETED",
  ).length;
  const held = bookings.filter(
    (b) =>
      b.status === "HELD_AWAITING_PAYMENT" ||
      b.status === "PAYMENT_SUBMITTED" ||
      b.status === "CANCELLATION_REQUESTED" ||
      b.status === "RESCHEDULE_REQUESTED",
  ).length;
  const lockedByCancellation = bookings.filter((b) => b.status === "CANCELLATION_REQUESTED").length;
  const waitlisted = bookings.filter((b) => b.status === "WAITLISTED").length;
  const checkedIn = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const noShow = bookings.filter((b) => b.status === "NO_SHOW").length;
  const available = Math.max(0, session.capacity - confirmed - held);
  return {
    confirmed,
    held,
    available,
    waitlisted,
    checkedIn,
    noShow,
    lockedByCancellation,
  };
}

export function occupancyRatio(confirmed: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return confirmed / capacity;
}

export function attendanceUtilisation(checkedIn: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return checkedIn / capacity;
}

export function formatRatioPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function computeAdminReports(
  sessions: AdminSession[],
  bookings: CustomerBooking[],
  filters: AdminReportFilters,
): AdminReports {
  const scopedSessions = sessions.filter((session) => sessionInReportRange(session, filters));
  const scopedIds = new Set(scopedSessions.map((s) => s.id));
  const scopedBookings = bookings.filter((b) => scopedIds.has(b.sessionId));

  const paid = scopedBookings.filter(countsTowardGrossSales);
  const refunded = scopedBookings.filter(countsTowardRefunds);
  const grossSalesPhp = paid.reduce((sum, b) => sum + b.session.pricePhp, 0);
  const refundsPhp = refunded.reduce((sum, b) => sum + b.session.pricePhp, 0);

  const classMap = new Map<string, ClassPerformanceRow>();
  const coachMap = new Map<string, CoachCostRow>();
  const sessionPerformance: SessionPerformanceRow[] = [];

  for (const session of scopedSessions) {
    const rows = scopedBookings.filter((b) => b.sessionId === session.id);
    const inventory = computeSessionInventory(session, rows);
    const revenuePhp = rows
      .filter(countsTowardGrossSales)
      .reduce((sum, b) => sum + b.session.pricePhp, 0);
    const noShows = rows.filter((b) => b.status === "NO_SHOW").length;
    sessionPerformance.push({
      sessionId: session.id,
      startsAt: session.startsAt,
      className: session.className,
      capacity: session.capacity,
      confirmed: inventory.confirmed,
      revenuePhp,
      coachCostPhp: session.coachRatePhp,
    });

    const classRow = classMap.get(session.classId) ?? {
      classId: session.classId,
      className: session.className,
      sessions: 0,
      revenuePhp: 0,
      occupancy: 0,
      noShows: 0,
    };
    classRow.sessions += 1;
    classRow.revenuePhp += revenuePhp;
    classRow.noShows += noShows;
    classRow.occupancy += occupancyRatio(inventory.confirmed, session.capacity);
    classMap.set(session.classId, classRow);

    const coachRow = coachMap.get(session.coachId) ?? {
      coachId: session.coachId,
      coachName: session.coachName,
      sessions: 0,
      coachCostPhp: 0,
      relatedRevenuePhp: 0,
    };
    coachRow.sessions += 1;
    coachRow.coachCostPhp += session.coachRatePhp;
    coachRow.relatedRevenuePhp += revenuePhp;
    coachMap.set(session.coachId, coachRow);
  }

  const classPerformance = [...classMap.values()].map((row) => ({
    ...row,
    occupancy: row.sessions ? row.occupancy / row.sessions : 0,
  }));

  return {
    overview: {
      grossSalesPhp,
      refundsPhp,
      netSalesPhp: grossSalesPhp - refundsPhp,
      paidBookings: paid.length,
    },
    classPerformance,
    coachCosts: [...coachMap.values()],
    sessionPerformance,
  };
}

export function computeSessionDrilldown(
  session: AdminSession,
  bookings: CustomerBooking[],
): SessionReportDrilldown {
  const rows = bookings.filter((b) => b.sessionId === session.id);
  const inventory = computeSessionInventory(session, rows);
  const grossRevenuePhp = rows
    .filter(countsTowardGrossSales)
    .reduce((sum, b) => sum + b.session.pricePhp, 0);
  const refundsPhp = rows
    .filter(countsTowardRefunds)
    .reduce((sum, b) => sum + b.session.pricePhp, 0);
  return {
    sessionId: session.id,
    className: session.className,
    startsAt: session.startsAt,
    capacity: session.capacity,
    confirmed: inventory.confirmed,
    held: inventory.held,
    available: inventory.available,
    waitlisted: inventory.waitlisted,
    checkedIn: inventory.checkedIn,
    noShow: inventory.noShow,
    customerPricePhp: session.pricePhp,
    grossRevenuePhp,
    refundsPhp,
    coachCostPhp: session.coachRatePhp,
    grossContributionPhp: grossRevenuePhp - refundsPhp - session.coachRatePhp,
    occupancy: occupancyRatio(inventory.confirmed, session.capacity),
    attendanceUtilisation: attendanceUtilisation(inventory.checkedIn, session.capacity),
  };
}

export function validateSessionCapacity(
  nextCapacity: number,
  consumed: number,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(nextCapacity) || nextCapacity < 1) {
    return { ok: false, error: "Capacity must be at least 1." };
  }
  if (nextCapacity < consumed) {
    return {
      ok: false,
      error: "Capacity cannot be below current confirmed and held bookings.",
    };
  }
  return { ok: true };
}

export function canApproveReschedule(
  target: PublicSession,
): { ok: true } | { ok: false; error: string } {
  if (target.remainingSlots <= 0) {
    return { ok: false, error: "The requested session has no remaining capacity." };
  }
  return { ok: true };
}

export function staffStatusLabel(status: AdminStaff["status"]): string {
  return status === "active" ? "Active" : "Disabled";
}

export function auditConfirmationCopy(action: string, actor = "Admin", atIso?: string): string {
  const when = atIso ?? new Date().toISOString();
  return `${action} will be audited as ${actor} at ${when}.`;
}

export function paymentQueueKind(booking: CustomerBooking): "gcash" | "counter" | "refund" | null {
  if (booking.refundStatus === "REFUND_PENDING" || booking.refundStatus === "REFUNDED") {
    return "refund";
  }
  if (booking.paymentMethod === "GCASH" && booking.paymentStatus === "PROOF_SUBMITTED") {
    return "gcash";
  }
  if (
    booking.paymentMethod === "PAY_AT_COUNTER" ||
    (booking.status === "HELD_AWAITING_PAYMENT" && booking.paymentMethod !== "GCASH")
  ) {
    return "counter";
  }
  return null;
}

export type AdminPaymentTab = "gcash" | "counter" | "refunds";

export function filterPaymentQueue(
  bookings: CustomerBooking[],
  tab: AdminPaymentTab,
): CustomerBooking[] {
  return bookings.filter((booking) => {
    const kind = paymentQueueKind(booking);
    if (tab === "refunds") return kind === "refund";
    if (tab === "gcash") return kind === "gcash";
    return kind === "counter";
  });
}

export function isPaidStatus(status: PaymentStatus): boolean {
  return status === "VERIFIED" || status === "CASH_RECEIVED";
}

export function buildAdminCustomerRow(
  profile: {
    id: string;
    fullName: string;
    email: string;
    contactNumber: string;
    authMethod: "email" | "google";
  },
  bookings: CustomerBooking[],
): AdminCustomer {
  const mine = bookings.filter((b) => b.customerId === profile.id);
  const upcoming = mine.filter(
    (b) =>
      adminBookingTab(b.status).includes("confirmed") ||
      b.status === "HELD_AWAITING_PAYMENT" ||
      b.status === "PAYMENT_SUBMITTED",
  );
  const lastVisit = mine
    .filter((b) => b.status === "COMPLETED" || b.status === "CHECKED_IN" || b.status === "NO_SHOW")
    .sort((a, b) => b.session.startsAt.localeCompare(a.session.startsAt))[0];
  return {
    ...profile,
    bookingCount: mine.length,
    upcomingCount: upcoming.length,
    lastVisitAt: lastVisit?.session.startsAt ?? null,
  };
}

export function buildAdminDashboard(
  sessions: AdminSession[],
  bookings: CustomerBooking[],
  todayYmd: string,
): AdminDashboardSnapshot {
  const todaysSchedule = sessions.filter((s) => manilaYmd(s.startsAt) === todayYmd);
  const pendingPayments = filterPaymentQueue(bookings, "gcash").length;
  const cancellations = bookings.filter((b) => b.status === "CANCELLATION_REQUESTED").length;
  const reschedules = bookings.filter((b) => b.status === "RESCHEDULE_REQUESTED").length;
  const waitlisted = bookings.filter((b) => b.status === "WAITLISTED").length;
  const todaysBookings = bookings.filter((b) => todaysSchedule.some((s) => s.id === b.sessionId));
  const todaysSalesPhp = todaysBookings
    .filter(countsTowardGrossSales)
    .reduce((sum, b) => sum + b.session.pricePhp, 0);
  const pendingRefundsPhp = bookings
    .filter((b) => b.refundStatus === "REFUND_PENDING")
    .reduce((sum, b) => sum + b.session.pricePhp, 0);
  const cap = todaysSchedule.reduce((sum, s) => sum + s.capacity, 0);
  const confirmed = todaysSchedule.reduce((sum, s) => {
    const inv = computeSessionInventory(
      s,
      bookings.filter((b) => b.sessionId === s.id),
    );
    return sum + inv.confirmed;
  }, 0);
  const coachCostTodayPhp = todaysSchedule.reduce((sum, s) => sum + s.coachRatePhp, 0);
  return {
    todaysClasses: todaysSchedule.length,
    pendingPayments,
    cancellations,
    reschedules,
    waitlisted,
    attention: {
      payments: pendingPayments,
      cancellations,
      reschedules,
    },
    todaysSchedule,
    todaysSalesPhp,
    pendingRefundsPhp,
    todaysOccupancy: occupancyRatio(confirmed, cap),
    coachCostTodayPhp,
  };
}

export function snapshotRateFromCoach(
  coach: AdminCoach,
): Pick<AdminSession, "coachRatePhp" | "coachRateType"> {
  return { coachRatePhp: coach.defaultRatePhp, coachRateType: coach.rateType };
}

export { HOLD_DURATION_HOURS };

export const ALL_BOOKING_STATUSES_FOR_TABLE = BOOKING_STATUSES;
