import {
  customRoleIdentityConflicts,
  filterPermissionKeys,
  groupedPermissionRegistry,
  isPermissionKey,
  isValidCustomPermissionSet,
  PERMISSION_REGISTRY,
  type PermissionKey,
  resolveRolePermissions,
} from "@balanse/domain";
import { assertCanGrantPermissions, requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { fieldError, requireString, throwFields } from "../validation";

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { staffMembers: true } },
} as const;

function presentRole(row: {
  id: string;
  key: string;
  name: string;
  description: string;
  builtIn: boolean;
  builtInKey: string | null;
  allAccess: boolean;
  status: "ACTIVE" | "ARCHIVED";
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  permissions: Array<{ permission: { key: string } }>;
  _count?: { staffMembers: number };
}) {
  const permissionKeys = resolveRolePermissions({
    allAccess: row.allAccess,
    permissionKeys: row.permissions.map((item) => item.permission.key as never),
  });
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    builtIn: row.builtIn,
    builtInKey: row.builtInKey,
    allAccess: row.allAccess,
    status: row.status === "ACTIVE" ? "active" : "archived",
    archivedAt: row.archivedAt?.toISOString() ?? null,
    assignedStaffCount: row._count?.staffMembers ?? 0,
    permissionKeys,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function slugKey(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || `custom_${crypto.randomUUID().slice(0, 8)}`;
}

function parsePermissionKeys(value: unknown): PermissionKey[] {
  if (!Array.isArray(value)) {
    throwFields(fieldError("permissionKeys", "required", "permissionKeys must be an array."));
  }
  const keys = filterPermissionKeys(value);
  if (value.some((item) => !isPermissionKey(item))) {
    throw new ApiError(
      400,
      "unknown_permission",
      "Unknown permission key. Use the canonical registry.",
    );
  }
  if (!isValidCustomPermissionSet(keys)) {
    throwFields(
      fieldError(
        "permissionKeys",
        "required",
        "A custom role needs a unique non-empty permission set.",
      ),
    );
  }
  return keys;
}

async function loadRole(deps: ApiDeps, id: string) {
  const role = await deps.prisma.staffRoleDefinition.findFirst({
    where: { OR: [{ id }, { key: id }] },
    include: roleInclude,
  });
  if (!role) throw new ApiError(404, "role_not_found", "Role not found.");
  return role;
}

export async function getPermissionRegistry(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  return ok({
    items: PERMISSION_REGISTRY,
    grouped: groupedPermissionRegistry(),
  });
}

export async function getRoles(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const items = await deps.prisma.staffRoleDefinition.findMany({
    orderBy: [{ builtIn: "desc" }, { name: "asc" }],
    include: roleInclude,
  });
  return ok({ items: items.map(presentRole) });
}

export async function getRole(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  return ok({ role: presentRole(await loadRole(deps, id)) });
}

export async function postRole(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", 80);
  const description = asString(body.description)?.trim() ?? "";
  const key = (asString(body.key)?.trim() || slugKey(name)).toLowerCase();
  if (customRoleIdentityConflicts(name, key)) {
    throw new ApiError(400, "reserved_role", "Custom roles cannot reuse a built-in name or key.");
  }
  const permissionKeys = parsePermissionKeys(body.permissionKeys);
  assertCanGrantPermissions(actor, permissionKeys);
  const created = await deps.prisma.staffRoleDefinition.create({
    data: {
      key,
      name,
      description,
      builtIn: false,
      allAccess: false,
      status: "ACTIVE",
      permissions: {
        create: permissionKeys.map((permissionId) => ({ permissionId })),
      },
    },
    include: roleInclude,
  });
  await writeAudit(deps, {
    entityType: "staff_role",
    entityId: created.id,
    action: "role.create",
    actor,
    metadata: { after: presentRole(created) },
  });
  return ok({ role: presentRole(created) });
}

export async function patchRole(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await loadRole(deps, id);
  if (existing.builtIn) {
    throw new ApiError(403, "forbidden", "Built-in roles cannot be edited.");
  }
  const body = await readJson(req);
  const name = asString(body.name)?.trim();
  const description = asString(body.description);
  const permissionKeys =
    body.permissionKeys === undefined ? undefined : parsePermissionKeys(body.permissionKeys);
  if (name && customRoleIdentityConflicts(name, existing.key)) {
    throw new ApiError(400, "reserved_role", "Custom roles cannot reuse a built-in name or key.");
  }
  if (permissionKeys) {
    const currentKeys = resolveRolePermissions({
      allAccess: existing.allAccess,
      permissionKeys: existing.permissions.map((row) => row.permission.key as never),
    });
    assertCanGrantPermissions(actor, [...new Set([...currentKeys, ...permissionKeys])]);
  }
  const before = presentRole(existing);
  const updated = await deps.prisma.$transaction(async (tx) => {
    if (permissionKeys) {
      await tx.staffRolePermission.deleteMany({ where: { roleId: existing.id } });
      await tx.staffRolePermission.createMany({
        data: permissionKeys.map((permissionId) => ({
          roleId: existing.id,
          permissionId,
        })),
      });
    }
    return tx.staffRoleDefinition.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      include: roleInclude,
    });
  });
  const after = presentRole(updated);
  await writeAudit(deps, {
    entityType: "staff_role",
    entityId: existing.id,
    action: "role.update",
    actor,
    metadata: { before, after },
  });
  return ok({ role: after });
}

export async function cloneRole(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const source = await loadRole(deps, id);
  const body = await readJson(req);
  const name = requireString(body, "name", 80);
  const key = (asString(body.key)?.trim() || slugKey(name)).toLowerCase();
  if (customRoleIdentityConflicts(name, key)) {
    throw new ApiError(400, "reserved_role", "Custom roles cannot reuse a built-in name or key.");
  }
  const permissionKeys = resolveRolePermissions({
    allAccess: source.allAccess,
    permissionKeys: source.permissions.map((row) => row.permission.key as never),
  });
  assertCanGrantPermissions(actor, permissionKeys);
  const created = await deps.prisma.staffRoleDefinition.create({
    data: {
      key,
      name,
      description: asString(body.description)?.trim() || `Cloned from ${source.name}`,
      builtIn: false,
      allAccess: false,
      status: "ACTIVE",
      permissions: {
        create: permissionKeys.map((permissionId) => ({ permissionId })),
      },
    },
    include: roleInclude,
  });
  await writeAudit(deps, {
    entityType: "staff_role",
    entityId: created.id,
    action: "role.clone",
    actor,
    metadata: { sourceRoleId: source.id, after: presentRole(created) },
  });
  return ok({ role: presentRole(created) });
}

export async function archiveRole(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await loadRole(deps, id);
  if (existing.builtIn) {
    throw new ApiError(403, "forbidden", "Built-in roles cannot be archived.");
  }
  if (existing._count.staffMembers > 0) {
    throw new ApiError(409, "conflict", "Assigned custom roles cannot be archived.");
  }
  const before = presentRole(existing);
  const updated = await deps.prisma.staffRoleDefinition.update({
    where: { id: existing.id },
    data: { status: "ARCHIVED", archivedAt: deps.now() },
    include: roleInclude,
  });
  await writeAudit(deps, {
    entityType: "staff_role",
    entityId: existing.id,
    action: "role.archive",
    actor,
    beforeStatus: "ACTIVE",
    afterStatus: "ARCHIVED",
    metadata: { before, after: presentRole(updated) },
  });
  return ok({ role: presentRole(updated) });
}
