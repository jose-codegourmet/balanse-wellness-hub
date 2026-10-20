import type {
  AdminRosterPerson,
  AdminSession,
  CustomerBooking,
  DuplicateScheduleInput,
  PublicRoster,
  PublicSession,
  PublicSessionPage,
  RecurringScheduleInput,
  ScheduleGenerationResult,
  SessionStatus,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";
import { ApiError } from "./errors";
import { numberToPhp } from "./money";

export async function listPublicSessions(
  fetcher: ApiFetcher,
  range: { from: string; to: string },
): Promise<{ items: PublicSession[] }> {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  return fetcher(`/api/public/sessions?${params.toString()}`);
}

/** Full `PublicSessionPage` shape (WIRE-0403/0406, #361) — a superset of `PublicSession`. */
export async function getPublicSession(
  fetcher: ApiFetcher,
  id: string,
): Promise<PublicSessionPage> {
  return fetcher(`/api/public/sessions/${id}`);
}

export async function getPublicRoster(fetcher: ApiFetcher, id: string): Promise<PublicRoster> {
  return fetcher(`/api/public/sessions/${id}/roster`);
}

export type AdminSessionFilters = {
  from?: string;
  to?: string;
  classId?: string;
  coachId?: string;
  venueId?: string;
  status?: SessionStatus;
  page?: number;
  pageSize?: number;
};

/**
 * `GET /api/admin/sessions` paginates (unlike classes/coaches/venues); admin
 * screens still expect the full set in one shot (WIRE-0402/0406, #361), so
 * this defaults to the max page size rather than making every call site
 * pass one.
 */
export async function listAdminSessions(
  fetcher: ApiFetcher,
  filters: AdminSessionFilters = {},
): Promise<{ items: AdminSession[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.classId) params.set("classId", filters.classId);
  if (filters.coachId) params.set("coachId", filters.coachId);
  if (filters.venueId) params.set("venueId", filters.venueId);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 100));
  return fetcher(`/api/admin/sessions?${params.toString()}`);
}

export type SessionInput = {
  classId: string;
  venueId: string;
  name?: string | null;
  coachIds: string[];
  startsAt: string;
  endsAt: string;
  pricePhp: number;
  capacity: number;
  bookable: boolean;
  /** #380 — omitted means unchanged on PATCH and `true` on POST. */
  cancellable?: boolean;
  reschedulable?: boolean;
  status: SessionStatus;
};

/** `pricePhp` maps to the wire `customerPrice` field (money mapping, E01 (#356)). */
function sessionBody(input: Partial<SessionInput>): Record<string, unknown> {
  const { pricePhp, ...rest } = input;
  return { ...rest, ...(pricePhp !== undefined ? { customerPrice: numberToPhp(pricePhp) } : {}) };
}

/**
 * The inverse of `sessionBody` for validation errors: `out_of_range` and
 * `price_locked` arrive on `customerPrice`, but the form field is `pricePhp`.
 */
async function withSessionFieldPaths<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.fieldErrors?.some((field) => field.path === "customerPrice")
    ) {
      throw new ApiError(error.status, {
        code: error.code,
        message: error.message,
        fields: error.fields,
        fieldErrors: error.fieldErrors.map((field) =>
          field.path === "customerPrice" ? { ...field, path: "pricePhp" } : field,
        ),
        formErrors: error.formErrors,
        details: error.details,
      });
    }
    throw error;
  }
}

export async function createSession(
  fetcher: ApiFetcher,
  input: SessionInput,
): Promise<{ session: AdminSession }> {
  return withSessionFieldPaths(
    fetcher("/api/admin/sessions", { method: "POST", body: sessionBody(input) }),
  );
}

export async function patchSession(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<SessionInput> & { expectedStartsAt?: string; expectedEndsAt?: string },
): Promise<{ session: AdminSession }> {
  return withSessionFieldPaths(
    fetcher(`/api/admin/sessions/${id}`, { method: "PATCH", body: sessionBody(input) }),
  );
}

export async function cancelSession(
  fetcher: ApiFetcher,
  id: string,
): Promise<{
  session: { id: string; status: SessionStatus };
  newReservationsBlocked: boolean;
  affectedBookings: { id: string; status: string; profileId: string }[];
}> {
  return fetcher(`/api/admin/sessions/${id}/cancel`, { method: "POST" });
}

export async function duplicateSessions(
  fetcher: ApiFetcher,
  input: DuplicateScheduleInput,
): Promise<ScheduleGenerationResult> {
  return fetcher("/api/admin/sessions/duplicate", { method: "POST", body: input });
}

export async function createRecurrence(
  fetcher: ApiFetcher,
  sourceSessionId: string,
  input: Omit<RecurringScheduleInput, "sourceSessionId">,
): Promise<ScheduleGenerationResult> {
  return fetcher(`/api/admin/sessions/${sourceSessionId}/recurrence`, {
    method: "POST",
    body: input,
  });
}

export type AdminSessionRoster = {
  session: AdminSession;
  confirmed: CustomerBooking[];
  held: CustomerBooking[];
  waitlisted: CustomerBooking[];
  capacity: number;
  confirmedCount: number;
  heldCount: number;
  available: number;
  waitlistedCount: number;
  checkedIn: number;
  noShow: number;
  occupancy: number;
  attendanceUtilisation: number;
  people: Record<string, AdminRosterPerson>;
};

export async function getRoster(
  fetcher: ApiFetcher,
  sessionId: string,
): Promise<AdminSessionRoster> {
  return fetcher(`/api/admin/sessions/${sessionId}/roster`);
}

export async function checkIn(
  fetcher: ApiFetcher,
  sessionId: string,
  bookingId: string,
): Promise<{ bookingId: string; status: "CHECKED_IN" }> {
  return fetcher(`/api/admin/sessions/${sessionId}/check-in`, {
    method: "POST",
    body: { bookingId },
  });
}

export async function markNoShow(
  fetcher: ApiFetcher,
  sessionId: string,
  bookingId: string,
): Promise<{ bookingId: string; status: "NO_SHOW"; refundCreated: boolean }> {
  return fetcher(`/api/admin/sessions/${sessionId}/no-show`, {
    method: "POST",
    body: { bookingId },
  });
}
