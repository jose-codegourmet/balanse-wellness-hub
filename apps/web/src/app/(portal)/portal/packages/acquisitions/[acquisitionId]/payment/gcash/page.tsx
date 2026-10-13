import { getFormPolicies, getPaymentInstructions } from "@balanse/api-client";
import type { PolicyDocumentVersion } from "@balanse/domain";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCustomerAccessToken } from "@/modules/session/current-customer";
import { AcquisitionPaymentEndState } from "../_components/acquisition-payment-end-state/AcquisitionPaymentEndState";
import { loadAcquisitionPayment } from "../_lib/load-acquisition-payment";
import { AcquisitionGcashWizard } from "./_components/acquisition-gcash-wizard/AcquisitionGcashWizard";

export const metadata: Metadata = {
  title: "Pay with GCash",
  description: "Send a GCash payment and upload the receipt for a Balansé session package.",
};

export default async function Page({ params }: { params: Promise<{ acquisitionId: string }> }) {
  const { acquisitionId } = await params;
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [state, instructions, policies] = await Promise.all([
    loadAcquisitionPayment(acquisitionId),
    // A failure here is shown inside the wizard; it must not hide the request.
    getPaymentInstructions(fetcher).catch(() => null),
    getFormPolicies(fetcher, "payment_proof")
      .then(({ items }) =>
        items.map(
          (item): PolicyDocumentVersion => ({
            id: item.id,
            documentName: item.documentName,
            version: item.version,
            promotedAt: "",
            current: true,
            body: item.body,
          }),
        ),
      )
      .catch((): PolicyDocumentVersion[] => []),
  ]);
  if (state.kind !== "open") return <AcquisitionPaymentEndState {...state} />;
  return (
    <AcquisitionGcashWizard
      customerId={state.customerId}
      acquisition={state.acquisition}
      summary={state.summary}
      instructions={instructions}
      policies={policies}
    />
  );
}
