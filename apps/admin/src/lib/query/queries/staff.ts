import {
  type ApiFetcher,
  getRole,
  listPermissions,
  listRoles,
  listStaff,
} from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Display-only identity shared by navigation and My profile; never grants permissions. */
export const adminStaffIdentityQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) =>
  queryOptions({
    queryKey: [...adminKeys.all(adminAuthScope(actor)), "identity"],
    queryFn: async () => (await fetcher<{ actor: StaffAuthorizationActor }>("/api/admin/me")).actor,
    enabled: Boolean(actor),
    staleTime: 240_000,
    refetchInterval: 240_000,
  });

export const adminStaffQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.staff.all(scope),
    queryFn: async () => (await listStaff(fetcher)).items,
    staleTime: 240_000,
    refetchInterval: 240_000,
  });
};

export const adminStaffRolesQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.staff.roles.list(scope),
    queryFn: async () => (await listRoles(fetcher)).items,
  });
};

export const adminStaffRoleQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  roleId: string,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.staff.roles.detail(scope, roleId),
    queryFn: async () => (await getRole(fetcher, roleId)).role,
  });
};

export const adminPermissionsQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.staff.permissions(scope),
    queryFn: async () => (await listPermissions(fetcher)).items,
  });
};
