import { bookingListTab } from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { bookingStatusPayload, presentStaff } from "../presenters";
import { CUSTOMER_SENSITIVE_READ_POLICY } from "../settings";
import { fieldError, requireString, throwFields } from "../validation";

const staffCoachInclude = { coach: { select: { id: true } } } as const;

export async function getStaff(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.staffMember.findMany({
    where: { isSystem: false },
    orderBy: { name: "asc" },
    include: staffCoachInclude,
  });
  return ok({ items: items.map(presentStaff) });
}

export async function postStaff(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const email = asString(body.email)?.trim().toLowerCase();
  const name = asString(body.name)?.trim();
  if (!email || !name) {
    throw new ApiError(400, "validation_error", "name and email are required.", {
      fields: {
        ...(name ? {} : { name: "Required." }),
        ...(email ? {} : { email: "Required." }),
      },
    });
  }
  let profile = await deps.prisma.profile.findFirst({ where: { email } });
  if (!profile) {
    const invited = await deps.storage.inviteUser?.({ email, name });
    if (!invited) {
      throw new ApiError(
        400,
        "profile_required",
        "No auth profile exists for this email. Provision the user in Supabase Auth first, or configure SUPABASE_SERVICE_ROLE_KEY for invites.",
      );
    }
    profile = await deps.prisma.profile.upsert({
      where: { id: invited.userId },
      create: { id: invited.userId, fullName: name, email, contactNumber: "" },
      update: { fullName: name, email },
    });
  }
  const staff = await deps.prisma.staffMember.upsert({
    where: { userId: profile.id },
    create: { userId: profile.id, name, email, role: "ADMIN", status: "ACTIVE" },
    update: { name, email, status: "ACTIVE" },
    include: staffCoachInclude,
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: staff.id,
    action: "staff.provision",
    actor,
  });
  return ok({ staff: presentStaff(staff) });
}

export async function patchStaff(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const staff = await deps.prisma.staffMember.update({
    where: { id },
    data: {
      ...(asString(body.name) ? { name: asString(body.name) } : {}),
      ...(asString(body.email) ? { email: asString(body.email) } : {}),
    },
    include: staffCoachInclude,
  });
  await writeAudit(deps, { entityType: "staff", entityId: id, action: "staff.update", actor });
  return ok({ staff: presentStaff(staff) });
}

export async function disableStaff(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await deps.prisma.staffMember.findUnique({
    where: { id },
    include: staffCoachInclude,
  });
  if (!existing || existing.isSystem) {
    throw new ApiError(404, "staff_not_found", "Staff member not found.");
  }
  const staff = await deps.prisma.$transaction(async (tx) => {
    const updated = await tx.staffMember.update({
      where: { id },
      data: { status: "DISABLED" },
      include: staffCoachInclude,
    });
    if (existing.coach) {
      await tx.coach.update({
        where: { id: existing.coach.id },
        data: { active: false },
      });
    }
    return updated;
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.disable",
    actor,
    afterStatus: "DISABLED",
    metadata: {
      coachId: existing.coach?.id ?? null,
      coachDeactivated: Boolean(existing.coach),
      sessionsUntouched: true,
    },
  });
  return ok({
    staff: presentStaff(staff),
    effectiveImmediately: true,
    coachDeactivated: Boolean(existing.coach),
  });
}

export async function linkStaffCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const coachId = requireString(body, "coachId", 64);
  const staff = await deps.prisma.staffMember.findUnique({
    where: { id },
    include: staffCoachInclude,
  });
  if (!staff || staff.isSystem) {
    throw new ApiError(404, "staff_not_found", "Staff member not found.");
  }
  if (staff.status === "DISABLED") {
    throwFields(
      fieldError("staffId", "inactive_reference", "Disabled staff cannot be linked to a coach."),
    );
  }
  const coach = await deps.prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
  if (staff.coach && staff.coach.id !== coachId) {
    throwFields(
      fieldError("coachId", "already_linked", "This staff member is already linked to a coach."),
    );
  }
  if (coach.staffMemberId && coach.staffMemberId !== staff.id) {
    throwFields(
      fieldError("coachId", "already_linked", "This coach is already linked to a staff member."),
    );
  }
  const updatedCoach = await deps.prisma.coach.update({
    where: { id: coachId },
    data: { staffMemberId: staff.id },
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: staff.id,
    action: "staff.coach.link",
    actor,
    metadata: { coachId },
  });
  return ok({
    staff: presentStaff({ ...staff, coach: { id: updatedCoach.id } }),
    coach: {
      id: updatedCoach.id,
      staffId: updatedCoach.staffMemberId,
    },
  });
}

export async function unlinkStaffCoach(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const staff = await deps.prisma.staffMember.findUnique({
    where: { id },
    include: staffCoachInclude,
  });
  if (!staff || staff.isSystem) {
    throw new ApiError(404, "staff_not_found", "Staff member not found.");
  }
  if (staff.coach) {
    await deps.prisma.coach.update({
      where: { id: staff.coach.id },
      data: { staffMemberId: null },
    });
  }
  await writeAudit(deps, {
    entityType: "staff",
    entityId: staff.id,
    action: "staff.coach.unlink",
    actor,
    metadata: { coachId: staff.coach?.id ?? null, coachPreserved: true },
  });
  return ok({
    staff: presentStaff({ ...staff, coach: null }),
  });
}

export async function getCustomers(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const q = params.get("q") ?? "";
  const { page, pageSize, skip } = pagination(params);
  const where = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { contactNumber: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [total, rows] = await Promise.all([
    deps.prisma.profile.count({ where }),
    deps.prisma.profile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fullName: "asc" },
      include: {
        bookings: { include: { session: true }, orderBy: { reservedAt: "desc" } },
      },
    }),
  ]);
  return ok({
    page,
    pageSize,
    total,
    items: rows.map((row) => {
      const upcoming = row.bookings.filter((item) => bookingListTab(item.status) === "upcoming")[0];
      const lastVisit = row.bookings.find(
        (item) => item.status === "CHECKED_IN" || item.status === "NO_SHOW",
      );
      return {
        id: row.id,
        name: row.fullName,
        contact: row.contactNumber || row.email,
        upcoming: upcoming?.session.startsAt.toISOString() ?? null,
        lastVisit: lastVisit?.session.startsAt.toISOString() ?? null,
      };
    }),
  });
}

export async function getCustomer(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const profile = await deps.prisma.profile.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          session: { include: { gymClass: true } },
          payments: true,
          refunds: true,
        },
        orderBy: { reservedAt: "desc" },
      },
      cancellationRequests: { orderBy: { requestedAt: "desc" } },
      rescheduleRequests: { orderBy: { requestedAt: "desc" } },
      policyAcceptances: {
        include: { policyVersion: { include: { document: true } } },
        orderBy: { acceptedAt: "desc" },
      },
    },
  });
  if (!profile) throw new ApiError(404, "customer_not_found", "Customer not found.");
  await writeAudit(deps, {
    entityType: "profile",
    entityId: id,
    action: "customer.read",
    actor,
    metadata: { policy: CUSTOMER_SENSITIVE_READ_POLICY },
  });
  const bookings = profile.bookings.map((row) => ({
    id: row.id,
    ...bookingStatusPayload(row.status, row.refunds[0]?.status),
    startsAt: row.session.startsAt.toISOString(),
    className: row.session.gymClass.name,
  }));
  return ok({
    policy: CUSTOMER_SENSITIVE_READ_POLICY,
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      contactNumber: profile.contactNumber,
    },
    upcomingPendingHistory: {
      upcoming: bookings.filter((item) => bookingListTab(item.status) === "upcoming"),
      pending: bookings.filter((item) => bookingListTab(item.status) === "pending"),
      history: bookings.filter((item) => bookingListTab(item.status) === "history"),
    },
    cancellationRescheduleHistory: {
      cancellations: profile.cancellationRequests,
      reschedules: profile.rescheduleRequests,
    },
    attendanceNoShowHistory: profile.bookings
      .filter((item) => item.status === "CHECKED_IN" || item.status === "NO_SHOW")
      .map((item) => ({
        bookingId: item.id,
        status: item.status,
        at: item.checkedInAt ?? item.noShowMarkedAt,
      })),
    paymentRefundHistory: {
      payments: profile.bookings.flatMap((item) => item.payments),
      refunds: profile.bookings.flatMap((item) => item.refunds),
    },
    acceptedPolicyVersions: profile.policyAcceptances.map((row) => ({
      documentName: row.policyVersion.document.title,
      version: row.policyVersion.version,
      acceptedAt: row.acceptedAt.toISOString(),
    })),
  });
}
