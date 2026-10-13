"use client";

import {
  type ApiFetcher,
  archiveRole,
  assignRole,
  cloneRole,
  createCoach,
  createRole,
  createStaff,
  disableStaff,
  linkCoach,
  type NewCoachProfileInput,
  patchRole,
  patchStaff,
  unlinkCoach,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { PermissionKey } from "@balanse/domain";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

/** Staff form `coachId` value meaning "create a new coach profile for this person". */
export const NEW_COACH_PROFILE = "__new_coach_profile__";

function staffCoachKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.staff.all(role),
    adminKeys.coaches.all(role),
    adminKeys.staff.roles.all(role),
    [...adminKeys.all(role), "identity"],
  ];
}

export function useUpsertAdminStaff() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: async (input: {
      id?: string;
      name: string;
      email: string;
      roleId: string;
      previousRoleId?: string;
      coachId?: string | null;
      previousCoachId?: string | null;
    }) => {
      const { id, coachId, previousCoachId, previousRoleId, ...staffInput } = input;
      const createsCoach = coachId === NEW_COACH_PROFILE;
      if (!id) {
        return createStaff(apiFetchBrowser, {
          ...staffInput,
          coachId: createsCoach ? null : coachId,
          newCoach: createsCoach ? { name: staffInput.name } : null,
        });
      }

      let staff = (await patchStaff(apiFetchBrowser, id, staffInput)).staff;
      // A Coach role needs the teaching link before assignment. When removing
      // that link, assign the replacement role first so the API invariant holds.
      if (!coachId && previousCoachId && staffInput.roleId !== previousRoleId) {
        staff = (await assignRole(apiFetchBrowser, id, staffInput.roleId)).staff;
      }
      if (!coachId && previousCoachId) {
        staff = (await unlinkCoach(apiFetchBrowser, id)).staff;
      } else if (createsCoach) {
        // The coach profile is created already linked; refresh the staff row afterwards.
        if (previousCoachId) staff = (await unlinkCoach(apiFetchBrowser, id)).staff;
        const { coach } = await createCoach(apiFetchBrowser, {
          staffId: id,
          name: staffInput.name,
          specialties: [],
          shortBio: "",
          photoKey: null,
          active: true,
        });
        staff = { ...staff, coachId: coach.id, isCoach: true };
      } else if (coachId && coachId !== previousCoachId) {
        staff = (await linkCoach(apiFetchBrowser, id, coachId)).staff;
      }
      if (staffInput.roleId !== previousRoleId && (coachId || !previousCoachId)) {
        staff = (await assignRole(apiFetchBrowser, id, staffInput.roleId)).staff;
      }
      return { staff, inviteUrl: null };
    },
    // Earlier API calls may have succeeded even if a later step fails.
    onSettled: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

export function useUpsertAdminStaffRole(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      name: string;
      description?: string;
      permissionKeys: readonly PermissionKey[];
      cloneSourceId?: string | null;
      cloneSourcePermissionKeys?: readonly PermissionKey[];
    }) => {
      const { id, cloneSourceId, cloneSourcePermissionKeys, ...role } = input;
      if (cloneSourceId) {
        const selected = new Set(role.permissionKeys);
        const source = new Set(cloneSourcePermissionKeys);
        if (
          !cloneSourcePermissionKeys ||
          selected.size !== source.size ||
          [...selected].some((key) => !source.has(key))
        ) {
          return createRole(fetcher, role).then((response) => response.role);
        }
        return cloneRole(fetcher, cloneSourceId, {
          name: role.name,
          description: role.description,
        }).then((response) => response.role);
      }
      return id
        ? patchRole(fetcher, id, role).then((response) => response.role)
        : createRole(fetcher, role).then((response) => response.role);
    },
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

export function useArchiveAdminStaffRole(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveRole(fetcher, id).then((response) => response.role),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

export function useDisableAdminStaff(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disableStaff(fetcher, id).then((response) => response.staff),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

/**
 * Invite a new person as staff and create their coach profile in one request
 * (a coach is always one staff member). Returns the private invite link.
 */
export function useInviteCoach() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: (input: {
      name: string;
      email: string;
      roleId: string;
      coach: NewCoachProfileInput;
    }) =>
      createStaff(apiFetchBrowser, {
        name: input.name,
        email: input.email,
        roleId: input.roleId,
        newCoach: input.coach,
      }),
    onSettled: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

/** Link an existing (legacy, unlinked) coach profile to a staff member without one. */
export function useLinkCoachToStaff(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, coachId }: { staffId: string; coachId: string }) =>
      linkCoach(fetcher, staffId, coachId),
    onSettled: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}
