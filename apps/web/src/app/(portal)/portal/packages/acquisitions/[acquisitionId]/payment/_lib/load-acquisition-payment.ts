import { listMyPackages, listPublicPackages } from "@balanse/api-client";
import type { HttpBundleAcquisition } from "@balanse/domain";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";

/** What the payment screens show about the requested package. */
export type AcquisitionPackageSummary = {
  name: string;
  /** Null when the package is no longer in the public catalogue. */
  sessionCreditCount: number | null;
  validityDays: number | null;
  pricePhp: number;
};

export type AcquisitionPaymentState =
  | {
      kind: "open";
      customerId: string;
      acquisition: HttpBundleAcquisition;
      summary: AcquisitionPackageSummary;
    }
  | { kind: "approved"; entitlementId: string; name: string }
  | { kind: "closed" };

/**
 * Resolves a paid package request for the signed-in customer. Approved requests
 * point at the new package; rejected, cancelled, or unknown ones are "closed".
 */
export async function loadAcquisitionPayment(
  acquisitionId: string,
): Promise<AcquisitionPaymentState> {
  const [profile, token] = await Promise.all([getCurrentCustomer(), getCustomerAccessToken()]);
  if (!profile) notFound();
  const fetcher = serverFetcher(token);
  const [packages, catalogue] = await Promise.all([
    listMyPackages(fetcher).catch(() => null),
    listPublicPackages(fetcher).catch(() => null),
  ]);
  const approved = packages?.items.find((item) => item.acquisition?.id === acquisitionId);
  if (approved) return { kind: "approved", entitlementId: approved.id, name: approved.name };
  const acquisition = packages?.pendingAcquisitions.find((item) => item.id === acquisitionId);
  if (!acquisition) return { kind: "closed" };
  const bundle = catalogue?.items.find((item) => item.id === acquisition.bundleId);
  return {
    kind: "open",
    customerId: profile.id,
    acquisition,
    summary: {
      name: bundle?.name ?? "Session package",
      sessionCreditCount: bundle?.sessionCreditCount ?? null,
      validityDays: bundle?.validityDays ?? null,
      pricePhp: acquisition.payment?.amountPhp ?? bundle?.pricePhp ?? 0,
    },
  };
}
