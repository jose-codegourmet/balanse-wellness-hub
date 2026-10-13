"use client";

import type {
  HttpBundleAcquisition,
  PaymentInstructions,
  PolicyDocumentVersion,
} from "@balanse/domain";
import { BUNDLE_ACQUISITION_STATUS_LABELS, formatPeso } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { ArrowLeft, Hourglass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GcashPayStep } from "@/components/balanse/payment/gcash-pay-step/GcashPayStep";
import { PaymentProofForm } from "@/components/balanse/payment/payment-proof-form/PaymentProofForm";
import {
  type PaymentStep,
  PaymentStepper,
} from "@/components/balanse/payment/payment-stepper/PaymentStepper";
import {
  useAcquisitionPaymentMethod,
  useSubmitAcquisitionProof,
} from "@/lib/query/mutations/packages";
import { useAcceptPolicies } from "@/lib/query/policies";
import { notify } from "@/modules/notifications/notify";
import type { AcquisitionPackageSummary } from "../../../_lib/load-acquisition-payment";
import { sessionsLabel, validityLabel } from "../../../_lib/summary-labels";

export type AcquisitionGcashStep = "pay" | "upload" | "review";

const STEPS: PaymentStep<AcquisitionGcashStep>[] = [
  { id: "pay", label: "Send payment" },
  { id: "upload", label: "Upload receipt" },
  { id: "review", label: "Studio activates" },
];

function initialStep(acquisition: HttpBundleAcquisition): AcquisitionGcashStep {
  if (
    acquisition.status === "PENDING_REVIEW" ||
    acquisition.payment?.status === "PROOF_SUBMITTED"
  ) {
    return "review";
  }
  return "pay";
}

export function AcquisitionGcashWizard({
  customerId,
  acquisition,
  summary,
  instructions,
  policies = [],
  forcedStep,
}: {
  customerId: string;
  acquisition: HttpBundleAcquisition;
  summary: AcquisitionPackageSummary;
  /** Null when payment details could not be loaded. */
  instructions: PaymentInstructions | null;
  /** Current versions of the policies attached to the payment_proof form. */
  policies?: PolicyDocumentVersion[];
  /** Storybook only. */
  forcedStep?: AcquisitionGcashStep;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(acquisition);
  const [step, setStep] = useState<AcquisitionGcashStep>(forcedStep ?? initialStep(acquisition));
  const [submitting, setSubmitting] = useState(false);
  const setMethod = useAcquisitionPaymentMethod(customerId, acquisition.id);
  const submitProof = useSubmitAcquisitionProof(customerId, acquisition.id);
  const acceptPolicies = useAcceptPolicies(customerId);
  const amount = formatPeso(summary.pricePhp);
  const sessions = sessionsLabel(summary);
  const paymentHref = `/portal/packages/acquisitions/${acquisition.id}/payment`;

  const submit = (file: File, acceptedPolicyVersionIds: string[]) => {
    setSubmitting(true);
    void (async () => {
      // The proof endpoint needs GCash as the method, e.g. after opening this page directly.
      if (current.payment?.method !== "GCASH") await setMethod.mutateAsync("GCASH");
      const result = await submitProof.mutateAsync(file);
      if (acceptedPolicyVersionIds.length > 0) {
        await acceptPolicies.mutateAsync({
          form: "payment_proof",
          policyVersionIds: acceptedPolicyVersionIds,
          acquisitionId: acquisition.id,
        });
      }
      setCurrent(result.acquisition);
      setStep("review");
      notify.portal("package.proof-submitted");
      router.refresh();
    })()
      .catch(() => notify.portal("payment.proof-failed"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <Link
        href={step === "review" ? "/portal/packages" : paymentHref}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        {step === "review" ? "Back to my packages" : "Change payment method"}
      </Link>

      <header className="mt-5 grid gap-5 rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
            Pay with GCash
          </p>
          <h1 className="font-display mt-3 text-3xl tracking-[-0.05em] sm:text-4xl">
            {summary.name}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/74">
            {sessions ? `${sessions} · ` : ""}
            {summary.validityDays ? `Valid ${validityLabel(summary)}` : validityLabel(summary)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
            Amount due
          </p>
          <p className="font-display mt-1 text-3xl tracking-[-0.03em]">{amount}</p>
        </div>
      </header>

      <div className="mt-8">
        <PaymentStepper steps={STEPS} current={step} />
      </div>

      <section className="mt-8 min-w-0 rounded-[1.5rem] border border-border bg-card p-5 sm:p-8">
        {step === "pay" ? (
          <GcashPayStep
            instructions={instructions}
            amountLabel={amount}
            counterHref={paymentHref}
            onSent={() => setStep("upload")}
          />
        ) : null}

        {step === "upload" ? (
          <PaymentProofForm
            amountLabel={amount}
            policies={policies}
            submitting={submitting}
            onBack={() => setStep("pay")}
            onSubmit={submit}
          />
        ) : null}

        {step === "review" ? (
          <div className="grid gap-6">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-secondary"
            >
              <Hourglass className="size-5" />
            </span>
            <div role="status">
              <h2 className="font-display text-3xl tracking-[-0.04em]">
                Receipt sent. The studio is checking it.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your request shows{" "}
                <strong className="font-semibold text-foreground">
                  {BUNDLE_ACQUISITION_STATUS_LABELS[current.status]}
                </strong>{" "}
                until they approve it. Your sessions appear in your packages once approved. You can
                close this page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 max-sm:[&>*]:w-full">
              <Button size="lg" nativeButton={false} render={<Link href="/portal/packages" />}>
                My packages
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep("upload")}>
                Upload a different screenshot
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
