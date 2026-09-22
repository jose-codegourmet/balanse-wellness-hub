"use client";

import {
  type MockPrincipal,
  type MockStaffIdentityId,
  mockPrincipalForStaff,
  normalizeMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { resolveAdminShellDestination } from "@/lib/authorization/admin-access";
import { type ResolveAllowedAdminRoute, removeAuthorizedAdminCache } from "@/lib/query/auth-scope";
import { useMockPrincipal } from "./MockSessionProvider";

export function useSwitchAuthorizedIdentity(resolveAllowedRoute?: ResolveAllowedAdminRoute) {
  const { principal, setPrincipal } = useMockPrincipal();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(
    (next: Partial<MockPrincipal>, options?: { navigate?: boolean }) => {
      const merged = normalizeMockPrincipal({ ...principal, ...next });
      const identityChanged =
        merged.role !== principal.role || merged.staffId !== principal.staffId;
      removeAuthorizedAdminCache(queryClient);
      setPrincipal(merged);
      if (options?.navigate === false || !identityChanged) {
        router.refresh();
        return;
      }
      const actor = resolveMockStaffActor(merged);
      const href = resolveAllowedRoute
        ? (resolveAllowedRoute(actor, "/login") ?? "/login")
        : resolveAdminShellDestination(actor, merged, "/login");
      router.replace(href);
      router.refresh();
    },
    [principal, queryClient, resolveAllowedRoute, router, setPrincipal],
  );
}

export function useSwitchMockStaffIdentity(resolveAllowedRoute?: ResolveAllowedAdminRoute) {
  const switchIdentity = useSwitchAuthorizedIdentity(resolveAllowedRoute);
  return useCallback(
    (staffId: MockStaffIdentityId) => {
      switchIdentity(mockPrincipalForStaff(staffId));
    },
    [switchIdentity],
  );
}
