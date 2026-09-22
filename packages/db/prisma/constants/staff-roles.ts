import {
  BUILT_IN_ROLE_DEFINITIONS,
  PERMISSION_REGISTRY,
  resolveRolePermissions,
} from "@balanse/domain";
import type { PrismaClient } from "@prisma/client";

const BUILT_IN_ROLE_IDS: Record<string, string> = {
  super_admin: "role_super_admin",
  front_desk: "role_front_desk",
  coach: "role_coach",
};

/** Idempotent registry + built-in role snapshot. Imports #294 contracts; does not invent keys. */
export async function seedCanonicalRolesAndPermissions(prisma: PrismaClient): Promise<void> {
  for (const permission of PERMISSION_REGISTRY) {
    await prisma.permissionDefinition.upsert({
      where: { key: permission.key },
      create: {
        id: permission.key,
        key: permission.key,
        category: permission.category,
        label: permission.label,
        description: permission.description,
        sensitive: permission.sensitive,
      },
      update: {
        category: permission.category,
        label: permission.label,
        description: permission.description,
        sensitive: permission.sensitive,
      },
    });
  }

  for (const role of BUILT_IN_ROLE_DEFINITIONS) {
    const id = BUILT_IN_ROLE_IDS[role.key];
    await prisma.staffRoleDefinition.upsert({
      where: { key: role.key },
      create: {
        id,
        key: role.key,
        name: role.name,
        description: role.description,
        builtIn: true,
        builtInKey: role.builtInKey,
        allAccess: role.allAccess,
        status: "ACTIVE",
      },
      update: {
        name: role.name,
        description: role.description,
      },
    });
  }

  for (const role of BUILT_IN_ROLE_DEFINITIONS) {
    const persisted = await prisma.staffRoleDefinition.findUniqueOrThrow({
      where: { key: role.key },
    });
    const existingCount = await prisma.staffRolePermission.count({
      where: { roleId: persisted.id },
    });
    // After #298 helpers, Front Desk / Coach matrices are trigger-protected.
    // Only fill an empty join (schema-only / seed-before-SQL). Super Admin
    // upserts remain allowed so the snapshot stays current-registry complete.
    if (existingCount > 0 && !role.allAccess) continue;
    for (const key of resolveRolePermissions(role)) {
      try {
        await prisma.staffRolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: persisted.id, permissionId: key },
          },
          create: {
            id: `${persisted.id}:${key}`,
            roleId: persisted.id,
            permissionId: key,
          },
          update: {},
        });
      } catch {
        // built_in_role_matrix_protected — migration SQL already seeded.
      }
    }
  }
}
