"use client";

import {
  hasPermission,
  type PermissionKey,
  SETTINGS_SECTION_PERMISSIONS,
  type SettingsSection,
} from "@balanse/domain";
import type { ReactNode } from "react";
import {
  canAccessAdminHref,
  canPerformAdminAction,
  classifyStaffActor,
  visibleAdminNavItems,
} from "@/lib/authorization/admin-access";
import { useStaffSession } from "@/modules/session/SessionProvider";

export function useStaffActor() {
  return useStaffSession().actor;
}

export function useAdminAccessKind() {
  const { role, actor } = useStaffSession();
  return classifyStaffActor(actor, { role });
}

export function useHasPermission(key: PermissionKey): boolean {
  return hasPermission(useStaffActor(), key);
}

export function useCanAdminRoute(href: string): boolean {
  return canAccessAdminHref(useStaffActor(), href);
}

export function useCanAdminAction(actionId: string): boolean {
  return canPerformAdminAction(useStaffActor(), actionId);
}

export function usePermittedAdminNavItems() {
  return visibleAdminNavItems(useStaffActor());
}

export function useCanSettingsSection(section: SettingsSection): boolean {
  return hasPermission(useStaffActor(), SETTINGS_SECTION_PERMISSIONS[section]);
}

export function AdminCan({
  action,
  href,
  children,
}: {
  action?: string;
  href?: string;
  children: ReactNode;
}) {
  const actor = useStaffActor();
  const allowed =
    (action ? canPerformAdminAction(actor, action) : true) &&
    (href ? canAccessAdminHref(actor, href) : true);
  if (!allowed) return null;
  return children;
}
