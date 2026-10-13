import type {
  AdminBundle,
  BundleStatus,
  HttpBundleAcquisition,
  HttpBundleRedemption,
  HttpCustomerEntitlement,
  PaymentMethod,
  PublicPackage,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type PackageInput = {
  name: string;
  slug?: string;
  summary: string;
  description: string;
  sessionCreditCount: number;
  pricePhp: number;
  applicabilityMode: "ALL_ACTIVE_CLASSES" | "EXPLICIT_CLASSES";
  classIds: string[];
  validityDays: number | null;
  perCustomerLimit: number | null;
};

export type GrantPackageInput = {
  bundleId: string;
  adminNote: string;
  overrideLimit: boolean;
  overrideReason?: string;
  idempotencyKey?: string;
};

export const listPublicPackages = (fetcher: ApiFetcher) =>
  fetcher<{ items: PublicPackage[] }>("/api/public/packages");

export const getPublicPackage = (fetcher: ApiFetcher, slug: string) =>
  fetcher<{ package: PublicPackage }>(`/api/public/packages/${encodeURIComponent(slug)}`);

export const listMyPackages = (fetcher: ApiFetcher) =>
  fetcher<{ items: HttpCustomerEntitlement[]; pendingAcquisitions: HttpBundleAcquisition[] }>(
    "/api/me/packages",
  );

export const getMyPackage = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ entitlement: HttpCustomerEntitlement }>(`/api/me/packages/${id}`);

export const listEntitlementRedemptions = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ items: HttpBundleRedemption[] }>(`/api/me/packages/${id}/redemptions`);

export const listEligiblePackages = (fetcher: ApiFetcher, sessionId: string) =>
  fetcher<{ items: HttpCustomerEntitlement[]; sessionId: string }>(
    `/api/sessions/${sessionId}/eligible-packages`,
  );

export const claimPackage = (fetcher: ApiFetcher, bundleId: string, idempotencyKey: string) =>
  fetcher<{
    acquisition: HttpBundleAcquisition;
    entitlement: HttpCustomerEntitlement | null;
    replayed: boolean;
  }>(`/api/packages/${bundleId}/claim`, {
    method: "POST",
    body: { idempotencyKey },
    headers: { "idempotency-key": idempotencyKey },
  });

export const requestPackage = (fetcher: ApiFetcher, bundleId: string, idempotencyKey: string) =>
  fetcher<{ acquisition: HttpBundleAcquisition; replayed: boolean }>(
    `/api/packages/${bundleId}/acquisitions`,
    {
      method: "POST",
      body: { idempotencyKey },
      headers: { "idempotency-key": idempotencyKey },
    },
  );

export const setAcquisitionPaymentMethod = (
  fetcher: ApiFetcher,
  acquisitionId: string,
  method: Extract<PaymentMethod, "GCASH" | "PAY_AT_COUNTER">,
) =>
  fetcher<{ acquisition: HttpBundleAcquisition }>(
    `/api/packages/acquisitions/${acquisitionId}/payment-method`,
    { method: "POST", body: { method } },
  );

export const submitAcquisitionPaymentProof = (
  fetcher: ApiFetcher,
  acquisitionId: string,
  objectKey: string,
) =>
  fetcher<{ acquisition: HttpBundleAcquisition }>(
    `/api/packages/acquisitions/${acquisitionId}/payment-proof`,
    { method: "POST", body: { objectKey } },
  );

export const mintAcquisitionPaymentProof = (
  fetcher: ApiFetcher,
  acquisitionId: string,
  contentType: string,
  byteSize: number,
) =>
  fetcher<{ upload: { signedUrl: string; path: string }; maxBytes: number }>(
    `/api/packages/acquisitions/${acquisitionId}/payment-proof`,
    { method: "POST", body: { contentType, byteSize } },
  );

export const listAdminBundles = (fetcher: ApiFetcher, status?: BundleStatus) => {
  const suffix = status ? `?status=${status}` : "";
  return fetcher<{ items: AdminBundle[] }>(`/api/admin/bundles${suffix}`);
};

export const getAdminBundle = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ bundle: AdminBundle }>(`/api/admin/bundles/${id}`);

export const createAdminBundle = (fetcher: ApiFetcher, input: PackageInput) =>
  fetcher<{ bundle: AdminBundle }>("/api/admin/bundles", { method: "POST", body: input });

export const patchAdminBundle = (fetcher: ApiFetcher, id: string, input: Partial<PackageInput>) =>
  fetcher<{ bundle: AdminBundle }>(`/api/admin/bundles/${id}`, { method: "PATCH", body: input });

export const setAdminBundleStatus = (fetcher: ApiFetcher, id: string, status: BundleStatus) => {
  const action =
    status === "PUBLISHED" ? "publish" : status === "ARCHIVED" ? "archive" : "unpublish";
  return fetcher<{ bundle: AdminBundle }>(`/api/admin/bundles/${id}/${action}`, { method: "POST" });
};

export const grantCustomerPackage = (
  fetcher: ApiFetcher,
  customerId: string,
  input: GrantPackageInput,
) =>
  fetcher<{
    acquisition: HttpBundleAcquisition;
    entitlement: HttpCustomerEntitlement | null;
    replayed: boolean;
  }>(`/api/admin/customers/${customerId}/packages/grant`, { method: "POST", body: input });

export const revokeCustomerPackage = (fetcher: ApiFetcher, entitlementId: string, reason: string) =>
  fetcher<{ entitlement: HttpCustomerEntitlement }>(`/api/admin/packages/${entitlementId}/revoke`, {
    method: "POST",
    body: { reason },
  });

export const listAdminPackageAcquisitions = (fetcher: ApiFetcher, status?: string) =>
  fetcher<{ items: HttpBundleAcquisition[] }>(
    `/api/admin/package-acquisitions${status ? `?status=${encodeURIComponent(status)}` : ""}`,
  );

export const approvePackageAcquisition = (fetcher: ApiFetcher, id: string) =>
  fetcher<{
    acquisition: HttpBundleAcquisition;
    entitlement: HttpCustomerEntitlement;
    replayed: boolean;
  }>(`/api/admin/package-acquisitions/${id}/approve`, { method: "POST" });

export const rejectPackageAcquisition = (fetcher: ApiFetcher, id: string, reason: string) =>
  fetcher<{ acquisition: HttpBundleAcquisition }>(`/api/admin/package-acquisitions/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
