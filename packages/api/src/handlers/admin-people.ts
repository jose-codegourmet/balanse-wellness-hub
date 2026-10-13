import type { BookingStatus, Prisma } from "@balanse/db";
import {
  bookingListTab,
  EMAIL_FORMAT_RE,
  isCoachAuthorizationRole,
  resolveRolePermissions,
} from "@balanse/domain";
import {
  assertCanGrantPermissions,
  assertLastSuperAdminAction,
  assertRoleAssignable,
  requireAdmin,
  requirePermission,
  resolveActor,
  writeAudit,
  writeRejectedLastSuperAdminAudit,
} from "../auth";
import {
  entitlementWithLedger,
  presentAcquisition,
  presentEntitlement,
} from "../bundle-presenters";
import type { AdminApiActor, ApiDeps } from "../deps";
import { ApiError, isLastSuperAdminProtectedError, mapUnknownError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { bookingStatusPayload, presentStaff } from "../presenters";
import { splitLegacyFullName } from "../profile-names";
import { actorHas } from "../sensitive";
import { CUSTOMER_SENSITIVE_READ_POLICY } from "../settings";
import { extensionFor } from "../uploads";
import { fieldError, requireString, throwFields } from "../validation";

const staffCoachInclude = {
  coach: { select: { id: true } },
  roleDefinition: { select: { id: true, key: true, name: true, status: true, allAccess: true } },
} as const;

async function runLastSuperAdminMutation<T>(
  deps: ApiDeps,
  actor: Parameters<typeof writeRejectedLastSuperAdminAudit>[1],
  input: {
    staffId: string;
    attemptedAction: "disable" | "demote" | "delete" | "strip_all_access";
    roleId?: string | null;
    roleKey?: string | null;
  },
  work: () => Promise<T>,
): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (isLastSuperAdminProtectedError(error)) {
      await writeRejectedLastSuperAdminAudit(deps, actor, input);
    }
    throw mapUnknownError(error);
  }
}

export async function getStaff(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.staffMember.findMany({
    where: { isSystem: false },
    orderBy: { name: "asc" },
    include: { ...staffCoachInclude, profile: { select: { avatarKey: true } } },
  });
  return ok(
    {
      items: await Promise.all(
        items.map(async ({ profile, ...staff }) => ({
          ...presentStaff(staff),
          avatarUrl: profile.avatarKey
            ? await deps.storage
                .createSignedUrl("avatars", profile.avatarKey, 600)
                .catch(() => null)
            : null,
        })),
      ),
    },
    { "Cache-Control": "no-store" },
  );
}

export async function postStaff(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "staff.manage");
  const body = await readJson(req);
  const roleId = asString(body.roleId)?.trim();
  if (!roleId) {
    throw new ApiError(400, "validation_error", "roleId is required.", {
      fields: { roleId: "Required." },
    });
  }
  const role = await deps.prisma.staffRoleDefinition.findUnique({
    where: { id: roleId },
    include: { permissions: { include: { permission: { select: { key: true } } } } },
  });
  if (!role) throw new ApiError(404, "role_not_found", "Role not found.");
  assertCanGrantPermissions(
    actor,
    resolveRolePermissions({
      allAccess: role.allAccess,
      permissionKeys: role.permissions.map((row) => row.permission.key as never),
    }),
  );
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
  if (!EMAIL_FORMAT_RE.test(email)) {
    throw new ApiError(400, "validation_error", "Enter a valid email.", {
      fields: { email: "Enter a valid email." },
    });
  }
  const requestedCoachId = asString(body.coachId)?.trim() || null;
  assertRoleAssignable({
    roleKey: role.key,
    roleActive: role.status === "ACTIVE",
    roleArchived: role.status === "ARCHIVED",
    coachId: requestedCoachId,
  });
  if (requestedCoachId) {
    const coach = await deps.prisma.coach.findUnique({ where: { id: requestedCoachId } });
    if (!coach || coach.staffMemberId) {
      throwFields(
        fieldError("coachId", "invalid_format", "Choose an existing, unlinked coach profile."),
      );
    }
  }
  let inviteUrl: string | null = null;
  let profile = await deps.prisma.profile.findFirst({ where: { email } });
  if (!profile) {
    const invited = await deps.storage.generateStaffInvite?.({ email, name });
    if (!invited) {
      throw new ApiError(
        400,
        "profile_required",
        "Configure SUPABASE_SERVICE_ROLE_KEY on the server to create staff invite links.",
      );
    }
    inviteUrl = invited.inviteUrl;
    const names = splitLegacyFullName(name);
    profile = await deps.prisma.profile.upsert({
      where: { id: invited.userId },
      create: { id: invited.userId, ...names, email, contactNumber: "" },
      update: { ...names, email },
    });
  }
  const existingStaff = await deps.prisma.staffMember.findFirst({
    where: { userId: profile.id },
    include: staffCoachInclude,
  });
  if (existingStaff) {
    throw new ApiError(
      409,
      "staff_already_exists",
      "This person is already staff. Open their existing staff record instead.",
    );
  }
  if (!inviteUrl) {
    const invited = await deps.storage.generateStaffInvite?.({ email, name, userId: profile.id });
    inviteUrl = invited?.inviteUrl ?? null;
  }
  const staff = await deps.prisma.$transaction(async (tx) => {
    const upserted = await tx.staffMember.create({
      data: {
        userId: profile.id,
        name,
        email,
        role: "ADMIN",
        roleId: role.id,
        status: "ACTIVE",
      },
      include: staffCoachInclude,
    });
    if (requestedCoachId && !upserted.coach) {
      const coach = await tx.coach.findUnique({ where: { id: requestedCoachId } });
      if (!coach) throw new ApiError(404, "coach_not_found", "Coach not found.");
      if (coach.staffMemberId && coach.staffMemberId !== upserted.id) {
        throwFields(
          fieldError(
            "coachId",
            "already_linked",
            "This coach is already linked to a staff member.",
          ),
        );
      }
      await tx.coach.update({
        where: { id: requestedCoachId },
        data: { staffMemberId: upserted.id },
      });
      return tx.staffMember.findUniqueOrThrow({
        where: { id: upserted.id },
        include: staffCoachInclude,
      });
    }
    return upserted;
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: staff.id,
    action: "staff.provision",
    actor,
    metadata: {
      before: null,
      after: { roleId: role.id, roleKey: role.key, coachId: staff.coach?.id ?? null },
    },
  });
  return ok({ staff: presentStaff(staff), inviteUrl }, { "Cache-Control": "no-store" });
}

async function staffLinkTarget(deps: ApiDeps, req: Request, id: string) {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "staff.manage");
  const staff = await deps.prisma.staffMember.findUnique({
    where: { id },
    include: { roleDefinition: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!staff || staff.isSystem)
    throw new ApiError(404, "staff_not_found", "Staff member not found.");
  if (staff.status !== "ACTIVE" || staff.roleDefinition?.status !== "ACTIVE") {
    throw new ApiError(
      409,
      "staff_inactive",
      "Enable staff access and an active role before creating an invite or password reset link.",
    );
  }
  assertCanGrantPermissions(
    actor,
    resolveRolePermissions({
      allAccess: staff.roleDefinition.allAccess,
      permissionKeys: staff.roleDefinition.permissions.map((row) => row.permission.key as never),
    }),
  );
  return { actor, staff };
}

const STAFF_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STAFF_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Same private profile avatar as the person's customer identity, never a coach photo. */
export async function postStaffPhoto(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const { actor, staff } = await staffLinkTarget(deps, req, id);
  return saveStaffPhoto(deps, req, actor, staff);
}

/** Self-service never accepts a target id from the caller. */
export async function postMyStaffPhoto(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  return saveStaffPhoto(deps, req, actor, { id: actor.staffId, userId: actor.userId });
}

async function saveStaffPhoto(
  deps: ApiDeps,
  req: Request,
  actor: AdminApiActor,
  staff: { id: string; userId: string },
): Promise<Response> {
  const id = staff.id;
  const body = await readJson(req);
  const objectKey = asString(body.objectKey)?.trim();
  if (!deps.storage.getObjectInfo)
    throw new ApiError(503, "storage_not_configured", "Photo uploads are not configured.");
  if (!objectKey) {
    const contentType = asString(body.contentType) ?? "";
    if (!STAFF_PHOTO_TYPES.has(contentType))
      throw new ApiError(400, "invalid_photo_type", "Choose a JPG, PNG, or WEBP image.");
    const key = `avatars/${staff.userId}/${crypto.randomUUID()}.${extensionFor(contentType)}`;
    const upload = await deps.storage.createSignedUpload("avatars", key, {
      contentType,
      upsert: false,
    });
    await deps.prisma.pendingUpload.create({
      data: {
        bucket: "avatars",
        objectKey: key,
        purpose: "staff_avatar",
        entityId: staff.userId,
        actorId: actor.staffId,
      },
    });
    return ok(
      {
        upload: { ...upload, expiresIn: 600 },
        objectKey: key,
        bucket: "avatars",
        maxBytes: STAFF_PHOTO_MAX_BYTES,
        contentTypes: [...STAFF_PHOTO_TYPES],
      },
      { "Cache-Control": "no-store" },
    );
  }
  const pendingWhere = {
    objectKey,
    bucket: "avatars",
    purpose: "staff_avatar",
    entityId: staff.userId,
    actorId: actor.staffId,
    confirmedAt: null,
    createdAt: { gte: new Date(deps.now().getTime() - 600_000) },
  };
  if (
    !objectKey.startsWith(`avatars/${staff.userId}/`) ||
    !(await deps.prisma.pendingUpload.findFirst({ where: pendingWhere }))
  ) {
    throw new ApiError(
      400,
      "invalid_object_key",
      "This photo upload is expired or belongs to another staff member.",
    );
  }
  const info = await deps.storage.getObjectInfo("avatars", objectKey);
  if (
    !STAFF_PHOTO_TYPES.has(info.contentType) ||
    info.size <= 0 ||
    info.size > STAFF_PHOTO_MAX_BYTES
  ) {
    throw new ApiError(400, "invalid_photo", "Choose a JPG, PNG, or WEBP image up to 5 MB.");
  }
  const avatarUrl = await deps.storage.createSignedUrl("avatars", objectKey, 600);
  const previous = await deps.prisma.$transaction(async (tx) => {
    const claimed = await tx.pendingUpload.updateMany({
      where: pendingWhere,
      data: { confirmedAt: deps.now() },
    });
    if (claimed.count !== 1)
      throw new ApiError(
        409,
        "upload_already_used",
        "Choose the photo again to create a new upload.",
      );
    const profile = await tx.profile.findUniqueOrThrow({
      where: { id: staff.userId },
      select: { avatarKey: true },
    });
    await tx.profile.update({ where: { id: staff.userId }, data: { avatarKey: objectKey } });
    return profile.avatarKey;
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.photo.replace",
    actor,
  });
  if (previous && previous !== objectKey) await deps.storage.remove("avatars", [previous]);
  return ok({ avatarUrl }, { "Cache-Control": "no-store" });
}

export async function deleteStaffPhoto(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const { actor, staff } = await staffLinkTarget(deps, req, id);
  return removeStaffPhoto(deps, actor, staff);
}

export async function deleteMyStaffPhoto(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  return removeStaffPhoto(deps, actor, { id: actor.staffId, userId: actor.userId });
}

async function removeStaffPhoto(
  deps: ApiDeps,
  actor: AdminApiActor,
  staff: { id: string; userId: string },
): Promise<Response> {
  const id = staff.id;
  const previous = await deps.prisma.profile.findUniqueOrThrow({
    where: { id: staff.userId },
    select: { avatarKey: true },
  });
  // Do not clear a replacement uploaded concurrently by another editor.
  await deps.prisma.profile.updateMany({
    where: { id: staff.userId, avatarKey: previous.avatarKey },
    data: { avatarKey: null },
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.photo.remove",
    actor,
  });
  if (previous.avatarKey) await deps.storage.remove("avatars", [previous.avatarKey]);
  return ok({ avatarUrl: null }, { "Cache-Control": "no-store" });
}

export async function postStaffPasswordReset(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const { actor, staff } = await staffLinkTarget(deps, req, id);
  if (!deps.storage.generateStaffPasswordReset) {
    throw new ApiError(
      503,
      "reset_not_configured",
      "Staff password reset links are not configured.",
    );
  }
  const { resetUrl } = await deps.storage.generateStaffPasswordReset({ userId: staff.userId });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.password_reset_link_generated",
    actor,
  });
  return ok({ resetUrl }, { "Cache-Control": "no-store" });
}

export async function postStaffInvite(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const { actor, staff } = await staffLinkTarget(deps, req, id);
  if (!deps.storage.generateStaffInvite) {
    throw new ApiError(503, "invite_not_configured", "Staff invite links are not configured.");
  }
  const invite = await deps.storage.generateStaffInvite({
    email: staff.email,
    name: staff.name,
    userId: staff.userId,
  });
  if (!invite) {
    throw new ApiError(
      409,
      "invite_already_accepted",
      "This account has already been confirmed. Use Copy password reset link in Actions, or the Reset password cell in the staff table.",
    );
  }
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.invite_generated",
    actor,
  });
  return ok({ inviteUrl: invite.inviteUrl }, { "Cache-Control": "no-store" });
}

export async function patchStaff(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const existing = await deps.prisma.staffMember.findUnique({
    where: { id },
    select: { name: true, email: true },
  });
  if (!existing) throw new ApiError(404, "staff_not_found", "Staff member not found.");
  const nextName = asString(body.name) ?? existing.name;
  const nextEmail = asString(body.email) ?? existing.email;
  const staff = await deps.prisma.staffMember.update({
    where: { id },
    data: {
      ...(asString(body.name) ? { name: asString(body.name) } : {}),
      ...(asString(body.email) ? { email: asString(body.email) } : {}),
    },
    include: staffCoachInclude,
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.update",
    actor,
    metadata: {
      before: { name: existing.name, email: existing.email },
      after: { name: nextName, email: nextEmail },
    },
  });
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
  const staff = await runLastSuperAdminMutation(
    deps,
    actor,
    {
      staffId: id,
      attemptedAction: "disable",
      roleId: existing.roleId,
      roleKey: existing.roleDefinition?.key ?? null,
    },
    () =>
      deps.prisma.$transaction(async (tx) => {
        await assertLastSuperAdminAction({ prisma: tx } as ApiDeps, id, "disable");
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
      }),
  );
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.disable",
    actor,
    beforeStatus: existing.status,
    afterStatus: "DISABLED",
    metadata: {
      before: { status: existing.status, roleId: existing.roleId },
      after: { status: "DISABLED", roleId: existing.roleId },
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
  if (coach.staffMemberId && coach.staffMemberId !== staff.id) {
    throwFields(
      fieldError("coachId", "already_linked", "This coach is already linked to a staff member."),
    );
  }
  // Replace the link in one transaction so a Coach-role staff member is
  // never left without a teaching profile between separate API requests.
  const updatedCoach = await deps.prisma.$transaction(async (tx) => {
    if (staff.coach && staff.coach.id !== coachId) {
      await tx.coach.update({
        where: { id: staff.coach.id },
        data: { staffMemberId: null },
      });
    }
    return tx.coach.update({
      where: { id: coachId },
      data: { staffMemberId: staff.id },
    });
  });
  await writeAudit(deps, {
    entityType: "staff",
    entityId: staff.id,
    action: "staff.coach.link",
    actor,
    metadata: {
      coachId,
      before: { coachId: staff.coach?.id ?? null },
      after: { coachId },
    },
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
  if (staff.roleDefinition && isCoachAuthorizationRole(staff.roleDefinition.key)) {
    throw new ApiError(
      400,
      "coach_role_requires_link",
      "The Coach role requires a linked coach profile.",
    );
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

export async function assignStaffRole(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const roleId = requireString(body, "roleId", 64);
  const staff = await deps.prisma.staffMember.findUnique({
    where: { id },
    include: staffCoachInclude,
  });
  if (!staff || staff.isSystem) {
    throw new ApiError(404, "staff_not_found", "Staff member not found.");
  }
  const role = await deps.prisma.staffRoleDefinition.findUnique({
    where: { id: roleId },
    include: { permissions: { include: { permission: { select: { key: true } } } } },
  });
  if (!role) throw new ApiError(404, "role_not_found", "Role not found.");
  assertCanGrantPermissions(
    actor,
    resolveRolePermissions({
      allAccess: role.allAccess,
      permissionKeys: role.permissions.map((row) => row.permission.key as never),
    }),
  );
  assertRoleAssignable({
    roleKey: role.key,
    roleActive: role.status === "ACTIVE",
    roleArchived: role.status === "ARCHIVED",
    coachId: staff.coach?.id ?? null,
  });
  const leavingSuperAdmin = Boolean(staff.roleDefinition?.allAccess) && !role.allAccess;
  const updated = await runLastSuperAdminMutation(
    deps,
    actor,
    {
      staffId: id,
      attemptedAction: "demote",
      roleId: staff.roleId,
      roleKey: staff.roleDefinition?.key ?? null,
    },
    () =>
      deps.prisma.$transaction(async (tx) => {
        if (leavingSuperAdmin) {
          await assertLastSuperAdminAction({ prisma: tx } as ApiDeps, id, "demote");
        }
        return tx.staffMember.update({
          where: { id },
          data: { roleId: role.id },
          include: staffCoachInclude,
        });
      }),
  );
  await writeAudit(deps, {
    entityType: "staff",
    entityId: id,
    action: "staff.role.assign",
    actor,
    beforeStatus: staff.roleDefinition?.key ?? staff.roleId,
    afterStatus: role.key,
    metadata: {
      before: { roleId: staff.roleId, roleKey: staff.roleDefinition?.key ?? null },
      after: { roleId: role.id, roleKey: role.key },
    },
  });
  return ok({ staff: presentStaff(updated) });
}

export async function getCustomers(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "customers.read");
  const params = searchParams(req);
  const q = params.get("q") ?? "";
  const hasUpcoming = params.get("hasUpcoming") === "true";
  const onboarding = params.get("onboardingStatus");
  const { page, pageSize, skip } = pagination(params);
  const upcomingStatuses: BookingStatus[] = [
    "HELD_AWAITING_PAYMENT",
    "PAYMENT_SUBMITTED",
    "CONFIRMED",
    "CHECKED_IN",
  ];
  const where: Prisma.ProfileWhereInput = {
    // Auth also creates profiles for staff invites. Only portal registrations
    // belong in this directory, including customers who are also staff.
    customerRegisteredAt: { not: null },
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { fullName: { contains: q, mode: "insensitive" as const } },
            { nickname: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { contactNumber: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(hasUpcoming ? { bookings: { some: { status: { in: upcomingStatuses } } } } : {}),
    ...(onboarding === "completed"
      ? { onboardingCompletedAt: { not: null } }
      : onboarding === "skipped"
        ? { onboardingSkippedAt: { not: null } }
        : onboarding === "in_progress"
          ? { onboardingCompletedAt: null, onboardingSkippedAt: null, onboarding: { isNot: null } }
          : onboarding === "not_started"
            ? { onboardingCompletedAt: null, onboardingSkippedAt: null, onboarding: { is: null } }
            : {}),
  };
  const [total, rows] = await Promise.all([
    deps.prisma.profile.count({ where }),
    deps.prisma.profile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        onboarding: { select: { profileId: true } },
        bookings: { include: { session: true }, orderBy: { reservedAt: "desc" } },
      },
    }),
  ]);
  return ok({
    page,
    pageSize,
    total,
    items: await Promise.all(
      rows.map(async (row) => {
        const upcoming = row.bookings.filter(
          (item) => bookingListTab(item.status) === "upcoming",
        )[0];
        const lastVisit = row.bookings.find(
          (item) => item.status === "CHECKED_IN" || item.status === "NO_SHOW",
        );
        return {
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName,
          fullName: `${row.firstName} ${row.lastName}`.trim() || row.fullName,
          nickname: row.nickname,
          avatarUrl: row.avatarKey
            ? await deps.storage.createSignedUrl("avatars", row.avatarKey, 600)
            : null,
          showOnPublicRoster: row.showOnPublicRoster,
          referralCode: row.referralCode,
          onboardingStatus: row.onboardingCompletedAt
            ? "completed"
            : row.onboardingSkippedAt
              ? "skipped"
              : row.onboarding
                ? "in_progress"
                : "not_started",
          email: row.email,
          contactNumber: row.contactNumber,
          bookingCount: row.bookings.length,
          upcomingCount: row.bookings.filter((item) => bookingListTab(item.status) === "upcoming")
            .length,
          lastVisitAt: lastVisit?.session.startsAt.toISOString() ?? null,
        };
      }),
    ),
  });
}

export async function getCustomer(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "customers.read");
  const profile = await deps.prisma.profile.findUnique({
    where: { id, customerRegisteredAt: { not: null } },
    include: {
      bookings: {
        include: {
          session: { include: { gymClass: true, coaches: { include: { coach: true } } } },
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
      customerBundles: { include: entitlementWithLedger, orderBy: { createdAt: "desc" } },
      bundleAcquisitions: {
        include: { payment: true, entitlement: true },
        orderBy: { createdAt: "desc" },
      },
      onboarding: { include: { interests: true } },
      referredBy: { select: { id: true, firstName: true, lastName: true, fullName: true } },
      referrals: { select: { id: true, firstName: true, lastName: true, fullName: true } },
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
  const avatarUrl = profile.avatarKey
    ? await deps.storage.createSignedUrl("avatars", profile.avatarKey, 600)
    : null;
  const customerBookings = profile.bookings.map((row) => {
    const coaches = row.session.coaches.map(({ coach }) => ({
      id: coach.id,
      name: coach.name,
      photoKey: coach.photoKey,
    }));
    const refund = row.refunds[0];
    return {
      id: row.id,
      customerId: profile.id,
      customerName: `${profile.firstName} ${profile.lastName}`.trim() || profile.fullName,
      sessionId: row.sessionId,
      status: row.status,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.payments[0]?.status ?? "NONE",
      refundStatus: refund?.status ?? "NOT_APPLICABLE",
      holdExpiresAt: row.holdExpiresAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      session: {
        id: row.session.id,
        classId: row.session.classId,
        className: row.session.gymClass.name,
        coaches,
        coachName: coaches.map((coach) => coach.name).join(" & "),
        startsAt: row.session.startsAt.toISOString(),
        endsAt: row.session.endsAt.toISOString(),
        pricePhp: Number(row.session.customerPrice),
        capacity: row.session.capacity,
        remainingSlots: 0,
        reservable: false,
        availability: row.session.status === "CANCELLED" ? "cancelled" : "past",
        status: row.session.status,
      },
    };
  });
  const onboarding = profile.onboarding
    ? {
        goals: profile.onboarding.goals,
        goalsOther: profile.onboarding.goalsOther,
        experienceLevel: profile.onboarding.experienceLevel,
        interestClassIds: profile.onboarding.interests.map((interest) => interest.classId),
        interestsOther: profile.onboarding.interestsOther,
        heardFrom: profile.onboarding.heardFrom,
        heardFromOther: profile.onboarding.heardFromOther,
        updatedAt: profile.onboarding.updatedAt.toISOString(),
      }
    : null;
  const onboardingStatus = profile.onboardingCompletedAt
    ? "completed"
    : profile.onboardingSkippedAt
      ? "skipped"
      : profile.onboarding
        ? "in_progress"
        : "not_started";
  const publicProfile = {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.lastName}`.trim() || profile.fullName,
    nickname: profile.nickname,
    avatarUrl,
    showOnPublicRoster: profile.showOnPublicRoster,
    referralCode: profile.referralCode,
    onboardingStatus,
    email: profile.email,
    contactNumber: profile.contactNumber,
    authMethod: "email" as const,
  };
  return ok({
    ...publicProfile,
    bookingCount: customerBookings.length,
    upcomingCount: customerBookings.filter((item) => bookingListTab(item.status) === "upcoming")
      .length,
    lastVisitAt:
      customerBookings.find((item) => item.status === "CHECKED_IN" || item.status === "NO_SHOW")
        ?.session.startsAt ?? null,
    upcoming: customerBookings.filter((item) => bookingListTab(item.status) === "upcoming"),
    pending: customerBookings.filter((item) => bookingListTab(item.status) === "pending"),
    history: customerBookings.filter((item) => bookingListTab(item.status) === "history"),
    requestHistory: customerBookings.filter(
      (item) =>
        item.status === "CANCELLATION_REQUESTED" ||
        item.status === "RESCHEDULE_REQUESTED" ||
        item.status === "CANCELLED",
    ),
    attendanceHistory: customerBookings.filter(
      (item) =>
        item.status === "CHECKED_IN" || item.status === "NO_SHOW" || item.status === "COMPLETED",
    ),
    paymentHistory: customerBookings.filter(
      (item) => item.paymentStatus !== "NONE" || item.refundStatus !== "NOT_APPLICABLE",
    ),
    policyAcceptances: profile.policyAcceptances.map((row) => ({
      documentName: row.policyVersion.document.title,
      version: row.policyVersion.version,
      acceptedAt: row.acceptedAt.toISOString(),
    })),
    onboarding,
    referral: {
      referredBy: profile.referredBy
        ? {
            id: profile.referredBy.id,
            fullName:
              `${profile.referredBy.firstName} ${profile.referredBy.lastName}`.trim() ||
              profile.referredBy.fullName,
          }
        : null,
      channel: profile.referralChannel,
      referrals: profile.referrals.map((referral) => ({
        id: referral.id,
        fullName: `${referral.firstName} ${referral.lastName}`.trim() || referral.fullName,
      })),
    },
    acquisitions: profile.bundleAcquisitions.map(presentAcquisition),
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
      payments: actorHas(actor, "payments.read")
        ? profile.bookings.flatMap((item) => item.payments)
        : [],
      refunds: actorHas(actor, "refunds.read")
        ? profile.bookings.flatMap((item) => item.refunds)
        : [],
    },
    acceptedPolicyVersions: profile.policyAcceptances.map((row) => ({
      documentName: row.policyVersion.document.title,
      version: row.policyVersion.version,
      acceptedAt: row.acceptedAt.toISOString(),
    })),
    entitlements: profile.customerBundles.map(presentEntitlement),
    pendingAcquisitions: profile.bundleAcquisitions
      .filter((row) => row.status === "PENDING_PAYMENT" || row.status === "PENDING_REVIEW")
      .map(presentAcquisition),
  });
}
