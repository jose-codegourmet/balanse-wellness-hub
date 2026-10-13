import "server-only";
import { ApiError } from "@balanse/api-client";
import { apiFetchServer } from "@balanse/api-client/server";
import { filterPermissionKeys, type StaffAuthorizationActor } from "@balanse/domain";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Staff identity from Supabase Auth (replaces the mock principal, WIRE-0202
 * / #357). `role` mirrors `resolveActor`'s three outcomes: no session is a
 * guest; a signed-in user with no active `staff_members` row is a customer
 * (admin has no customer concept of its own — this is "signed in, not
 * staff"); an active, interactive staff member is admin, with `actor` set.
 */
export type StaffSessionRole = "guest" | "customer" | "admin";

export type StaffSession = {
  role: StaffSessionRole;
  actor: StaffAuthorizationActor | null;
};

const GUEST_SESSION: StaffSession = { role: "guest", actor: null };
const CUSTOMER_SESSION: StaffSession = { role: "customer", actor: null };

async function readAccessToken(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves the signed-in staff member through the user's RLS-scoped read when
 * the local API cannot reach Prisma (for example, a local checkout without a
 * DATABASE_URL). API handlers still authorize every data read and mutation.
 */
async function resolveStaffSessionFromRls(): Promise<StaffSession> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;
    if (userError || !user) return GUEST_SESSION;

    const { data: staff, error: staffError } = await supabase
      .from("staff_members")
      .select(
        "id,userId,name,email,status,roleId,isSystem,roleDefinition:staff_role_definitions!staff_members_roleId_fkey(key,name,status,permissions:staff_role_permissions(permission:permission_definitions(key)))",
      )
      .eq("userId", user.id)
      .eq("isSystem", false)
      .maybeSingle();
    if (staffError || !staff) return CUSTOMER_SESSION;

    const role = (Array.isArray(staff.roleDefinition)
      ? staff.roleDefinition[0]
      : staff.roleDefinition) as unknown as {
      key: string;
      name: string;
      status: "ACTIVE" | "ARCHIVED";
      permissions: Array<{ permission: { key: string } | Array<{ key: string }> | null }>;
    } | null;
    if (!role) return CUSTOMER_SESSION;

    const permissions = filterPermissionKeys(
      role.permissions.flatMap((entry) => {
        if (!entry.permission) return [];
        return (Array.isArray(entry.permission) ? entry.permission : [entry.permission]).map(
          (permission) => permission.key,
        );
      }),
    );
    return {
      role: "admin",
      actor: {
        userId: staff.userId,
        staffId: staff.id,
        staffStatus: staff.status === "ACTIVE" ? "active" : "disabled",
        roleId: staff.roleId,
        roleKey: role.key,
        roleActive: role.status === "ACTIVE",
        permissions,
        coachId: null,
        isCoach: false,
        email: staff.email ?? user.email ?? null,
        name: staff.name,
        roleName: role.name,
        avatarUrl: null,
        isSystem: false,
      },
    };
  } catch {
    return GUEST_SESSION;
  }
}

async function resolveStaffSession(): Promise<StaffSession> {
  const token = await readAccessToken();
  if (!token) return GUEST_SESSION;
  try {
    const body = await apiFetchServer<{ actor: StaffAuthorizationActor }>(
      "/api/admin/me",
      {},
      token,
    );
    return { role: "admin", actor: body.actor };
  } catch (error) {
    // 403: signed in but not an active staff member. 401 (expired/invalid
    // token) is not staff. A local database outage falls back to the same
    // RLS-scoped staff read the session is allowed to make.
    if (error instanceof ApiError && error.status === 403) return CUSTOMER_SESSION;
    if (error instanceof ApiError && error.status === 401) return GUEST_SESSION;
    return resolveStaffSessionFromRls();
  }
}

/** The signed-in staff session for this request. Cached per render. */
export const getStaffSession = cache(resolveStaffSession);

/**
 * Raw bearer token for this request, so server-side prefetch can call
 * `@balanse/api-client/server` directly (WIRE-0504, #358). `null` for a
 * guest. Cached per render, same as `getStaffSession`.
 */
export const getStaffAccessToken = cache(readAccessToken);
