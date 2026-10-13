"use client";

import {
  hasAnyPermission,
  hasPermission,
  type PermissionKey,
  type StaffAuthorizationActor,
} from "@balanse/domain";
import { useStaffSession } from "@/modules/session/SessionProvider";

export function useStaffActor(): StaffAuthorizationActor | null {
  const { actor } = useStaffSession();
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
