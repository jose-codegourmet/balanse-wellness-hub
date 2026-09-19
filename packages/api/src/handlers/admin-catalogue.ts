import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { COACH_PHOTO_MIME, money } from "../presenters";
import { sessionConsumedCapacity } from "../sql";

export async function getAdminClasses(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.gymClass.findMany({ orderBy: { name: "asc" } });
  return ok({ items });
}

export async function postAdminClass(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = asString(body.name)?.trim();
  if (!name) {
    throw new ApiError(400, "validation_error", "name is required.", {
      fields: { name: "Required." },
    });
  }
  const created = await deps.prisma.gymClass.create({
    data: {
      name,
      shortDescription: asString(body.shortDescription) ?? "",
      defaultDurationMinutes:
        typeof body.defaultDurationMinutes === "number" ? body.defaultDurationMinutes : null,
      defaultCustomerPrice: asString(body.defaultCustomerPrice) ?? null,
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
  const updated = await deps.prisma.gymClass.update({
    where: { id },
    data: {
      ...(asString(body.name) ? { name: asString(body.name) } : {}),
      ...(asString(body.shortDescription) !== undefined
        ? { shortDescription: asString(body.shortDescription) }
        : {}),
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(typeof body.defaultDurationMinutes === "number" || body.defaultDurationMinutes === null
        ? { defaultDurationMinutes: body.defaultDurationMinutes as number | null }
        : {}),
    },
  });
  await writeAudit(deps, { entityType: "class", entityId: id, action: "class.update", actor });
  return ok({ class: updated });
}

export async function getAdminCoaches(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.coach.findMany({ orderBy: { name: "asc" } });
  return ok({ items });
}

export async function postAdminCoach(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = asString(body.name)?.trim();
  const defaultRate =
    asString(body.defaultRate) ??
    (typeof body.defaultRate === "number" ? String(body.defaultRate) : null);
  const rateType = asString(body.rateType);
  if (!name || !defaultRate || (rateType !== "PER_SESSION" && rateType !== "PER_HOUR")) {
    throw new ApiError(400, "validation_error", "name, defaultRate, and rateType are required.");
  }
  const created = await deps.prisma.coach.create({
    data: {
      name,
      specialties: Array.isArray(body.specialties)
        ? body.specialties.filter((item): item is string => typeof item === "string")
        : [],
      shortBio: asString(body.shortBio) ?? "",
      defaultRate,
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
  return ok({ coach: created });
}

export async function patchAdminCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const updated = await deps.prisma.coach.update({
    where: { id },
    data: {
      ...(asString(body.name) ? { name: asString(body.name) } : {}),
      ...(asString(body.shortBio) !== undefined ? { shortBio: asString(body.shortBio) } : {}),
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(Array.isArray(body.specialties)
        ? {
            specialties: body.specialties.filter(
              (item): item is string => typeof item === "string",
            ),
          }
        : {}),
      ...(body.defaultRate !== undefined ? { defaultRate: String(body.defaultRate) } : {}),
      ...(asString(body.rateType) === "PER_SESSION" || asString(body.rateType) === "PER_HOUR"
        ? { rateType: asString(body.rateType) as "PER_SESSION" | "PER_HOUR" }
        : {}),
    },
  });
  await writeAudit(deps, { entityType: "coach", entityId: id, action: "coach.update", actor });
  return ok({ coach: updated });
}

export async function postCoachPhoto(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const coach = await deps.prisma.coach.findUnique({ where: { id } });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType || !COACH_PHOTO_MIME.has(contentType)) {
      throw new ApiError(400, "invalid_mime", "Unsupported coach photo type.");
    }
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : contentType === "image/heic"
            ? "heic"
            : "jpg";
    const path = `coach-photos/${id}/${crypto.randomUUID()}.${ext}`;
    const upload = await deps.storage.createSignedUpload("coach-photos", path, { contentType });
    return ok({ upload });
  }
  const previous = coach.photoKey;
  if (previous && previous !== objectKey) {
    await deps.storage.remove("coach-photos", [previous]);
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
  if (coach.photoKey) {
    await deps.storage.remove("coach-photos", [coach.photoKey]);
  }
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
  return ok({ page, pageSize, total, items });
}

export async function postAdminSession(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const classId = asString(body.classId);
  const startsAt = asString(body.startsAt);
  const endsAt = asString(body.endsAt);
  const capacity = typeof body.capacity === "number" ? body.capacity : Number(body.capacity);
  const customerPrice = body.customerPrice;
  if (!classId || !startsAt || !endsAt || !capacity || customerPrice == null) {
    throw new ApiError(
      400,
      "validation_error",
      "classId, startsAt, endsAt, capacity, and customerPrice are required.",
    );
  }
  const coachId = asString(body.coachId);
  const coach = coachId ? await deps.prisma.coach.findUnique({ where: { id: coachId } }) : null;
  if (coachId && !coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  const created = await deps.prisma.gymSession.create({
    data: {
      classId,
      coachId: coach?.id ?? null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      capacity,
      status: asString(body.status) === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      customerPrice: String(customerPrice),
      coachRate: coach ? coach.defaultRate : "0",
      coachRateType: coach ? coach.rateType : "PER_SESSION",
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
  if (typeof body.capacity === "number") {
    const consumed = await sessionConsumedCapacity(deps, id);
    if (body.capacity < consumed) {
      throw new ApiError(
        400,
        "capacity_exceeded",
        "Capacity cannot be reduced below current consumption.",
        {
          details: { consumed, requested: body.capacity },
        },
      );
    }
  }
  const updated = await deps.prisma.gymSession.update({
    where: { id },
    data: {
      ...(asString(body.startsAt) ? { startsAt: new Date(asString(body.startsAt) as string) } : {}),
      ...(asString(body.endsAt) ? { endsAt: new Date(asString(body.endsAt) as string) } : {}),
      ...(typeof body.capacity === "number" ? { capacity: body.capacity } : {}),
      ...(body.customerPrice !== undefined ? { customerPrice: String(body.customerPrice) } : {}),
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
