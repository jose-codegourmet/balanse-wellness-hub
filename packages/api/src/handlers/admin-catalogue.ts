import type { Prisma } from "@balanse/db";
import {
  addCalendarDays,
  calendarDayDistance,
  classSlug,
  datesForWeeklyRecurrence,
  FIELD_CONSTRAINTS,
  isManilaYmd,
  manilaYmd,
  SIGNED_UPLOAD,
  type Weekday,
} from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { presentCoach } from "../presenters";
import {
  actorHas,
  canManageRates,
  canReadRates,
  maybeStripRates,
  sessionOwnedByActor,
} from "../sensitive";
import {
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
  optionalString,
  requireString,
  throwFields,
} from "../validation";

export async function getAdminClasses(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.gymClass.findMany({ orderBy: { name: "asc" } });
  return ok({ items });
}

export async function postAdminClass(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", FIELD_CONSTRAINTS.class.name.max);
  const shortDescription = requireString(
    body,
    "shortDescription",
    FIELD_CONSTRAINTS.class.shortDescription.max,
  );
  const defaultDurationMinutes = intValue(body, "defaultDurationMinutes", 1, 240, false);
  const defaultCustomerPrice = moneyValue(body, "defaultCustomerPrice", false);
  const created = await deps.prisma.gymClass.create({
    data: {
      name,
      slug: classSlug(name),
      shortDescription,
      defaultDurationMinutes: defaultDurationMinutes === undefined ? null : defaultDurationMinutes,
      defaultCustomerPrice: defaultCustomerPrice ?? null,
      active: body.active !== false,
    },
  });
  await writeAudit(deps, {
    entityType: "class",
    entityId: created.id,
    action: "class.create",
    actor,
  });
  return ok({ class: created });
}

export async function patchAdminClass(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = optionalString(body, "name", FIELD_CONSTRAINTS.class.name.max);
  const shortDescription = optionalString(
    body,
    "shortDescription",
    FIELD_CONSTRAINTS.class.shortDescription.max,
  );
  const defaultDurationMinutes = intValue(body, "defaultDurationMinutes", 1, 240, false);
  const updated = await deps.prisma.gymClass.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(shortDescription !== undefined ? { shortDescription } : {}),
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(defaultDurationMinutes !== undefined ? { defaultDurationMinutes } : {}),
    },
  });
  await writeAudit(deps, { entityType: "class", entityId: id, action: "class.update", actor });
  return ok({ class: updated });
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

export async function postAdminCoach(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", FIELD_CONSTRAINTS.coach.name.max);
  const shortBio = requireString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max);
  const mayManageRates = canManageRates(actor);
  const defaultRate = mayManageRates ? moneyValue(body, "defaultRate", true) : "0";
  const rateType = mayManageRates ? asString(body.rateType) : "PER_SESSION";
  if (rateType !== "PER_SESSION" && rateType !== "PER_HOUR") {
    throwFields(
      fieldError("rateType", "invalid_enum", "rateType must be PER_SESSION or PER_HOUR."),
    );
  }
  if (!mayManageRates && (body.defaultRate != null || body.rateType != null)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: "coach_rates.manage" },
    });
  }
  const created = await deps.prisma.coach.create({
    data: {
      name,
      specialties: parseSpecialties(body.specialties),
      shortBio,
      defaultRate: defaultRate as string,
      rateType,
      active: body.active !== false,
    },
  });
  await writeAudit(deps, {
    entityType: "coach",
    entityId: created.id,
    action: "coach.create",
    actor,
  });
  return ok({ coach: maybeStripRates(actor, presentCoach(created)) });
}

export async function patchAdminCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = optionalString(body, "name", FIELD_CONSTRAINTS.coach.name.max);
  const shortBio = optionalString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max);
  if (!canManageRates(actor) && (body.defaultRate != null || body.rateType != null)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: "coach_rates.manage" },
    });
  }
  const defaultRate = canManageRates(actor) ? moneyValue(body, "defaultRate", false) : undefined;
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
    const path = `coach-photos/${id}/${crypto.randomUUID()}.${extensionFor(contentType)}`;
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
  const actor = requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const { page, pageSize, skip } = pagination(params);
  const ownOnly = !actorHas(actor, "schedule.read.all");
  const where = {
    ...(params.get("classId") ? { classId: params.get("classId") as string } : {}),
    ...(params.get("status")
      ? { status: params.get("status") as "DRAFT" | "PUBLISHED" | "CANCELLED" }
      : {}),
    ...(ownOnly && actor.coachId ? { coaches: { some: { coachId: actor.coachId } } } : {}),
    ...(ownOnly && !actor.coachId ? { id: { in: [] } } : {}),
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
  const mapped = items
    .filter((item) => !ownOnly || sessionOwnedByActor(actor, item))
    .map((item) => ({
      ...item,
      coaches: item.coaches.map((assignment) => ({
        ...assignment,
        coach: presentCoach(assignment.coach),
      })),
    }));
  return ok({
    page,
    pageSize,
    total,
    items: maybeStripRates(actor, mapped),
  });
}

export async function postAdminSession(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertAssignmentFields(body);
  const classId = requireString(body, "classId", 64);
  const startsAt = requireString(body, "startsAt", 40);
  const endsAt = requireString(body, "endsAt", 40);
  const capacity = intValue(body, "capacity", 1, 200, true) as number;
  const customerPrice = moneyValue(body, "customerPrice", true) as string;
  const coachIds = parseCoachIds(body.coachIds);
  assertSessionWindow(startsAt, endsAt);
  const created = await deps.prisma.$transaction(async (tx) => {
    await assertActiveClass(tx, classId);
    const coaches = await resolveSessionCoaches(tx, coachIds);
    return tx.gymSession.create({
      data: {
        classId,
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
      include: { coaches: { include: { coach: true } } },
    });
  });
  await writeAudit(deps, {
    entityType: "session",
    entityId: created.id,
    action: "session.create",
    actor,
    metadata: { coachIds },
  });
  return ok({ session: created });
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
      include: { gymClass: true, coaches: true },
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
      include: { gymClass: true, coaches: true },
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
    capacity: number;
    customerPrice: Prisma.Decimal;
  },
  coaches: Awaited<ReturnType<typeof resolveSessionCoaches>>,
  startsAt: Date,
  endsAt: Date,
  publish: boolean,
) {
  return {
    classId: template.classId,
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
  const capacity = intValue(body, "capacity", 1, 200, false);
  const customerPrice = moneyValue(body, "customerPrice", false);
  const updated = await deps.prisma.$transaction(async (tx) => {
    // Serialize assignment replacement and capacity changes on the same session.
    await tx.$queryRawUnsafe("SELECT id FROM public.sessions WHERE id = $1 FOR UPDATE", id);
    const session = await tx.gymSession.findUnique({ where: { id }, include: { coaches: true } });
    if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
    assertSessionWindow(
      startsAt ?? session.startsAt.toISOString(),
      endsAt ?? session.endsAt.toISOString(),
    );
    if (classId && classId !== session.classId) await assertActiveClass(tx, classId);
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
      await tx.$queryRawUnsafe("SELECT public.update_session_capacity($1, $2)", id, capacity);
    }
    return tx.gymSession.update({
      where: { id },
      data: {
        ...(classId ? { classId } : {}),
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
        ...(customerPrice != null ? { customerPrice } : {}),
        ...(asString(body.status) === "DRAFT" || asString(body.status) === "PUBLISHED"
          ? { status: asString(body.status) as "DRAFT" | "PUBLISHED" }
          : {}),
      },
      include: { coaches: { include: { coach: true } } },
    });
  });
  await writeAudit(deps, { entityType: "session", entityId: id, action: "session.update", actor });
  return ok({ session: updated });
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

export async function postCancelSession(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const session = await deps.prisma.gymSession.findUnique({ where: { id } });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const updated = await deps.prisma.gymSession.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
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

function parseSpecialties(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  if (value.length > FIELD_CONSTRAINTS.coach.specialties.maxItems) {
    throwFields(
      fieldError(
        "specialties",
        "too_long",
        `At most ${FIELD_CONSTRAINTS.coach.specialties.maxItems} specialties.`,
      ),
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throwFields(
        fieldError(`specialties.${index}`, "invalid_type", "Each specialty must be text."),
      );
    }
    const trimmed = item.trim();
    if (trimmed.length > FIELD_CONSTRAINTS.coach.specialties.itemMax) {
      throwFields(
        fieldError(
          `specialties.${index}`,
          "too_long",
          `Specialty must be at most ${FIELD_CONSTRAINTS.coach.specialties.itemMax} characters.`,
        ),
      );
    }
    return trimmed;
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
