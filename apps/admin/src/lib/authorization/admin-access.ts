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

/**
 * Role discriminator shared with the real session (WIRE-0202, #357) and the
 * Storybook `MockPrincipal` decorator — both have a `role` field of this
 * shape, so either can be passed here without a fixture package import.
 */
export type AdminSessionPrincipal = { role: "guest" | "customer" | "admin" };

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
  return permittedAdminNavItems(actor).flatMap((item) => {
    if (item.id !== "staff") return [item];
    if (canAccessAdminHref(actor, "/staff")) return [item];
    if (canAccessAdminHref(actor, "/staff/roles")) {
      return [{ ...item, label: "Roles", href: "/staff/roles" }];
    }
    return [];
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

export function classifyAdminPrincipal(principal: AdminSessionPrincipal): AdminShellAccessKind {
  if (principal.role === "guest") return "unauthenticated";
  if (principal.role === "customer") return "forbidden";
  return "ok";
}

export function classifyStaffActor(
  actor: StaffAuthorizationActor | null | undefined,
  principal: AdminSessionPrincipal,
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
  principal: AdminSessionPrincipal,
  fallback = "/login",
): string {
  if (principal.role === "guest") return "/login";
  if (principal.role === "customer") return "/dashboard";
  if (classifyStaffActor(actor, principal) === "revoked") return "/dashboard";
  return firstImplementedPermittedAdminRoute(actor, fallback) ?? fallback;
}
