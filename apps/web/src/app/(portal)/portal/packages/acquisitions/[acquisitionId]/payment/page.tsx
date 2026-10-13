import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcquisitionPaymentEndState } from "./_components/acquisition-payment-end-state/AcquisitionPaymentEndState";
import { AcquisitionPaymentPage } from "./_components/acquisition-payment-page/AcquisitionPaymentPage";
import { loadAcquisitionPayment } from "./_lib/load-acquisition-payment";

export const metadata: Metadata = {
  title: "Package payment",
  description: "Choose how to pay for a Balansé session package.",
};

export default async function Page({ params }: { params: Promise<{ acquisitionId: string }> }) {
  const { acquisitionId } = await params;
  const state = await loadAcquisitionPayment(acquisitionId);
  if (state.kind !== "open") return <AcquisitionPaymentEndState {...state} />;
  // A submitted receipt is waiting for review; show that step instead of the method choice.
  if (state.acquisition.status === "PENDING_REVIEW") {
    redirect(`/portal/packages/acquisitions/${acquisitionId}/payment/gcash`);
  }
  return (
    <AcquisitionPaymentPage
      customerId={state.customerId}
      acquisition={state.acquisition}
      summary={state.summary}
    />
  );
}
