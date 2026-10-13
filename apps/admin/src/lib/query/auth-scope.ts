import { isInteractiveStaffActor, type StaffAuthorizationActor } from "@balanse/domain";
import type { QueryClient } from "@tanstack/react-query";

/** Opaque query-key partition. Never pass a bare `guest|customer|admin` role. */
export type AdminAuthScope = string;

/**
 * Short, stable, order-independent fingerprint of a permission set (32-bit
 * FNV-1a, base 36). Any permission change produces a new scope, so cached
 * rates, reports, or other-staff rosters are never reused after a role change
 * (WIRE-0205, #357). Not a security boundary: the API re-checks every request.
 * Pure and synchronous so the server prefetch and the browser compute the
 * same key.
 */
function permissionsHash(permissions: readonly string[]): string {
  const input = [...permissions].sort().join("+");
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
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
