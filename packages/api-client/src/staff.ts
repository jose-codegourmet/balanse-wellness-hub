import type {
  AdminStaff,
  AdminStaffRole,
  PermissionDefinition,
  PermissionKey,
  SignedUploadIntent,
  StaffRole,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";
import { putSignedUpload } from "./uploads";

export async function replaceStaffPhoto(
  fetcher: ApiFetcher,
  id: string,
  file: File,
): Promise<{ avatarUrl: string | null }> {
  return uploadStaffPhoto(fetcher, `/api/admin/staff/${id}/photo`, file);
}

export function replaceMyStaffPhoto(
  fetcher: ApiFetcher,
  file: File,
): Promise<{ avatarUrl: string | null }> {
  return uploadStaffPhoto(fetcher, "/api/admin/me/photo", file);
}

export function removeMyStaffPhoto(fetcher: ApiFetcher): Promise<{ avatarUrl: string | null }> {
  return fetcher("/api/admin/me/photo", { method: "DELETE" });
}

async function uploadStaffPhoto(
  fetcher: ApiFetcher,
  path: string,
  file: File,
): Promise<{ avatarUrl: string | null }> {
  const intent = await fetcher<Omit<SignedUploadIntent, "bucket"> & { bucket: "avatars" }>(path, {
    method: "POST",
    body: { contentType: file.type },
  });
  if (!intent.contentTypes.includes(file.type) || file.size > intent.maxBytes)
    throw new Error("Choose a JPG, PNG, or WEBP image up to 5 MB.");
  await putSignedUpload(intent.upload.signedUrl, file, file.type);
  return fetcher(path, { method: "POST", body: { objectKey: intent.objectKey } });
}

export function removeStaffPhoto(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ avatarUrl: string | null }> {
  return fetcher(`/api/admin/staff/${id}/photo`, { method: "DELETE" });
}

type StaffWire = Omit<AdminStaff, "status"> & { status: "ACTIVE" | "DISABLED" };
type RoleWire = Omit<AdminStaffRole, "permissionCount">;

function presentStaff(staff: StaffWire): AdminStaff {
  return {
    ...staff,
    role: staff.role as StaffRole,
    status: staff.status === "ACTIVE" ? "active" : "disabled",
  };
}

function presentRole(role: RoleWire): AdminStaffRole {
  return { ...role, permissionCount: role.permissionKeys.length };
}

export type StaffInput = {
  name: string;
  email: string;
  roleId: string;
  coachId?: string | null;
  /** Creates this person's coach profile in the same request (needs `coaches.manage`). */
  newCoach?: NewCoachProfileInput | null;
};

/** Coach profile fields for a coach created with its staff member. Name defaults to the staff name. */
export type NewCoachProfileInput = {
  name?: string;
  specialties?: string[];
  shortBio?: string;
  active?: boolean;
  defaultRatePhp?: number;
  rateType?: "PER_SESSION" | "PER_HOUR";
};

export type StaffPatchInput = Pick<StaffInput, "name" | "email">;
export type RoleInput = {
  name: string;
  description?: string;
  permissionKeys: readonly PermissionKey[];
};

export async function listStaff(fetcher: ApiFetcher): Promise<{ items: AdminStaff[] }> {
  const response = await fetcher<{ items: StaffWire[] }>("/api/admin/staff");
  return { items: response.items.map(presentStaff) };
}

export async function createStaff(
  fetcher: ApiFetcher,
  input: StaffInput,
): Promise<{ staff: AdminStaff; inviteUrl: string | null }> {
  const response = await fetcher<{ staff: StaffWire; inviteUrl: string | null }>(
    "/api/admin/staff",
    {
      method: "POST",
      body: input,
    },
  );
  return { staff: presentStaff(response.staff), inviteUrl: response.inviteUrl ?? null };
}

export async function createStaffInvite(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ inviteUrl: string }> {
  return fetcher(`/api/admin/staff/${id}/invite`, { method: "POST" });
}

export async function createStaffPasswordReset(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ resetUrl: string }> {
  return fetcher(`/api/admin/staff/${id}/reset-password`, { method: "POST" });
}

export async function patchStaff(
  fetcher: ApiFetcher,
  id: string,
  input: StaffPatchInput,
): Promise<{ staff: AdminStaff }> {
  const response = await fetcher<{ staff: StaffWire }>(`/api/admin/staff/${id}`, {
    method: "PATCH",
    body: input,
  });
  return { staff: presentStaff(response.staff) };
}

export async function disableStaff(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ staff: AdminStaff }> {
  const response = await fetcher<{ staff: StaffWire }>(`/api/admin/staff/${id}/disable`, {
    method: "POST",
  });
  return { staff: presentStaff(response.staff) };
}

export async function linkCoach(
  fetcher: ApiFetcher,
  id: string,
  coachId: string,
): Promise<{ staff: AdminStaff }> {
  const response = await fetcher<{ staff: StaffWire }>(`/api/admin/staff/${id}/coach`, {
    method: "POST",
    body: { coachId },
  });
  return { staff: presentStaff(response.staff) };
}

export async function unlinkCoach(fetcher: ApiFetcher, id: string): Promise<{ staff: AdminStaff }> {
  const response = await fetcher<{ staff: StaffWire }>(`/api/admin/staff/${id}/coach`, {
    method: "DELETE",
  });
  return { staff: presentStaff(response.staff) };
}

export async function assignRole(
  fetcher: ApiFetcher,
  id: string,
  roleId: string,
): Promise<{ staff: AdminStaff }> {
  const response = await fetcher<{ staff: StaffWire }>(`/api/admin/staff/${id}/role`, {
    method: "POST",
    body: { roleId },
  });
  return { staff: presentStaff(response.staff) };
}

export async function listPermissions(
  fetcher: ApiFetcher,
): Promise<{ items: PermissionDefinition[] }> {
  return fetcher("/api/admin/permissions");
}

export async function listRoles(fetcher: ApiFetcher): Promise<{ items: AdminStaffRole[] }> {
  const response = await fetcher<{ items: RoleWire[] }>("/api/admin/roles");
  return { items: response.items.map(presentRole) };
}

export async function getRole(fetcher: ApiFetcher, id: string): Promise<{ role: AdminStaffRole }> {
  const response = await fetcher<{ role: RoleWire }>(`/api/admin/roles/${id}`);
  return { role: presentRole(response.role) };
}

export async function createRole(
  fetcher: ApiFetcher,
  input: RoleInput,
): Promise<{ role: AdminStaffRole }> {
  const response = await fetcher<{ role: RoleWire }>("/api/admin/roles", {
    method: "POST",
    body: input,
  });
  return { role: presentRole(response.role) };
}

export async function patchRole(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<RoleInput>,
): Promise<{ role: AdminStaffRole }> {
  const response = await fetcher<{ role: RoleWire }>(`/api/admin/roles/${id}`, {
    method: "PATCH",
    body: input,
  });
  return { role: presentRole(response.role) };
}

export async function cloneRole(
  fetcher: ApiFetcher,
  id: string,
  input: Pick<RoleInput, "name" | "description">,
): Promise<{ role: AdminStaffRole }> {
  const response = await fetcher<{ role: RoleWire }>(`/api/admin/roles/${id}/clone`, {
    method: "POST",
    body: input,
  });
  return { role: presentRole(response.role) };
}

export async function archiveRole(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ role: AdminStaffRole }> {
  const response = await fetcher<{ role: RoleWire }>(`/api/admin/roles/${id}/archive`, {
    method: "POST",
  });
  return { role: presentRole(response.role) };
}
