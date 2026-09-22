"use client";

import {
  hasAnyPermission,
  hasPermission,
  type PermissionKey,
  type StaffAuthorizationActor,
} from "@balanse/domain";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function useStaffActor(): StaffAuthorizationActor | null {
  const { actor } = useMockPrincipal();
  return actor;
}

export function useHasPermission(key: PermissionKey): boolean {
  const actor = useStaffActor();
  return hasPermission(actor, key);
}

export function useHasAnyPermission(keys: readonly PermissionKey[]): boolean {
  const actor = useStaffActor();
  return hasAnyPermission(actor, keys);
}
