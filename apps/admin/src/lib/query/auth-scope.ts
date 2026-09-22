import type { StaffAuthorizationActor } from "@balanse/domain";
import { mockStaffAuthorizationFingerprint } from "@balanse/mock";
import {
  bindMockPrincipal,
  type MockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { QueryClient } from "@tanstack/react-query";
import { firstImplementedPermittedAdminRoute } from "@/lib/authorization/admin-access";

/** Opaque query-key partition. Never pass a bare `guest|customer|admin` role. */
export type AdminAuthScope = string;

export function adminAuthScope(principal: MockPrincipal): AdminAuthScope {
  if (principal.role !== "admin") return `anon:${principal.role}`;
  if (!principal.staffId) return "staff:unknown:unresolved";
  return mockStaffAuthorizationFingerprint(principal.staffId);
}

export function bindAdminQueryPrincipal(principal: MockPrincipal): MockPrincipal {
  return bindMockPrincipal(principal);
}

export function removeAuthorizedAdminCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: ["admin"] });
  queryClient.clear();
}

export function allowedAdminRouteForPrincipal(
  principal: MockPrincipal,
  fallback = "/login",
): string {
  const actor = resolveMockStaffActor(principal);
  return firstImplementedPermittedAdminRoute(actor, fallback) ?? fallback;
}

export type ResolveAllowedAdminRoute = (
  actor: StaffAuthorizationActor | null,
  fallback?: string | null,
) => string | null;
