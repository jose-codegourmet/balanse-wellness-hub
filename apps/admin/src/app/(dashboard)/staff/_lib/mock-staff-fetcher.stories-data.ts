import type { ApiFetcher, RoleInput, StaffInput } from "@balanse/api-client";
import {
  type AdminStaff,
  PERMISSION_REGISTRY,
  type StaffAuthorizationActor,
} from "@balanse/domain";
import { getMockAdapter, mockStaffMemberById } from "@balanse/mock";

let previewStaffActor: StaffAuthorizationActor | null = null;
/** Set from Storybook's session, independently of the legacy mock data principal. */
export function setPreviewStaffActor(actor: StaffAuthorizationActor | null) {
  previewStaffActor = actor;
}

/** Storybook-only actor consumed by entity mock fetchers. */
export function getPreviewStaffActor(): StaffAuthorizationActor | null {
  return previewStaffActor;
}

const previewInviteUrl =
  "https://admin.example.com/auth/set-password#token_hash=storybook-invitation-only";
const staffWire = (staff: AdminStaff) => ({
  ...staff,
  status: staff.status === "active" ? "ACTIVE" : "DISABLED",
});

/** Storybook-only. Never provisions Auth users or sends email. */
export const mockStaffFetcher: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toUpperCase();
  if (path === "/api/admin/me" && method === "GET") {
    const actor = previewStaffActor;
    if (!actor) throw new Error("No staff session in this preview.");
    const staff = mockStaffMemberById(actor.staffId);
    return { actor: { ...actor, name: staff?.name, avatarUrl: staff?.avatarUrl ?? null } } as never;
  }
  if (path === "/api/admin/me/photo" || /^\/api\/admin\/staff\/[^/]+\/photo$/.test(path)) {
    throw new Error("Photo uploads are unavailable in this preview. No live storage is contacted.");
  }
  if (path === "/api/admin/staff" && method === "GET") {
    return { items: (await adapter.getAdminStaff()).map(staffWire) } as never;
  }
  if (path === "/api/admin/roles" && method === "GET") {
    return { items: await adapter.getAdminStaffRoles() } as never;
  }
  if (path === "/api/admin/permissions" && method === "GET") {
    return { items: PERMISSION_REGISTRY } as never;
  }
  const rolePath = /^\/api\/admin\/roles\/([^/]+)(?:\/(clone|archive))?$/.exec(path);
  if (rolePath) {
    const [, roleId, action] = rolePath;
    if (method === "GET" && !action) {
      const role = await adapter.getAdminStaffRole(roleId);
      if (!role) throw new Error("Role not found.");
      return { role } as never;
    }
    if (method === "POST" && action === "archive") {
      return { role: await adapter.archiveAdminStaffRole(roleId) } as never;
    }
    if (method === "POST" && action === "clone") {
      const source = await adapter.getAdminStaffRole(roleId);
      if (!source) throw new Error("Role not found.");
      const body = init?.body as Pick<RoleInput, "name" | "description">;
      return {
        role: await adapter.upsertAdminStaffRole({
          name: body.name,
          description: body.description ?? source.description,
          permissionKeys: source.permissionKeys,
          cloneSourceId: roleId,
        }),
      } as never;
    }
    if (method === "PATCH" && !action) {
      const existing = await adapter.getAdminStaffRole(roleId);
      if (!existing) throw new Error("Role not found.");
      const body = init?.body as Partial<RoleInput>;
      return {
        role: await adapter.upsertAdminStaffRole({
          id: roleId,
          name: body.name ?? existing.name,
          description: body.description ?? existing.description,
          permissionKeys: body.permissionKeys ?? existing.permissionKeys,
        }),
      } as never;
    }
  }
  if (path === "/api/admin/roles" && method === "POST") {
    const body = init?.body as RoleInput;
    return {
      role: await adapter.upsertAdminStaffRole({
        name: body.name,
        description: body.description ?? "",
        permissionKeys: body.permissionKeys,
      }),
    } as never;
  }
  if (path === "/api/admin/staff" && method === "POST") {
    const input = init?.body as StaffInput;
    const staff = await adapter.upsertAdminStaff({
      ...input,
      role: "ADMIN",
      status: "active",
      isCoach: Boolean(input.coachId),
    });
    return { staff: staffWire(staff), inviteUrl: previewInviteUrl } as never;
  }
  const staffPath = /^\/api\/admin\/staff\/([^/]+)(?:\/(disable|coach|role))?$/.exec(path);
  if (staffPath) {
    const [, staffId, action] = staffPath;
    const existing = (await adapter.getAdminStaff()).find((row) => row.id === staffId);
    if (!existing) throw new Error("Staff member not found.");
    if (method === "POST" && action === "disable") {
      return { staff: staffWire(await adapter.disableAdminStaff(staffId)) } as never;
    }
    if (
      (method === "PATCH" && !action) ||
      (method === "POST" && (action === "coach" || action === "role")) ||
      (method === "DELETE" && action === "coach")
    ) {
      const body = (init?.body ?? {}) as Partial<StaffInput>;
      const staff = await adapter.upsertAdminStaff({
        id: staffId,
        name: body.name ?? existing.name,
        email: body.email ?? existing.email,
        role: existing.role,
        roleId: action === "role" ? (body.roleId ?? existing.roleId) : existing.roleId,
        status: existing.status,
        isCoach: action === "coach" ? method === "POST" : existing.isCoach,
      });
      return { staff: staffWire(staff) } as never;
    }
  }
  const invite = /^\/api\/admin\/staff\/([^/]+)\/(invite|reset-password)$/.exec(path);
  if (invite && method === "POST") {
    const staff = (await adapter.getAdminStaff()).find((row) => row.id === invite[1]);
    if (staff?.status !== "active") throw new Error("Staff member is not active.");
    return (
      invite[2] === "reset-password"
        ? { resetUrl: `${previewInviteUrl}&type=recovery` }
        : { inviteUrl: previewInviteUrl }
    ) as never;
  }
  throw new Error(`mockStaffFetcher: unhandled ${method} ${path}`);
};
