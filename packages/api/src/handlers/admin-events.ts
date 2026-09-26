import type { Prisma } from "@balanse/db";
import {
  type AdminEvent,
  EVENT_CONFLICT_MESSAGES,
  EVENT_STATUSES,
  type EventStatus,
  eventStatusLabel,
  FIELD_CONSTRAINTS,
  sessionStatusLabel,
} from "@balanse/domain";
import { requireActiveStaff, requireAnyPermission, requirePermission, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, readJson, searchParams } from "../http";
import { fieldError, optionalString, requireString, throwFields } from "../validation";

const EVENT_READ = ["events.read", "events.manage"] as const;
const GALLERY_MAX = FIELD_CONSTRAINTS.event.galleryImages.maxItems;

const eventInclude = {
  session: {
    select: {
      id: true,
      classId: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      customerPrice: true,
      status: true,
    },
  },
} satisfies Prisma.SessionEventInclude;

type EventRow = Prisma.SessionEventGetPayload<{ include: typeof eventInclude }>;

const SESSION_OWNED_KEYS = [
  "startsAt",
  "endsAt",
  "capacity",
  "customerPrice",
  "price",
  "classId",
  "coachId",
  "coachIds",
  "coachRate",
  "coachRatePhp",
  "coachRateType",
  "coaches",
  "coachAssignments",
  "sessionStatus",
] as const;

/**
 * Cancels a still-live event when its session is cancelled.
 * Archived and already-cancelled events stay put so a retry writes no second audit row.
 * The session-event trigger writes the single `event.status` audit row.
 */
export async function cancelLiveSessionEvent(
  tx: Prisma.TransactionClient,
  actorStaffId: string,
  sessionId: string,
): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.actor_staff_id', ${actorStaffId}, true)`;
  const event = await tx.sessionEvent.findUnique({
    where: { sessionId },
    select: { id: true, status: true },
  });
  if (!event || (event.status !== "DRAFT" && event.status !== "PUBLISHED")) return;
  await tx.sessionEvent.update({ where: { id: event.id }, data: { status: "CANCELLED" } });
}

function php(value: Prisma.Decimal | string | number): string {
  return Number(value).toFixed(2);
}

export function presentAdminEvent(row: EventRow): AdminEvent {
  return {
    id: row.id,
    sessionId: row.sessionId,
    title: row.title,
    summary: row.summary,
    description: row.description,
    posterImage: row.posterImage,
    galleryImages: row.galleryImages,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    beneficiary: row.beneficiary,
    whatToBring: row.whatToBring,
    internalNotes: row.internalNotes,
    registrationOpensAt: row.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: row.registrationClosesAt?.toISOString() ?? null,
    status: row.status,
    statusLabel: eventStatusLabel(row.status),
    isPlaceholder: row.isPlaceholder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    session: {
      id: row.session.id,
      classId: row.session.classId,
      startsAt: row.session.startsAt.toISOString(),
      endsAt: row.session.endsAt.toISOString(),
      capacity: row.session.capacity,
      customerPrice: php(row.session.customerPrice),
      status: row.session.status,
      statusLabel: sessionStatusLabel(row.session.status),
    },
  };
}

function assertNoSessionMutation(body: Record<string, unknown>): void {
  for (const key of SESSION_OWNED_KEYS) {
    if (key in body) {
      throwFields(
        fieldError(
          key,
          "read_only",
          "Session date, time, capacity, and price are edited on the session, not the event.",
        ),
      );
    }
  }
  if ("status" in body) {
    throwFields(
      fieldError("status", "read_only", "Change event status with publish, cancel, or archive."),
    );
  }
  if ("slug" in body) {
    throwFields(fieldError("slug", "read_only", "Events do not have a public slug."));
  }
  if ("isPlaceholder" in body) {
    throwFields(fieldError("isPlaceholder", "read_only", "isPlaceholder is reserved for seeds."));
  }
}

function readGallery(body: Record<string, unknown>): string[] | undefined {
  if (!("galleryImages" in body)) return undefined;
  const value = body.galleryImages;
  if (!Array.isArray(value)) {
    throwFields(
      fieldError("galleryImages", "invalid_type", "galleryImages must be a list of image keys."),
    );
  }
  if (value.length > GALLERY_MAX) {
    throwFields(
      fieldError("galleryImages", "out_of_range", `At most ${GALLERY_MAX} gallery images.`),
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throwFields(
        fieldError(
          `galleryImages.${index}`,
          "invalid_type",
          "Each gallery image must be an object key.",
        ),
      );
    }
    const trimmed = item.trim();
    if (trimmed.length > FIELD_CONSTRAINTS.event.galleryImages.itemMax) {
      throwFields(
        fieldError(
          `galleryImages.${index}`,
          "too_long",
          `Image key must be at most ${FIELD_CONSTRAINTS.event.galleryImages.itemMax} characters.`,
        ),
      );
    }
    return trimmed;
  });
}

function readPoster(body: Record<string, unknown>): string | null | undefined {
  if (!("posterImage" in body)) return undefined;
  const value = body.posterImage;
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throwFields(
      fieldError("posterImage", "invalid_type", "posterImage must be an object key or null."),
    );
  }
  const trimmed = value.trim();
  if (trimmed.length > FIELD_CONSTRAINTS.event.posterImage.max) {
    throwFields(
      fieldError(
        "posterImage",
        "too_long",
        `posterImage must be at most ${FIELD_CONSTRAINTS.event.posterImage.max} characters.`,
      ),
    );
  }
  return trimmed;
}

function readTimestamp(
  body: Record<string, unknown>,
  path: "registrationOpensAt" | "registrationClosesAt",
): Date | null | undefined {
  if (!(path in body)) return undefined;
  const value = body[path];
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throwFields(fieldError(path, "invalid_type", `${path} must be an ISO datetime or null.`));
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throwFields(fieldError(path, "invalid_format", `${path} must be a valid datetime.`));
  }
  return date;
}

function assertRegistrationWindow(opens: Date | null, closes: Date | null): void {
  if (opens && closes && closes < opens) {
    throwFields(
      fieldError(
        "registrationClosesAt",
        "ends_before_start",
        "Registration close must be on or after registration open.",
      ),
    );
  }
}

function textField(
  body: Record<string, unknown>,
  path:
    | "summary"
    | "description"
    | "venueName"
    | "venueAddress"
    | "beneficiary"
    | "whatToBring"
    | "internalNotes",
): string | undefined {
  const max = FIELD_CONSTRAINTS.event[path].max;
  if (!(path in body)) return undefined;
  const value = body[path];
  if (value === null) return "";
  return optionalString(body, path, max) ?? "";
}

async function withActor<T>(
  deps: ApiDeps,
  staffId: string,
  run: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return deps.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.actor_staff_id', ${staffId}, true)`;
    return run(tx);
  });
}

async function loadEvent(deps: ApiDeps, id: string): Promise<EventRow> {
  const row = await deps.prisma.sessionEvent.findUnique({ where: { id }, include: eventInclude });
  if (!row) throw new ApiError(404, "event_not_found", "Event not found.");
  return row;
}

function compareUpcomingFirst(a: EventRow, b: EventRow, now: number): number {
  const aStart = a.session.startsAt.getTime();
  const bStart = b.session.startsAt.getTime();
  const aUpcoming = aStart >= now;
  const bUpcoming = bStart >= now;
  if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
  if (aStart !== bStart) return aUpcoming ? aStart - bStart : bStart - aStart;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export async function getAdminEvents(deps: ApiDeps, req: Request): Promise<Response> {
  requireAnyPermission(requireActiveStaff(await resolveActor(deps, req)), EVENT_READ);
  const params = searchParams(req);
  const where: Prisma.SessionEventWhereInput = {};
  const status = params.get("status");
  if (status) {
    if (!EVENT_STATUSES.includes(status as EventStatus)) {
      throwFields(
        fieldError(
          "status",
          "invalid_enum",
          "Status must be DRAFT, PUBLISHED, CANCELLED, or ARCHIVED.",
        ),
      );
    }
    where.status = status as EventStatus;
  }
  const sessionId = params.get("sessionId") ?? params.get("session");
  if (sessionId) where.sessionId = sessionId;
  const fromRaw = params.get("from") ?? params.get("dateFrom");
  const toRaw = params.get("to") ?? params.get("dateTo");
  if (fromRaw || toRaw) {
    const startsAt: Prisma.DateTimeFilter = {};
    if (fromRaw) {
      const from = new Date(fromRaw);
      if (Number.isNaN(from.getTime())) {
        throw new ApiError(400, "invalid_date_range", "from is not a valid datetime.", {
          fields: { from: "Invalid datetime." },
        });
      }
      startsAt.gte = from;
    }
    if (toRaw) {
      const to = new Date(toRaw);
      if (Number.isNaN(to.getTime())) {
        throw new ApiError(400, "invalid_date_range", "to is not a valid datetime.", {
          fields: { to: "Invalid datetime." },
        });
      }
      startsAt.lt = to;
    }
    if (startsAt.gte && startsAt.lt && startsAt.gte >= startsAt.lt) {
      throw new ApiError(400, "invalid_date_range", "from must be earlier than to.", {
        fields: { from: "Must be earlier than to." },
      });
    }
    where.session = { startsAt };
  }
  const rows = await deps.prisma.sessionEvent.findMany({ where, include: eventInclude });
  const now = deps.now().getTime();
  rows.sort((a, b) => compareUpcomingFirst(a, b, now));
  return ok({ items: rows.map(presentAdminEvent) });
}

export async function getAdminEvent(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  requireAnyPermission(requireActiveStaff(await resolveActor(deps, req)), EVENT_READ);
  return ok({ event: presentAdminEvent(await loadEvent(deps, id)) });
}

export async function postAdminEvent(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requirePermission(
    requireActiveStaff(await resolveActor(deps, req)),
    "events.manage",
  );
  const body = await readJson(req);
  assertNoSessionMutation(body);
  const sessionId = requireString(body, "sessionId", 64);
  const title = requireString(body, "title", FIELD_CONSTRAINTS.event.title.max);
  const summary = textField(body, "summary") ?? "";
  const description = textField(body, "description") ?? "";
  const posterImage = readPoster(body) ?? null;
  const galleryImages = readGallery(body) ?? [];
  const venueName = textField(body, "venueName") ?? "";
  const venueAddress = textField(body, "venueAddress") ?? "";
  const beneficiary = textField(body, "beneficiary") ?? "";
  const whatToBring = textField(body, "whatToBring") ?? "";
  const internalNotes = textField(body, "internalNotes") ?? "";
  const registrationOpensAt = readTimestamp(body, "registrationOpensAt") ?? null;
  const registrationClosesAt = readTimestamp(body, "registrationClosesAt") ?? null;
  assertRegistrationWindow(registrationOpensAt, registrationClosesAt);

  const session = await deps.prisma.gymSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true },
  });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  if (session.status === "CANCELLED") {
    throw new ApiError(
      409,
      "event_on_cancelled_session",
      EVENT_CONFLICT_MESSAGES.event_on_cancelled_session,
      { details: { sessionStatus: session.status } },
    );
  }
  const existing = await deps.prisma.sessionEvent.findUnique({
    where: { sessionId },
    select: { id: true },
  });
  if (existing) {
    throw new ApiError(409, "event_session_taken", EVENT_CONFLICT_MESSAGES.event_session_taken, {
      details: { eventId: existing.id, sessionId },
    });
  }

  const created = await withActor(deps, actor.staffId, (tx) =>
    tx.sessionEvent.create({
      data: {
        sessionId,
        title,
        summary,
        description,
        posterImage,
        galleryImages,
        venueName,
        venueAddress,
        beneficiary,
        whatToBring,
        internalNotes,
        registrationOpensAt,
        registrationClosesAt,
        status: "DRAFT",
      },
      include: eventInclude,
    }),
  );
  return ok({ event: presentAdminEvent(created) });
}

export async function patchAdminEvent(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requirePermission(
    requireActiveStaff(await resolveActor(deps, req)),
    "events.manage",
  );
  const existing = await loadEvent(deps, id);
  const body = await readJson(req);
  assertNoSessionMutation(body);
  if ("sessionId" in body) {
    throwFields(
      fieldError("sessionId", "read_only", "An event stays on the session it was created for."),
    );
  }
  const title =
    "title" in body ? requireString(body, "title", FIELD_CONSTRAINTS.event.title.max) : undefined;
  const summary = textField(body, "summary");
  const description = textField(body, "description");
  const posterImage = readPoster(body);
  const galleryImages = readGallery(body);
  const venueName = textField(body, "venueName");
  const venueAddress = textField(body, "venueAddress");
  const beneficiary = textField(body, "beneficiary");
  const whatToBring = textField(body, "whatToBring");
  const internalNotes = textField(body, "internalNotes");
  const registrationOpensAt = readTimestamp(body, "registrationOpensAt");
  const registrationClosesAt = readTimestamp(body, "registrationClosesAt");
  assertRegistrationWindow(
    registrationOpensAt === undefined ? existing.registrationOpensAt : registrationOpensAt,
    registrationClosesAt === undefined ? existing.registrationClosesAt : registrationClosesAt,
  );

  const data: Prisma.SessionEventUpdateInput = {
    ...(title !== undefined ? { title } : {}),
    ...(summary !== undefined ? { summary } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(posterImage !== undefined ? { posterImage } : {}),
    ...(galleryImages !== undefined ? { galleryImages } : {}),
    ...(venueName !== undefined ? { venueName } : {}),
    ...(venueAddress !== undefined ? { venueAddress } : {}),
    ...(beneficiary !== undefined ? { beneficiary } : {}),
    ...(whatToBring !== undefined ? { whatToBring } : {}),
    ...(internalNotes !== undefined ? { internalNotes } : {}),
    ...(registrationOpensAt !== undefined ? { registrationOpensAt } : {}),
    ...(registrationClosesAt !== undefined ? { registrationClosesAt } : {}),
  };
  if (Object.keys(data).length === 0) return ok({ event: presentAdminEvent(existing) });

  const updated = await withActor(deps, actor.staffId, (tx) =>
    tx.sessionEvent.update({ where: { id }, data, include: eventInclude }),
  );
  return ok({ event: presentAdminEvent(updated) });
}

async function setEventStatus(
  deps: ApiDeps,
  req: Request,
  id: string,
  status: EventStatus,
): Promise<Response> {
  const actor = requirePermission(
    requireActiveStaff(await resolveActor(deps, req)),
    "events.manage",
  );
  const existing = await loadEvent(deps, id);
  if (existing.status === status) return ok({ event: presentAdminEvent(existing) });
  if (status === "PUBLISHED" && existing.session.status !== "PUBLISHED") {
    const message =
      existing.session.status === "CANCELLED"
        ? "This session is cancelled, so the event cannot be published."
        : EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session;
    throw new ApiError(409, "event_publish_requires_published_session", message, {
      details: { sessionStatus: existing.session.status, eventStatus: existing.status },
    });
  }
  const updated = await withActor(deps, actor.staffId, (tx) =>
    tx.sessionEvent.update({ where: { id }, data: { status }, include: eventInclude }),
  );
  return ok({ event: presentAdminEvent(updated) });
}

export async function postPublishEvent(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  return setEventStatus(deps, req, id, "PUBLISHED");
}

export async function postCancelEvent(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  return setEventStatus(deps, req, id, "CANCELLED");
}

export async function postArchiveEvent(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  return setEventStatus(deps, req, id, "ARCHIVED");
}
