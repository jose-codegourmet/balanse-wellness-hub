"use client";

import {
  approvePackageAcquisition,
  createAdminBundle,
  grantCustomerPackage,
  type PackageInput,
  patchAdminBundle,
  rejectPackageAcquisition,
  revokeCustomerPackage,
  setAdminBundleStatus,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function bundleKeys(role: AdminAuthScope): QueryKey[] {
  return [adminKeys.bundles.all(role), adminKeys.customers.all(role)];
}

type UpsertBundleInput = PackageInput & { id?: string };

export function useUpsertAdminBundle() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertBundleInput) =>
      id
        ? patchAdminBundle(apiFetchBrowser, id, input).then((result) => result.bundle)
        : createAdminBundle(apiFetchBrowser, input).then((result) => result.bundle),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useSetAdminBundleStatus() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) =>
      setAdminBundleStatus(apiFetchBrowser, id, status).then((result) => result.bundle),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useGrantCustomerBundle() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      customerId: string;
      bundleId: string;
      adminNote: string;
      overrideLimit: boolean;
      overrideReason?: string;
    }) => grantCustomerPackage(apiFetchBrowser, input.customerId, input),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useRevokeCustomerEntitlement() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { entitlementId: string; reason: string }) =>
      revokeCustomerPackage(apiFetchBrowser, input.entitlementId, input.reason),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useApproveBundleAcquisition() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePackageAcquisition(apiFetchBrowser, id),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useRejectBundleAcquisition() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectPackageAcquisition(apiFetchBrowser, id, reason),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}
