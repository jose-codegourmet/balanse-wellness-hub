import { getFormPolicies, listMyPackages } from "@balanse/api-client";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { AcquisitionPaymentForm } from "./_components/acquisition-payment-form/AcquisitionPaymentForm";

export default async function Page({ params }: { params: Promise<{ acquisitionId: string }> }) {
  const [{ acquisitionId }, profile, token] = await Promise.all([
    params,
    getCurrentCustomer(),
    getCustomerAccessToken(),
  ]);
  if (!profile) notFound();
  const fetcher = serverFetcher(token);
  const [packages, policies] = await Promise.all([
    listMyPackages(fetcher).catch(() => null),
    getFormPolicies(fetcher, "payment_proof")
      .then(({ items }) =>
        items.map((item) => ({
          id: item.id,
          documentName: item.documentName,
          version: item.version,
          promotedAt: "",
          current: true,
          body: item.body,
        })),
      )
      .catch(() => []),
  ]);
  const acquisition = packages?.pendingAcquisitions.find((item) => item.id === acquisitionId);
  if (!acquisition) notFound();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold text-muted-foreground">Package payment</p>
      <h1 className="font-display mt-2 text-4xl">Complete your request</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Your sessions activate only after the studio reviews this payment.
      </p>
      <AcquisitionPaymentForm
        customerId={profile.id}
        acquisition={acquisition}
        policies={policies}
      />
    </main>
  );
}
