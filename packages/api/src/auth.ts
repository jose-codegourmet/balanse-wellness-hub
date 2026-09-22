import type { Prisma } from "@balanse/db";
import {
  actorSatisfiesAccess,
  canGrantPermissions,
  filterPermissionKeys,
  hasAnyPermission,
  hasPermission,
  hasScopedPermission,
  isInteractiveStaffActor,
  isPermissionKey,
  matchAdminApiAccess,
  type PermissionKey,
  roleAssignmentDeniedReason,
} from "@balanse/domain";
import { type AdminApiActor, type ApiActor, type ApiDeps, staffAuthorizationOf } from "./deps";
import { ApiError } from "./errors";
import { searchParams } from "./http";
import { assertLastSuperAdminSafe, dbOwnsSession } from "./sql";

const staffActorInclude = {
  coach: { select: { id: true } },
  roleDefinition: {
    include: {
      permissions: { include: { permission: { select: { key: true } } } },
    },
  },
} as const;

export async function resolveActor(deps: ApiDeps, req: Request): Promise<ApiActor> {
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const user = await deps.resolveUser(token);
  if (!user) return { kind: "anon" };

  const staff = await deps.prisma.staffMember.findFirst({
    where: { userId: user.id, isSystem: false },
    include: staffActorInclude,
  });
  const role = staff?.roleDefinition;
  if (staff && role && staff.status === "ACTIVE" && role.status === "ACTIVE") {
    const permissions = filterPermissionKeys(role.permissions.map((row) => row.permission.key));
    return {
      kind: "admin",
      userId: user.id,
      staffId: staff.id,
      email: user.email,
      authMethod: user.authMethod,
      staffStatus: "active",
      roleId: role.id,
      roleKey: role.key,
      roleActive: true,
      permissions,
      coachId: staff.coach?.id ?? null,
      isCoach: Boolean(staff.coach),
      isSystem: false,
    };
  }
  return {
    kind: "customer",
    userId: user.id,
    email: user.email,
    authMethod: user.authMethod,
  };
}

export function requireCustomer(
  actor: ApiActor,
): Extract<ApiActor, { kind: "customer" | "admin" }> {
  if (actor.kind === "anon") {
    throw new ApiError(401, "unauthenticated", "Sign in required.");
  }
  return actor;
}

export function requireActiveStaff(actor: ApiActor): AdminApiActor {
  if (actor.kind === "anon") {
    throw new ApiError(401, "unauthenticated", "Sign in required.");
  }
  if (actor.kind !== "admin" || !isInteractiveStaffActor(staffAuthorizationOf(actor))) {
    throw new ApiError(403, "forbidden", "Admin authorisation required.");
  }
  return actor;
}

/** @deprecated Use requireActiveStaff — kept as the handler extraction alias. */
export function requireAdmin(actor: ApiActor): AdminApiActor {
  return requireActiveStaff(actor);
}

export function requirePermission(actor: AdminApiActor, key: PermissionKey): AdminApiActor {
  if (!hasPermission(staffAuthorizationOf(actor), key)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: key },
    });
  }
  return actor;
}

export function requireAnyPermission(
  actor: AdminApiActor,
  keys: readonly PermissionKey[],
): AdminApiActor {
  if (!hasAnyPermission(staffAuthorizationOf(actor), keys)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { anyOf: [...keys] },
    });
  }
  return actor;
}

export async function requireOwnedSession(
  deps: ApiDeps,
  actor: AdminApiActor,
  sessionId: string,
  ownKey: PermissionKey,
  allKey: PermissionKey,
): Promise<AdminApiActor> {
  const auth = staffAuthorizationOf(actor);
  const owns = await dbOwnsSession(deps, actor.userId, sessionId);
  if (!hasScopedPermission(auth, ownKey, allKey, owns)) {
    if (hasPermission(auth, ownKey) && !owns) {
      throw new ApiError(
        403,
        "forbidden",
        "This session is outside the signed-in coach's assignments.",
        {
          details: { permission: ownKey, ownership: false },
        },
      );
    }
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { anyOf: [ownKey, allKey] },
    });
  }
  return actor;
}

export async function authorizeAdminRequest(
  deps: ApiDeps,
  req: Request,
  pathname: string,
): Promise<AdminApiActor> {
  const actor = requireActiveStaff(await resolveActor(deps, req));
  const access = matchAdminApiAccess(req.method, pathname, searchParams(req));
  if (!access) {
    throw new ApiError(403, "forbidden", "No permission mapping for this route.");
  }
  const auth = staffAuthorizationOf(actor);
  if (!actorSatisfiesAccess(auth, access)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { anyOf: [...access.anyOf] },
    });
  }
  return actor;
}

export function assertCanGrantPermissions(
  actor: AdminApiActor,
  requested: readonly PermissionKey[],
): void {
  if (!requested.every(isPermissionKey)) {
    throw new ApiError(
      400,
      "unknown_permission",
      "Unknown permission key. Use the canonical registry.",
    );
  }
  if (!canGrantPermissions(staffAuthorizationOf(actor), requested)) {
    throw new ApiError(
      403,
      "privilege_escalation",
      "Cannot grant a permission the actor does not hold.",
    );
  }
}

export function assertRoleAssignable(input: {
  roleKey: string;
  roleActive: boolean;
  roleArchived: boolean;
  coachId: string | null;
}): void {
  const reason = roleAssignmentDeniedReason(input);
  if (!reason) return;
  const code =
    input.roleArchived || !input.roleActive ? "archived_role" : "coach_role_requires_link";
  throw new ApiError(400, code, reason);
}

export async function assertLastSuperAdminAction(
  deps: ApiDeps,
  staffId: string,
  action: "disable" | "demote" | "delete" | "strip_all_access",
): Promise<void> {
  await assertLastSuperAdminSafe(deps, staffId, action);
}

export async function writeAudit(
  deps: ApiDeps,
  input: {
    entityType: string;
    entityId: string;
    action: string;
    actor: ApiActor;
    beforeStatus?: string | null;
    afterStatus?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const actorType =
    input.actor.kind === "admin"
      ? "STAFF"
      : input.actor.kind === "customer"
        ? "CUSTOMER"
        : "SYSTEM";
  const actorId = input.actor.kind === "admin" ? input.actor.staffId : null;
  const metadata: Record<string, unknown> = {
    ...(input.metadata ?? {}),
    ...(input.actor.kind === "admin"
      ? {
          actorStaffId: input.actor.staffId,
          actorRoleId: input.actor.roleId,
          actorRoleKey: input.actor.roleKey,
        }
      : {}),
  };
  await deps.prisma.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorType,
      actorId,
      beforeStatus: input.beforeStatus ?? null,
      afterStatus: input.afterStatus ?? null,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}
