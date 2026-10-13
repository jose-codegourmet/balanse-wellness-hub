"use client";

import type { HttpBundleAcquisition, PaymentMethod } from "@balanse/domain";
import { formatPeso } from "@balanse/domain";
import { ArrowLeft, CalendarRange, Info, Ticket, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaymentMethodForm } from "@/components/balanse/payment/payment-method-form/PaymentMethodForm";
import { useAcquisitionPaymentMethod } from "@/lib/query/mutations/packages";
import { notify } from "@/modules/notifications/notify";
import type { AcquisitionPackageSummary } from "../../_lib/load-acquisition-payment";
import { sessionsLabel, validityLabel } from "../../_lib/summary-labels";

export function AcquisitionPaymentPage({
  customerId,
  acquisition,
  summary,
  forcedStatus,
}: {
  customerId: string;
  acquisition: HttpBundleAcquisition;
  summary: AcquisitionPackageSummary;
  /** Storybook only. */
  forcedStatus?: "submitting";
}) {
  const router = useRouter();
  const saveMethod = useAcquisitionPaymentMethod(customerId, acquisition.id);
  const [submitting, setSubmitting] = useState(forcedStatus === "submitting");
  const amount = formatPeso(summary.pricePhp);
  const sessions = sessionsLabel(summary);
  const paymentHref = `/portal/packages/acquisitions/${acquisition.id}/payment`;

  const choose = async (method: PaymentMethod) => {
    setSubmitting(true);
    try {
      await saveMethod.mutateAsync(method);
    } catch {
      notify.portal("payment.method-failed");
      setSubmitting(false);
      return;
    }
    if (method === "GCASH") {
      notify.portal("payment.gcash-selected");
      router.push(`${paymentHref}/gcash`);
      return;
    }
    notify.portal("package.counter-selected");
    router.push("/portal/packages");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <Link
        href="/portal/packages"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        Back to my packages
      </Link>

      <section className="mt-5 overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
              <Wallet aria-hidden className="size-3.5" />
              Complete your package request
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-4xl tracking-[-0.05em] sm:text-5xl">
              {summary.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/74 sm:text-base">
              Pay by GCash or at the front desk. Once the studio checks your payment, your sessions
              appear in your packages.
            </p>
          </div>
          <dl className="grid content-end gap-5 border-t border-primary-foreground/15 bg-primary-foreground/10 p-7 text-sm sm:p-10 lg:border-l lg:border-t-0">
            {sessions ? (
              <div>
                <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                  <Ticket aria-hidden className="size-3.5" /> Sessions
                </dt>
                <dd className="mt-2 font-medium">{sessions}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                <CalendarRange aria-hidden className="size-3.5" /> Valid for
              </dt>
              <dd className="mt-2 font-medium">{validityLabel(summary)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/62">
                Amount due
              </dt>
              <dd className="font-display mt-1 text-3xl tracking-[-0.03em]">{amount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <PaymentMethodForm
          context="package"
          amountLabel={amount}
          submitting={submitting}
          onSubmit={(method) => void choose(method)}
        />

        <aside
          aria-labelledby="package-next-heading"
          className="grid gap-6 rounded-[1.5rem] border border-border bg-card p-6 lg:sticky lg:top-24"
        >
          <div>
            <p
              id="package-next-heading"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
            >
              <Info aria-hidden className="size-3.5" />
              No rush
            </p>
            <p className="font-display mt-3 text-3xl tracking-[-0.04em]">Your request stays open</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing is reserved or held, so you can pay whenever you’re ready.
            </p>
          </div>
          <p className="border-l-2 border-[var(--balanse-gold)] pl-4 text-xs leading-5 text-muted-foreground">
            {summary.validityDays
              ? "The validity countdown starts when the studio activates your sessions, not today."
              : "Your sessions don't expire once they're active."}
          </p>
          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              What happens next
            </p>
            <ol className="mt-4 grid gap-4 text-sm">
              {[
                "Choose GCash or cash.",
                "Upload your GCash receipt, or pay at the front desk.",
                "The studio checks it and activates your sessions.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold"
                  >
                    {index + 1}
                  </span>
                  <span className="leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
