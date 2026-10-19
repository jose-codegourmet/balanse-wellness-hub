import { randomUUID } from "node:crypto";
import type { Prisma } from "@balanse/db";
import type { PublicClass } from "@balanse/domain";
import {
  addCalendarDays,
  calendarDayDistance,
  datesForWeeklyRecurrence,
  FIELD_CONSTRAINTS,
  isManilaYmd,
  isSuperAdminRoleKey,
  manilaYmd,
  SIGNED_UPLOAD,
  sessionCoachCost,
  type Weekday,
} from "@balanse/domain";
import {
  requireAdmin,
  requireAnyPermission,
  requirePermission,
  resolveActor,
  writeAudit,
} from "../auth";
import { readClassCatalogue, writeClassCatalogue } from "../class-catalogue";
import {
  assertStaffCanCoach,
  coachRateValue,
  parseNewCoachProfile,
  parseSpecialties,
  sendsRate,
} from "../coach-profile";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, bearerToken, ok, pagination, readJson, searchParams } from "../http";
import { presentCoach, sessionAvailability } from "../presenters";
import {
  actorHas,
  canManageRates,
  canReadRates,
  maybeStripRates,
  sessionOwnedByActor,
} from "../sensitive";
import { sessionConsumedCapacity, sessionPastCutoff, sessionsAvailabilityFacts } from "../sql";
import {
  assertClassImageKey,
  assertOwnedCoachPhotoKey,
  confirmUpload,
  extensionFor,
  mintSignedUpload,
  retireAdminObject,
} from "../uploads";
import {
  fieldError,
  intValue,
  moneyValue,
  optionalNullableString,
  optionalString,
  requireString,
  throwFields,
} from "../validation";
import { cancelLiveSessionEvent } from "./admin-events";

/**
 * `writeClassCatalogue` throws plain `Error`s with user-facing copy
 * (WIRE-0501, #358). Map them onto the shapes the admin form / API client
 * already know how to surface.
 */
function mapClassCatalogueError(error: unknown): ApiError {
  const message = error instanceof Error ? error.message : "Class could not be saved.";
  if (message.includes("already in use")) {
    return new ApiError(409, "conflict", message, {
      fieldErrors: [{ path: "name", code: "duplicate_value", message }],
    });
  }
  if (message.includes("Sign in with")) {
    return new ApiError(403, "forbidden", message);
  }
  return new ApiError(422, "validation_failed", message, {
    fieldErrors: [],
    formErrors: [{ code: "invalid_format", message }],
  });
}

function parseClassInput(body: Record<string, unknown>): Omit<PublicClass, "id"> {
  return {
    name: requireString(body, "name", FIELD_CONSTRAINTS.class.name.max),
    slug: requireString(body, "slug", 100),
    customPageUrl: optionalNullableString(body, "customPageUrl") ?? null,
    shortDescription: requireString(
      body,
      "shortDescription",
      FIELD_CONSTRAINTS.class.shortDescription.max,
    ),
    description: optionalString(body, "description", 4000) ?? "",
    coachIds: parseClassCoachIds(body.coachIds),
    heroImage: optionalNullableString(body, "heroImage") ?? null,
    galleryImages: parseGalleryImages(body.galleryImages),
    defaultDurationMinutes: intValue(body, "defaultDurationMinutes", 1, 240, false) ?? null,
    defaultPricePhp: intValue(body, "defaultPricePhp", 0, 1_000_000, false) ?? null,
    active: body.active !== false,
  };
}

function parseClassCoachIds(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) {
    throwFields(fieldError("coachIds", "invalid_type", "coachIds must be a list of strings."));
  }
  return value as string[];
}

function parseGalleryImages(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((src) => typeof src !== "string")) {
    throwFields(
      fieldError("galleryImages", "invalid_type", "galleryImages must be a list of strings."),
    );
  }
  return value as string[];
}

/** Venue fields attached to admin session payloads. Staff notes stay on the venue resource. */
export const SESSION_VENUE_SELECT = {
  id: true,
  name: true,
  address: true,
  kind: true,
  active: true,
} satisfies Prisma.VenueSelect;

export type AdminSessionRow = {
  id: string;
  classId: string;
  venueId: string;
  name: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  bookable: boolean;
  customerPrice: Prisma.Decimal;
  recurrenceRuleId: string | null;
  gymClass: { name: string };
  venue: { id: string; name: string; address: string; kind: string; active: boolean };
  coaches: {
    coachId: string;
    coachRate: Prisma.Decimal;
    coachRateType: "PER_SESSION" | "PER_HOUR";
    coach: { id: string; name: string; photoKey: string | null; staffMemberId?: string | null };
  }[];
};

/** Full `AdminSession` shape (WIRE-0401/0402, #361), shared by every session-returning handler. */
export async function presentAdminSession(
  deps: ApiDeps,
  session: AdminSessionRow,
  consumed: number,
  /** Pass from `sessionsAvailabilityFacts` on list paths; single-row callers may omit it. */
  pastCutoff?: boolean,
) {
  const remainingSlots = Math.max(0, session.capacity - consumed);
  const now = deps.now();
  const pastStart = now >= session.startsAt;
  const resolvedPastCutoff = pastCutoff ?? (await sessionPastCutoff(deps, session.id));
  const availability = sessionAvailability({
    status: session.status,
    remainingSlots,
    pastStart,
    pastCutoff: resolvedPastCutoff,
  });
  const coaches = session.coaches.map((assignment) => presentCoach(assignment.coach));
  const coachAssignments = session.coaches.map((assignment) => ({
    coachId: assignment.coachId,
    coachRatePhp: Number(assignment.coachRate),
    coachRateType: assignment.coachRateType,
  }));
  const window = { startsAt: session.startsAt.toISOString(), endsAt: session.endsAt.toISOString() };
  return {
    id: session.id,
    name: session.name,
    classId: session.classId,
    className: session.gymClass.name,
    coaches: coaches.map(({ id, name, photoKey }) => ({ id, name, photoKey })),
    coachName: coaches.map((coach) => coach.name).join(" & "),
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    pricePhp: Number(session.customerPrice),
    capacity: session.capacity,
    remainingSlots,
    reservable:
      session.status === "PUBLISHED" &&
      session.bookable &&
      availability !== "past" &&
      availability !== "cancelled" &&
      availability !== "past_cutoff" &&
      remainingSlots > 0,
    availability,
    status: session.status,
    venueId: session.venueId,
    bookable: session.bookable,
    coachRatePhp: coachAssignments.reduce(
      (sum, assignment) => sum + sessionCoachCost(assignment, window),
      0,
    ),
    coachAssignments,
    recurrenceRuleId: session.recurrenceRuleId,
  };
}

/** Full `PublicClass` shape (WIRE-0502, #358), including `coachIds` from `class_marketing_coaches`. */
export async function getAdminClasses(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const { classes } = await readClassCatalogue(bearerToken(req) ?? undefined);
  return ok({ items: classes });
}

/**
 * Full `PublicClass` writer (WIRE-0501, #358): routes through the same
 * SECURITY INVOKER `save_class_catalogue` RPC as the class editor's direct
 * Supabase calls, using the caller's own bearer token so RLS applies as the
 * signed-in staff member (decision 7 — replaces the separate catalogue
 * cookie now that E02 (#357) resolves a real staff actor on every request).
 */
export async function postAdminClass(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const token = bearerToken(req);
  if (!token) throw new ApiError(401, "unauthorized", "Sign in required.");
  const body = await readJson(req);
  const input = parseClassInput(body);
  let saved: PublicClass;
  try {
    saved = await writeClassCatalogue(input, token);
  } catch (error) {
    throw mapClassCatalogueError(error);
  }
  await writeAudit(deps, {
    entityType: "class",
    entityId: saved.id,
    action: "class.create",
    actor,
  });
  return ok({ class: saved });
}

export async function patchAdminClass(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const token = bearerToken(req);
  if (!token) throw new ApiError(401, "unauthorized", "Sign in required.");
  const body = await readJson(req);
  const { classes } = await readClassCatalogue(token);
  const existing = classes.find((row) => row.id === id);
  if (!existing) throw new ApiError(404, "class_not_found", "Class not found.");
  const input = parseClassInput({ ...existing, ...body });
  let saved: PublicClass;
  try {
    saved = await writeClassCatalogue({ ...input, id }, token);
  } catch (error) {
    throw mapClassCatalogueError(error);
  }
  await writeAudit(deps, { entityType: "class", entityId: id, action: "class.update", actor });
  return ok({ class: saved });
}

/**
 * Super Admin hard delete. Classes with sessions (FK RESTRICT) or bundle
 * applicability are refused with 409 `class_in_use` so booking history and
 * bundle scope never change silently; deactivate those instead. Marketing
 * coach links and customer interests cascade in the database.
 */
export async function deleteAdminClass(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requirePermission(requireAdmin(await resolveActor(deps, req)), "classes.manage");
  if (!isSuperAdminRoleKey(actor.roleKey)) {
    throw new ApiError(403, "forbidden", "Only a Super Admin can delete classes.");
  }
  const gymClass = await deps.prisma.gymClass.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { sessions: true, bundleApplicability: true } },
    },
  });
  if (!gymClass) throw new ApiError(404, "class_not_found", "Class not found.");
  if (gymClass._count.sessions > 0 || gymClass._count.bundleApplicability > 0) {
    throw new ApiError(
      409,
      "class_in_use",
      gymClass._count.sessions > 0
        ? "This class has sessions. Deactivate it instead so past bookings keep their class."
        : "This class is part of a bundle. Remove it from the bundle or deactivate it instead.",
      {
        details: {
          sessions: gymClass._count.sessions,
          bundles: gymClass._count.bundleApplicability,
        },
      },
    );
  }
  await deps.prisma.gymClass.delete({ where: { id } });
  await writeAudit(deps, {
    entityType: "class",
    entityId: id,
    action: "class.delete",
    actor,
    metadata: { name: gymClass.name },
  });
  return ok({ deleted: true, id });
}

/**
 * BE-052 mint/confirm for class cover and gallery images. Keys are not scoped
 * to a class id because a new class has no id until it is saved; confirm
 * returns the public HTTPS URL, which the class form stores in `heroImage` /
 * `galleryImages`. Unconfirmed mints are reaped with other pending uploads.
 */
export async function postAdminClassImage(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requirePermission(requireAdmin(await resolveActor(deps, req)), "classes.manage");
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType) {
      throwFields(fieldError("contentType", "required", "contentType is required."));
    }
    const key = `marketing-assets/classes/${randomUUID()}.${extensionFor(contentType)}`;
    return ok(
      await mintSignedUpload(deps, actor, {
        bucket: "marketing-assets",
        purpose: "class_image",
        entityId: null,
        contentType,
        allowed: new Set(SIGNED_UPLOAD.classImageTypes),
        objectKey: key,
      }),
    );
  }
  assertClassImageKey(objectKey);
  await confirmUpload(deps, objectKey);
  return ok({ objectKey, url: deps.storage.publicUrl("marketing-assets", objectKey) });
}

export async function getAdminCoaches(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.coach.findMany({
    orderBy: { name: "asc" },
    ...(canReadRates(actor)
      ? {}
      : {
          select: {
            id: true,
            name: true,
            specialties: true,
            shortBio: true,
            photoKey: true,
            active: true,
            staffMemberId: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
  });
  return ok({ items: maybeStripRates(actor, items.map(presentCoach)) });
}

/**
 * Creates a coach profile for an existing staff member. A coach is always one staff
 * member; new people are invited through `POST /api/admin/staff` with `newCoach`.
 */
export async function postAdminCoach(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const staffId = asString(body.staffId)?.trim();
  if (!staffId) {
    throwFields(fieldError("staffId", "required", "Choose the staff member who is this coach."));
  }
  const staff = await deps.prisma.staffMember.findUnique({
    where: { id: staffId },
    select: { id: true, name: true, isSystem: true, status: true, coach: { select: { id: true } } },
  });
  assertStaffCanCoach(staff);
  const data = parseNewCoachProfile(actor, body, (staff as { name: string }).name);
  const created = await deps.prisma.coach.create({
    data: { ...data, staffMemberId: staffId },
  });
  await writeAudit(deps, {
    entityType: "coach",
    entityId: created.id,
    action: "coach.create",
    actor,
    metadata: { staffId },
  });
  return ok({ coach: maybeStripRates(actor, presentCoach(created)) });
}

export async function patchAdminCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = optionalString(body, "name", FIELD_CONSTRAINTS.coach.name.max);
  const shortBio = optionalString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max);
  if (!canManageRates(actor) && sendsRate(body)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: "coach_rates.manage" },
    });
  }
  const defaultRate = canManageRates(actor) ? coachRateValue(body) : undefined;
  const rateType = canManageRates(actor) ? asString(body.rateType) : undefined;
  if (rateType && rateType !== "PER_SESSION" && rateType !== "PER_HOUR") {
    throwFields(
      fieldError("rateType", "invalid_enum", "rateType must be PER_SESSION or PER_HOUR."),
    );
  }
  const updated = await deps.prisma.coach.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(shortBio !== undefined ? { shortBio } : {}),
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(Array.isArray(body.specialties)
        ? { specialties: parseSpecialties(body.specialties) }
        : {}),
      ...(defaultRate !== undefined && defaultRate !== null ? { defaultRate } : {}),
      ...(rateType === "PER_SESSION" || rateType === "PER_HOUR" ? { rateType } : {}),
    },
  });
  await writeAudit(deps, { entityType: "coach", entityId: id, action: "coach.update", actor });
  return ok({ coach: maybeStripRates(actor, presentCoach(updated)) });
}

/**
 * Hard delete for a coach nobody depends on yet (for example one created by mistake).
 * Coaches on any session or class-change request, or linked to a staff account, must be
 * deactivated instead so rosters, payroll, and history keep their coach.
 */
export async function deleteAdminCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const coach = await deps.prisma.coach.findUnique({
    where: { id },
    include: {
      _count: {
        select: { sessions: true, requestedClassChanges: true, substituteClassChanges: true },
      },
    },
  });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  const usage =
    coach._count.sessions +
    coach._count.requestedClassChanges +
    coach._count.substituteClassChanges;
  if (usage > 0 || coach.staffMemberId) {
    throw new ApiError(
      409,
      "coach_in_use",
      coach.staffMemberId
        ? "This coach is linked to a staff account. Unlink it or deactivate the coach instead."
        : "This coach is on the schedule. Deactivate them instead so past sessions keep their coach.",
    );
  }
  await deps.prisma.$transaction([
    deps.prisma.classMarketingCoach.deleteMany({ where: { coachId: id } }),
    deps.prisma.coach.delete({ where: { id } }),
  ]);
  await retireAdminObject(deps, "coach-photos", coach.photoKey);
  await writeAudit(deps, {
    entityType: "coach",
    entityId: id,
    action: "coach.delete",
    actor,
    metadata: { name: coach.name },
  });
  return ok({ deleted: true, id });
}

export async function postCoachPhoto(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const coach = await deps.prisma.coach.findUnique({ where: { id } });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType) {
      throwFields(fieldError("contentType", "required", "contentType is required."));
    }
    const path = `coach-photos/${id}/${randomUUID()}.${extensionFor(contentType)}`;
    const minted = await mintSignedUpload(deps, actor, {
      bucket: "coach-photos",
      purpose: "coach_photo",
      entityId: id,
      contentType,
      allowed: new Set(SIGNED_UPLOAD.coachPhotoTypes),
      objectKey: path,
    });
    return ok(minted);
  }
  assertOwnedCoachPhotoKey(id, objectKey);
  await confirmUpload(deps, objectKey);
  const previous = coach.photoKey;
  if (previous && previous !== objectKey) {
    await retireAdminObject(deps, "coach-photos", previous);
  }
  const updated = await deps.prisma.coach.update({
    where: { id },
    data: { photoKey: objectKey },
  });
  await writeAudit(deps, {
    entityType: "coach",
    entityId: id,
    action: "coach.photo.replace",
    actor,
    metadata: { previous, objectKey },
  });
  return ok({ coach: { id: updated.id, photoKey: updated.photoKey } });
}

export async function deleteCoachPhoto(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const coach = await deps.prisma.coach.findUnique({ where: { id } });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  await retireAdminObject(deps, "coach-photos", coach.photoKey);
  await deps.prisma.coach.update({ where: { id }, data: { photoKey: null } });
  await writeAudit(deps, {
    entityType: "coach",
    entityId: id,
    action: "coach.photo.remove",
    actor,
  });
  return ok({ coach: { id, photoKey: null } });
}

export async function getAdminSessions(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAnyPermission(requireAdmin(await resolveActor(deps, req)), [
    "schedule.read.all",
    "schedule.read.own",
  ]);
  const params = searchParams(req);
  const { page, pageSize, skip } = pagination(params);
  const ownOnly = !actorHas(actor, "schedule.read.all");
  const from = params.get("from");
  const to = params.get("to");
  const coachId = params.get("coachId");
  const where = {
    ...(params.get("classId") ? { classId: params.get("classId") as string } : {}),
    ...(params.get("venueId") ? { venueId: params.get("venueId") as string } : {}),
    ...(params.get("status")
      ? { status: params.get("status") as "DRAFT" | "PUBLISHED" | "CANCELLED" }
      : {}),
    ...(from || to
      ? {
          startsAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    // ownOnly pins the coach filter to the actor's own id regardless of the query param.
    ...(ownOnly
      ? actor.coachId
        ? { coaches: { some: { coachId: actor.coachId } } }
        : { id: { in: [] } }
      : coachId
        ? { coaches: { some: { coachId } } }
        : {}),
  };
  const [total, items] = await Promise.all([
    deps.prisma.gymSession.count({ where }),
    deps.prisma.gymSession.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { startsAt: "asc" },
      include: {
        gymClass: true,
        venue: { select: SESSION_VENUE_SELECT },
        coaches: {
          include: {
            coach: canReadRates(actor)
              ? true
              : {
                  select: {
                    id: true,
                    name: true,
                    specialties: true,
                    shortBio: true,
                    photoKey: true,
                    active: true,
                    staffMemberId: true,
                  },
                },
          },
        },
      },
    }),
  ]);
  const scoped = items.filter((item) => !ownOnly || sessionOwnedByActor(actor, item));
  const facts = await sessionsAvailabilityFacts(
    deps,
    scoped.map((item) => item.id),
  );
  const presented = await Promise.all(
    scoped.map((item) => {
      const fact = facts.get(item.id);
      return presentAdminSession(deps, item, fact?.consumed ?? 0, fact?.pastCutoff ?? false);
    }),
  );
  return ok({
    page,
    pageSize,
    total,
    items: maybeStripRates(actor, presented),
  });
}

export async function postAdminSession(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertAssignmentFields(body);
  const classId = requireString(body, "classId", 64);
  const venueId = requireString(body, "venueId", 64);
  const startsAt = requireString(body, "startsAt", 40);
  const endsAt = requireString(body, "endsAt", 40);
  const capacity = intValue(body, "capacity", 1, 200, true) as number;
  const customerPrice = moneyValue(body, "customerPrice", true) as string;
  const coachIds = parseCoachIds(body.coachIds);
  const name = optionalNullableString(body, "name", FIELD_CONSTRAINTS.session.name.max) ?? null;
  const bookable = typeof body.bookable === "boolean" ? body.bookable : true;
  assertSessionWindow(startsAt, endsAt);
  const created = await deps.prisma.$transaction(async (tx) => {
    await assertActiveClass(tx, classId);
    await assertActiveVenue(tx, venueId);
    const coaches = await resolveSessionCoaches(tx, coachIds);
    return tx.gymSession.create({
      data: {
        classId,
        venueId,
        name,
        bookable,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        capacity,
        customerPrice,
        status: asString(body.status) === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        coaches: {
          create: coaches.map((coach) => ({
            coachId: coach.id,
            coachRate: coach.defaultRate,
            coachRateType: coach.rateType,
          })),
        },
      },
      include: {
        gymClass: true,
        coaches: { include: { coach: true } },
        venue: { select: SESSION_VENUE_SELECT },
      },
    });
  });
  await writeAudit(deps, {
    entityType: "session",
    entityId: created.id,
    action: "session.create",
    actor,
    metadata: { coachIds, venueId },
  });
  const presented = await presentAdminSession(deps, created, 0);
  return ok({ session: maybeStripRates(actor, presented) });
}

export async function postDuplicateAdminSessions(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const sourceStart = parseScheduleDate(body, "sourceStart");
  const sourceEnd = parseScheduleDate(body, "sourceEnd");
  const targetStart = parseScheduleDate(body, "targetStart");
  const rangeDays = calendarDayDistance(sourceStart, sourceEnd);
  if (rangeDays < 0 || rangeDays > 62) {
    throwFields(
      fieldError("sourceEnd", "out_of_range", "Copy an inclusive range of at most 63 days."),
    );
  }
  const dayOffset = calendarDayDistance(sourceStart, targetStart);
  const publish = body.publish === true;
  const rangeStart = new Date(`${sourceStart}T00:00:00+08:00`);
  const rangeEnd = new Date(`${addCalendarDays(sourceEnd, 1)}T00:00:00+08:00`);

  const result = await deps.prisma.$transaction(async (tx) => {
    const templates = await tx.gymSession.findMany({
      where: {
        startsAt: { gte: rangeStart, lt: rangeEnd },
        status: { not: "CANCELLED" },
      },
      orderBy: { startsAt: "asc" },
      include: { gymClass: true, venue: true, coaches: true },
    });
    if (templates.some((session) => !session.gymClass.active)) {
      throwFields(
        fieldError(
          "sourceStart",
          "inactive_reference",
          "The source range includes an inactive class.",
        ),
      );
    }
    if (templates.some((session) => !session.venue.active)) {
      throwFields(
        fieldError(
          "sourceStart",
          "inactive_reference",
          "The source range includes a session at an inactive venue.",
        ),
      );
    }
    const createdIds: string[] = [];
    let skippedCount = 0;
    for (const template of templates) {
      const startsAt = new Date(template.startsAt.getTime() + dayOffset * 86_400_000);
      const endsAt = new Date(template.endsAt.getTime() + dayOffset * 86_400_000);
      const duplicate = await tx.gymSession.findFirst({
        where: { classId: template.classId, startsAt },
        select: { id: true },
      });
      if (duplicate) {
        skippedCount += 1;
        continue;
      }
      const assigned = await resolveSessionCoaches(
        tx,
        template.coaches.map((assignment) => assignment.coachId),
      );
      const created = await tx.gymSession.create({
        data: generatedSessionData(template, assigned, startsAt, endsAt, publish),
        select: { id: true },
      });
      createdIds.push(created.id);
    }
    return { createdCount: createdIds.length, skippedCount, sessionIds: createdIds };
  });
  await writeAudit(deps, {
    entityType: "session_batch",
    entityId: `duplicate:${sourceStart}:${targetStart}`,
    action: "session.duplicate_range",
    actor,
    metadata: { ...result, sourceStart, sourceEnd, targetStart, publish },
  });
  return ok(result);
}

export async function postAdminSessionRecurrence(
  deps: ApiDeps,
  req: Request,
  sourceSessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const startsOn = parseScheduleDate(body, "startsOn");
  const endsOn = parseScheduleDate(body, "endsOn");
  const rangeDays = calendarDayDistance(startsOn, endsOn);
  if (rangeDays < 0 || rangeDays > 366) {
    throwFields(
      fieldError("endsOn", "out_of_range", "Create an inclusive series of at most one year."),
    );
  }
  const weekdays = parseWeekdays(body.weekdays);
  const publish = body.publish === true;
  const dates = datesForWeeklyRecurrence({ startsOn, endsOn, weekdays });

  const result = await deps.prisma.$transaction(async (tx) => {
    const source = await tx.gymSession.findUnique({
      where: { id: sourceSessionId },
      include: { gymClass: true, venue: true, coaches: true },
    });
    if (!source) throw new ApiError(404, "session_not_found", "Session not found.");
    if (source.status === "CANCELLED") {
      throwFields(
        fieldError("sourceSessionId", "invalid_format", "Cancelled sessions cannot repeat."),
      );
    }
    if (source.recurrenceRuleId) {
      throwFields(
        fieldError("sourceSessionId", "already_exists", "This session is already recurring."),
      );
    }
    if (!source.gymClass.active) {
      throwFields(
        fieldError("sourceSessionId", "inactive_reference", "The session class is inactive."),
      );
    }
    if (!source.venue.active) {
      throwFields(
        fieldError("sourceSessionId", "inactive_reference", "The session venue is inactive."),
      );
    }
    const assigned = await resolveSessionCoaches(
      tx,
      source.coaches.map((assignment) => assignment.coachId),
    );
    const rule = await tx.sessionRecurrenceRule.create({
      data: {
        sourceSessionId,
        startsOn: new Date(`${startsOn}T00:00:00Z`),
        endsOn: new Date(`${endsOn}T00:00:00Z`),
        weekdays,
        publish,
      },
    });
    await tx.gymSession.update({
      where: { id: sourceSessionId },
      data: { recurrenceRuleId: rule.id },
    });
    const createdIds: string[] = [];
    let skippedCount = 0;
    const sourceManilaYmd = manilaYmd(source.startsAt.toISOString());
    for (const ymd of dates) {
      const dayOffset = calendarDayDistance(sourceManilaYmd, ymd);
      const startsAt = new Date(source.startsAt.getTime() + dayOffset * 86_400_000);
      const endsAt = new Date(source.endsAt.getTime() + dayOffset * 86_400_000);
      const duplicate = await tx.gymSession.findFirst({
        where: { classId: source.classId, startsAt },
        select: { id: true },
      });
      if (duplicate) {
        skippedCount += 1;
        continue;
      }
      const created = await tx.gymSession.create({
        data: {
          ...generatedSessionData(source, assigned, startsAt, endsAt, publish),
          recurrenceRuleId: rule.id,
        },
        select: { id: true },
      });
      createdIds.push(created.id);
    }
    return {
      recurrenceRuleId: rule.id,
      createdCount: createdIds.length,
      skippedCount,
      sessionIds: createdIds,
    };
  });
  await writeAudit(deps, {
    entityType: "session_recurrence_rule",
    entityId: result.recurrenceRuleId,
    action: "session.recurrence.create",
    actor,
    metadata: { ...result, sourceSessionId, startsOn, endsOn, weekdays, publish },
  });
  return ok(result);
}

function generatedSessionData(
  template: {
    classId: string;
    venueId: string;
    capacity: number;
    customerPrice: Prisma.Decimal;
    bookable: boolean;
  },
  coaches: Awaited<ReturnType<typeof resolveSessionCoaches>>,
  startsAt: Date,
  endsAt: Date,
  publish: boolean,
) {
  return {
    classId: template.classId,
    venueId: template.venueId,
    // Each generated occurrence is a new instance; a one-off title does not
    // carry forward, but bookability (e.g. a staff-only series) does.
    bookable: template.bookable,
    startsAt,
    endsAt,
    capacity: template.capacity,
    customerPrice: template.customerPrice,
    status: publish ? ("PUBLISHED" as const) : ("DRAFT" as const),
    coaches: {
      create: coaches.map((coach) => ({
        coachId: coach.id,
        coachRate: coach.defaultRate,
        coachRateType: coach.rateType,
      })),
    },
  };
}

function parseScheduleDate(body: Record<string, unknown>, key: string): string {
  const value = requireString(body, key, 10);
  if (!isManilaYmd(value)) {
    throwFields(fieldError(key, "invalid_format", `${key} must be yyyy-mm-dd.`));
  }
  return value;
}

function parseWeekdays(value: unknown): Weekday[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 7) {
    throwFields(fieldError("weekdays", "required", "Choose one to seven weekdays."));
  }
  if (value.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throwFields(fieldError("weekdays", "invalid_format", "Weekdays must be integers from 0 to 6."));
  }
  const weekdays = value as Weekday[];
  if (new Set(weekdays).size !== weekdays.length) {
    throwFields(fieldError("weekdays", "invalid_format", "Choose each weekday only once."));
  }
  return weekdays;
}

export async function patchAdminSession(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertAssignmentFields(body);
  const coachIds = "coachIds" in body ? parseCoachIds(body.coachIds) : undefined;
  const startsAt = optionalString(body, "startsAt", 40);
  const endsAt = optionalString(body, "endsAt", 40);
  const classId = "classId" in body ? requireString(body, "classId", 64) : undefined;
  const venueId = "venueId" in body ? requireString(body, "venueId", 64) : undefined;
  const capacity = intValue(body, "capacity", 1, 200, false);
  const customerPrice = moneyValue(body, "customerPrice", false);
  const name = optionalNullableString(body, "name", FIELD_CONSTRAINTS.session.name.max);
  const bookable = typeof body.bookable === "boolean" ? body.bookable : undefined;
  const updated = await deps.prisma.$transaction(async (tx) => {
    // Serialize assignment replacement and capacity changes on the same session.
    await tx.$queryRawUnsafe("SELECT id FROM public.sessions WHERE id = $1 FOR UPDATE", id);
    const session = await tx.gymSession.findUnique({ where: { id }, include: { coaches: true } });
    if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
    const expectedStart = optionalString(body, "expectedStartsAt", 40);
    const expectedEnd = optionalString(body, "expectedEndsAt", 40);
    if (
      (expectedStart && Date.parse(expectedStart) !== session.startsAt.getTime()) ||
      (expectedEnd && Date.parse(expectedEnd) !== session.endsAt.getTime())
    ) {
      throw new ApiError(
        409,
        "session_time_changed",
        "This session's time changed. Refresh the schedule and try again.",
      );
    }
    if (startsAt && Date.parse(startsAt) !== session.startsAt.getTime()) {
      const now = deps.now().getTime();
      if (session.status === "CANCELLED" || session.startsAt.getTime() <= now) {
        throw new ApiError(
          409,
          "session_move_locked",
          "Started or cancelled sessions cannot be rescheduled.",
        );
      }
      if (Date.parse(startsAt) <= now) {
        throw new ApiError(409, "session_move_in_past", "Choose a future start time.");
      }
    }
    assertSessionWindow(
      startsAt ?? session.startsAt.toISOString(),
      endsAt ?? session.endsAt.toISOString(),
    );
    if (classId && classId !== session.classId) await assertActiveClass(tx, classId);
    // Keeping an inactive current venue is fine; switching to an inactive one is not.
    if (venueId && venueId !== session.venueId) await assertActiveVenue(tx, venueId);
    if (coachIds) {
      const retained = new Set(session.coaches.map((row) => row.coachId));
      const coaches = await resolveSessionCoaches(tx, coachIds, retained);
      await tx.sessionCoach.deleteMany({ where: { sessionId: id, coachId: { notIn: coachIds } } });
      for (const coach of coaches) {
        if (!retained.has(coach.id)) {
          await tx.sessionCoach.create({
            data: {
              sessionId: id,
              coachId: coach.id,
              coachRate: coach.defaultRate,
              coachRateType: coach.rateType,
            },
          });
        }
      }
    }
    if (typeof capacity === "number") {
      // Prisma binds JS integers as bigint; the capacity RPC takes integer.
      // Without this cast the whole edit rolls back, including the session name.
      await tx.$queryRawUnsafe(
        "SELECT public.update_session_capacity($1::text, $2::integer)",
        id,
        capacity,
      );
    }
    return tx.gymSession.update({
      where: { id },
      data: {
        ...(classId ? { classId } : {}),
        ...(venueId ? { venueId } : {}),
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
        ...(customerPrice != null ? { customerPrice } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(bookable !== undefined ? { bookable } : {}),
        ...(asString(body.status) === "DRAFT" || asString(body.status) === "PUBLISHED"
          ? { status: asString(body.status) as "DRAFT" | "PUBLISHED" }
          : {}),
      },
      include: {
        gymClass: true,
        coaches: { include: { coach: true } },
        venue: { select: SESSION_VENUE_SELECT },
      },
    });
  });
  await writeAudit(deps, { entityType: "session", entityId: id, action: "session.update", actor });
  const consumed = await sessionConsumedCapacity(deps, id);
  const presented = await presentAdminSession(deps, updated, consumed);
  return ok({ session: maybeStripRates(actor, presented) });
}

function assertAssignmentFields(body: Record<string, unknown>): void {
  for (const key of [
    "coachId",
    "coachRate",
    "coachRatePhp",
    "coachRateType",
    "coaches",
    "coachAssignments",
  ]) {
    if (key in body)
      throwFields(
        fieldError(key, "read_only", "Send coachIds; each coach's rate is captured by the server."),
      );
  }
}

function parseCoachIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throwFields(fieldError("coachIds", "required", "Choose at least one coach."));
  }
  if (value.some((id) => typeof id !== "string" || !id.trim() || id.length > 64)) {
    throwFields(
      fieldError("coachIds", "invalid_type", "Each coach ID must be a non-empty string."),
    );
  }
  const ids = (value as string[]).map((id) => id.trim());
  if (new Set(ids).size !== ids.length) {
    throwFields(fieldError("coachIds", "invalid_format", "Choose each coach only once."));
  }
  return ids;
}

async function resolveSessionCoaches(
  tx: Prisma.TransactionClient,
  ids: string[],
  retained = new Set<string>(),
) {
  const coaches = await tx.coach.findMany({ where: { id: { in: ids } } });
  if (coaches.length !== ids.length)
    throwFields(fieldError("coachIds", "invalid_format", "One or more coaches no longer exist."));
  if (coaches.some((coach) => !coach.active && !retained.has(coach.id))) {
    throwFields(
      fieldError("coachIds", "inactive_reference", "Newly assigned coaches must be active."),
    );
  }
  return coaches;
}

async function assertActiveClass(tx: Prisma.TransactionClient, id: string) {
  const gymClass = await tx.gymClass.findUnique({ where: { id } });
  if (!gymClass) throw new ApiError(404, "class_not_found", "Class not found.");
  if (!gymClass.active)
    throwFields(fieldError("classId", "inactive_reference", "Class must be active."));
}

/** New or changed session venues must exist and be active. No time-overlap check by design. */
async function assertActiveVenue(tx: Prisma.TransactionClient, id: string) {
  const venue = await tx.venue.findUnique({ where: { id }, select: { active: true } });
  if (!venue) throw new ApiError(404, "venue_not_found", "Venue not found.");
  if (!venue.active)
    throwFields(fieldError("venueId", "inactive_reference", "Venue must be active."));
}

/** Shared cancellation effect for direct staff actions and approved coach requests. */
export async function cancelSessionInTransaction(
  tx: Prisma.TransactionClient,
  actorStaffId: string,
  id: string,
) {
  const row = await tx.gymSession.update({ where: { id }, data: { status: "CANCELLED" } });
  await cancelLiveSessionEvent(tx, actorStaffId, id);
  return row;
}

export async function postCancelSession(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const session = await deps.prisma.gymSession.findUnique({ where: { id } });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const updated = await deps.prisma.$transaction((tx) =>
    cancelSessionInTransaction(tx, actor.staffId, id),
  );
  const affected = await deps.prisma.booking.findMany({
    where: {
      sessionId: id,
      status: {
        in: [
          "HELD_AWAITING_PAYMENT",
          "PAYMENT_SUBMITTED",
          "CONFIRMED",
          "WAITLISTED",
          "CANCELLATION_REQUESTED",
          "RESCHEDULE_REQUESTED",
        ],
      },
    },
    select: { id: true, status: true, profileId: true },
  });
  await writeAudit(deps, {
    entityType: "session",
    entityId: id,
    action: "session.cancel",
    actor,
    beforeStatus: session.status,
    afterStatus: "CANCELLED",
    metadata: { affectedBookingIds: affected.map((item) => item.id) },
  });
  return ok({
    session: { id: updated.id, status: updated.status },
    newReservationsBlocked: true,
    affectedBookings: affected,
  });
}

function assertSessionWindow(startsAt: string, endsAt: string): void {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime())) {
    throwFields(fieldError("startsAt", "invalid_format", "startsAt must be an ISO datetime."));
  }
  if (Number.isNaN(end.getTime())) {
    throwFields(fieldError("endsAt", "invalid_format", "endsAt must be an ISO datetime."));
  }
  if (end <= start) {
    throwFields(fieldError("endsAt", "ends_before_start", "endsAt must be after startsAt."));
  }
  const maxMs = FIELD_CONSTRAINTS.session.maxDurationHours * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maxMs) {
    throwFields(
      fieldError(
        "endsAt",
        "duration_too_long",
        `Session cannot exceed ${FIELD_CONSTRAINTS.session.maxDurationHours} hours.`,
      ),
    );
  }
}
