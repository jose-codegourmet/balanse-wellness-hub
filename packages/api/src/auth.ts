import type { Prisma } from "@balanse/db";
import type { ApiActor, ApiDeps } from "./deps";
import { ApiError } from "./errors";

export async function resolveActor(deps: ApiDeps, req: Request): Promise<ApiActor> {
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const user = await deps.resolveUser(token);
  if (!user) return { kind: "anon" };

  const staff = await deps.prisma.staffMember.findFirst({
    where: { userId: user.id, status: "ACTIVE", role: "ADMIN", isSystem: false },
  });
  if (staff) {
    return {
      kind: "admin",
      userId: user.id,
      staffId: staff.id,
      email: user.email,
      authMethod: user.authMethod,
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

export function requireAdmin(actor: ApiActor): Extract<ApiActor, { kind: "admin" }> {
  if (actor.kind === "anon") {
    throw new ApiError(401, "unauthenticated", "Sign in required.");
  }
  if (actor.kind !== "admin") {
    throw new ApiError(403, "forbidden", "Admin authorisation required.");
  }
  return actor;
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
  await deps.prisma.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorType,
      actorId,
      beforeStatus: input.beforeStatus ?? null,
      afterStatus: input.afterStatus ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
