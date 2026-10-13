import { isInteractiveStaffActor, type StaffAuthorizationActor } from "@balanse/domain";
import type { QueryClient } from "@tanstack/react-query";

/** Opaque query-key partition. Never pass a bare `guest|customer|admin` role. */
export type AdminAuthScope = string;

/**
 * Stable, order-independent digest of a permission set. Not cryptographic —
 * just distinct enough that any permission-set change changes the scope
 * (WIRE-0205, #357: "Super Admin → Coach must not reuse cached rates,
 * reports, or other-staff rosters").
 */
function permissionsHash(permissions: readonly string[]): string {
  return [...permissions].sort().join("+");
}

/** `${staffId}:${roleId}:${permissionsHash}` (WIRE-0205) from the real session's actor. */
export function adminAuthScope(actor: StaffAuthorizationActor | null | undefined): AdminAuthScope {
  if (!actor) return "anon:guest";
  if (!isInteractiveStaffActor(actor)) return "anon:revoked";
  return `${actor.staffId}:${actor.roleId}:${permissionsHash(actor.permissions)}`;
}

export function removeAuthorizedAdminCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: ["admin"] });
  queryClient.clear();
}
