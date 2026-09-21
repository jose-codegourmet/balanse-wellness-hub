import { FIELD_CONSTRAINTS, SIGNED_UPLOAD } from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { money, presentCoach } from "../presenters";
import { updateSessionCapacity } from "../sql";
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
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.coach.findMany({ orderBy: { name: "asc" } });
  return ok({ items: items.map(presentCoach) });
}

export async function postAdminCoach(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", FIELD_CONSTRAINTS.coach.name.max);
  const shortBio = requireString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max);
  const defaultRate = moneyValue(body, "defaultRate", true);
  const rateType = asString(body.rateType);
  if (rateType !== "PER_SESSION" && rateType !== "PER_HOUR") {
    throwFields(
      fieldError("rateType", "invalid_enum", "rateType must be PER_SESSION or PER_HOUR."),
    );
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
  return ok({ coach: presentCoach(created) });
}

export async function patchAdminCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = optionalString(body, "name", FIELD_CONSTRAINTS.coach.name.max);
  const shortBio = optionalString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max);
  const defaultRate = moneyValue(body, "defaultRate", false);
  const rateType = asString(body.rateType);
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
  return ok({ coach: presentCoach(updated) });
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
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const { page, pageSize, skip } = pagination(params);
  const where = {
    ...(params.get("classId") ? { classId: params.get("classId") as string } : {}),
    ...(params.get("status")
      ? { status: params.get("status") as "DRAFT" | "PUBLISHED" | "CANCELLED" }
      : {}),
  };
  const [total, items] = await Promise.all([
    deps.prisma.gymSession.count({ where }),
    deps.prisma.gymSession.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { startsAt: "asc" },
      include: { gymClass: true, coach: true },
    }),
  ]);
  return ok({
    page,
    pageSize,
    total,
    items: items.map((item) => ({
      ...item,
      coach: item.coach ? presentCoach(item.coach) : null,
    })),
  });
}

export async function postAdminSession(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const classId = requireString(body, "classId", 64);
  const startsAt = requireString(body, "startsAt", 40);
  const endsAt = requireString(body, "endsAt", 40);
  const capacity = intValue(body, "capacity", 1, 200, true) as number;
  const customerPrice = moneyValue(body, "customerPrice", true) as string;
  assertSessionWindow(startsAt, endsAt);
  const coachId = requireString(body, "coachId", 64);
  const coach = await deps.prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  if (!coach.active) {
    throwFields(fieldError("coachId", "inactive_reference", "Coach must be active."));
  }
  const gymClass = await deps.prisma.gymClass.findUnique({ where: { id: classId } });
  if (!gymClass) throw new ApiError(404, "class_not_found", "Class not found.");
  if (!gymClass.active) {
    throwFields(fieldError("classId", "inactive_reference", "Class must be active."));
  }
  const created = await deps.prisma.gymSession.create({
    data: {
      classId,
      coachId: coach.id,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      capacity,
      status: asString(body.status) === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      customerPrice,
      coachRate: coach.defaultRate,
      coachRateType: coach.rateType,
    },
  });
  await writeAudit(deps, {
    entityType: "session",
    entityId: created.id,
    action: "session.create",
    actor,
    metadata: { coachRate: money(created.coachRate), coachRateType: created.coachRateType },
  });
  return ok({ session: created });
}

export async function patchAdminSession(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const session = await deps.prisma.gymSession.findUnique({ where: { id } });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const body = await readJson(req);
  if ("coachRate" in body || "coachRatePhp" in body || "coachRateType" in body) {
    throw new ApiError(422, "validation_failed", "Session rate snapshots are immutable.", {
      fieldErrors: [
        fieldError(
          "coachRate",
          "read_only",
          "Updating a coach default rate never rewrites session snapshots.",
        ),
      ],
    });
  }
  const startsAt = optionalString(body, "startsAt", 40);
  const endsAt = optionalString(body, "endsAt", 40);
  if (startsAt || endsAt) {
    assertSessionWindow(
      startsAt ?? session.startsAt.toISOString(),
      endsAt ?? session.endsAt.toISOString(),
    );
  }
  const capacity = intValue(body, "capacity", 1, 200, false);
  if (typeof capacity === "number") {
    await updateSessionCapacity(deps, id, capacity);
  }
  const customerPrice = moneyValue(body, "customerPrice", false);
  const updated = await deps.prisma.gymSession.update({
    where: { id },
    data: {
      ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
      ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      ...(customerPrice !== undefined && customerPrice !== null ? { customerPrice } : {}),
      ...(asString(body.status) === "DRAFT" || asString(body.status) === "PUBLISHED"
        ? { status: asString(body.status) as "DRAFT" | "PUBLISHED" }
        : {}),
      ...(asString(body.coachId) !== undefined ? { coachId: asString(body.coachId) || null } : {}),
    },
  });
  await writeAudit(deps, { entityType: "session", entityId: id, action: "session.update", actor });
  return ok({ session: updated });
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
