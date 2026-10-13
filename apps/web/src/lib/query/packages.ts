import {
  type ApiFetcher,
  getMyPackage,
  getPublicPackage,
  listEligiblePackages,
  listEntitlementRedemptions,
  listMyPackages,
  listPublicPackages,
} from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";

export const publicPackagesQuery = (fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicPackages(),
    queryFn: async () => (await listPublicPackages(fetcher)).items,
  });

export const publicPackageQuery = (slug: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicPackage(slug),
    queryFn: async () => (await getPublicPackage(fetcher, slug)).package,
  });

export const myPackagesQuery = (customerId: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.packages.all(customerId),
    queryFn: () => listMyPackages(fetcher),
  });

export const myEntitlementQuery = (customerId: string, id: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.packages.detail(customerId, id),
    queryFn: async () => (await getMyPackage(fetcher, id)).entitlement,
  });

export const entitlementRedemptionsQuery = (customerId: string, id: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.packages.redemptions(customerId, id),
    queryFn: async () => (await listEntitlementRedemptions(fetcher, id)).items,
  });

export const eligiblePackagesQuery = (customerId: string, sessionId: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.bookings.eligiblePackages(customerId, sessionId),
    queryFn: async () => (await listEligiblePackages(fetcher, sessionId)).items,
  });
