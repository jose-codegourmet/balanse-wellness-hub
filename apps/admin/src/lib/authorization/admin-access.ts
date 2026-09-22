import {
  ADMIN_ACTION_ACCESS,
  ADMIN_LANDING_PATHS,
  actorSatisfiesRequirement,
  firstPermittedAdminRoute,
  isInteractiveStaffActor,
  matchAdminRouteAccess,
  permittedAdminNavItems,
  type StaffAuthorizationActor,
} from "@balanse/domain";
import type { MockPrincipal } from "@balanse/mock/session";

export function adminPathname(href: string): string {
  const [path] = href.split("?");
  return path || "/";
}

export function firstImplementedPermittedAdminRoute(
  actor: StaffAuthorizationActor | null | undefined,
  fallback: string | null = null,
): string | null {
  for (const href of ADMIN_LANDING_PATHS) {
    const requirement = matchAdminRouteAccess(href);
    if (requirement && actorSatisfiesRequirement(actor, requirement)) return href;
  }
  return firstPermittedAdminRoute(actor, fallback);
}

export function visibleAdminNavItems(actor: StaffAuthorizationActor | null | undefined) {
  return permittedAdminNavItems(actor).filter((item) => {
    if (item.id !== "staff") return true;
    return canAccessAdminHref(actor, "/staff");
  });
}

export function canAccessAdminHref(
  actor: StaffAuthorizationActor | null | undefined,
  href: string,
): boolean {
  const pathname = adminPathname(href);
  const requirement = matchAdminRouteAccess(pathname);
  if (!requirement) return false;
  return actorSatisfiesRequirement(actor, requirement);
}

export function canPerformAdminAction(
  actor: StaffAuthorizationActor | null | undefined,
  actionId: string,
): boolean {
  const requirement = ADMIN_ACTION_ACCESS.find((item) => item.id === `action:${actionId}`);
  if (!requirement) return false;
  return actorSatisfiesRequirement(actor, requirement);
}

export type AdminShellAccessKind = "ok" | "unauthenticated" | "forbidden" | "revoked" | "denied";

export function classifyAdminPrincipal(principal: MockPrincipal): AdminShellAccessKind {
  if (principal.role === "guest") return "unauthenticated";
  if (principal.role === "customer") return "forbidden";
  return "ok";
}

export function classifyStaffActor(
  actor: StaffAuthorizationActor | null | undefined,
  principal: MockPrincipal,
): AdminShellAccessKind {
  const principalKind = classifyAdminPrincipal(principal);
  if (principalKind !== "ok") return principalKind;
  if (!actor) return "forbidden";
  if (actor.staffStatus !== "active" || !actor.roleActive) return "revoked";
  if (!isInteractiveStaffActor(actor)) return "revoked";
  return "ok";
}

export function resolveAdminShellDestination(
  actor: StaffAuthorizationActor | null | undefined,
  principal: MockPrincipal,
  fallback = "/login",
): string {
  if (principal.role === "guest") return "/login";
  if (principal.role === "customer") return "/dashboard";
  if (classifyStaffActor(actor, principal) === "revoked") return "/dashboard";
  return firstImplementedPermittedAdminRoute(actor, fallback) ?? fallback;
}

export function resolvePermittedReturnTo(
  actor: StaffAuthorizationActor | null | undefined,
  returnTo: string | null | undefined,
  fallback: string,
): string {
  if (!returnTo) return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  return canAccessAdminHref(actor, returnTo) ? returnTo : fallback;
}
