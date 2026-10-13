"use client";

import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Banknote, Check, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { paymentMethodFormDefaultValues } from "./PaymentMethodForm.defaults";
import { type PaymentMethodFormValues, paymentMethodFormSchema } from "./PaymentMethodForm.schema";

type Option = {
  value: PaymentMethod;
  icon: ReactNode;
  tag: string;
  description: string;
};

const SUBMIT_LABELS: Record<PaymentMethod | "", string> = {
  "": "Continue",
  GCASH: "Continue to GCash",
  PAY_AT_COUNTER: "Pay at the front desk",
};

export type PaymentMethodFormContext = "booking" | "package";

export function PaymentMethodForm({
  amountLabel,
  deadlineLabel = null,
  context = "booking",
  submitting = false,
  onSubmit,
}: {
  /** Formatted amount due, e.g. "₱550.00". */
  amountLabel: string;
  /** When the hold ends, e.g. "6:00 PM on Tue, Oct 13, 2026". Null when held until class start. Bookings only. */
  deadlineLabel?: string | null;
  /** What the payment is for. Packages have no hold and activate sessions instead of a spot. */
  context?: PaymentMethodFormContext;
  submitting?: boolean;
  onSubmit: (method: PaymentMethod) => void;
}) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: paymentMethodFormDefaultValues,
  });
  const method = form.watch("method");
  const error = form.formState.errors.method?.message;
  const isPackage = context === "package";
  const payBy = isPackage
    ? ""
    : ` ${deadlineLabel ? `by ${deadlineLabel}` : "before your class starts"}`;

  const options: Option[] = [
    {
      value: "GCASH",
      icon: <Smartphone aria-hidden className="size-5" />,
      tag: "Send proof online",
      description: isPackage
        ? `Send ${amountLabel} by GCash, then upload a screenshot of your receipt. The studio checks it and activates your sessions.`
        : `Send ${amountLabel} by GCash${payBy}, then upload a screenshot of your receipt. The front desk checks it and confirms your spot.`,
    },
    {
      value: "PAY_AT_COUNTER",
      icon: <Banknote aria-hidden className="size-5" />,
      tag: "Pay in person",
      description: isPackage
        ? `Pay ${amountLabel} in cash at the front desk on your next visit. The studio activates your sessions once it records your payment.`
        : `Pay ${amountLabel} in cash at the front desk${payBy}. The front desk confirms your spot when you pay.`,
    },
  ];

  return (
    <form
      noValidate
      aria-labelledby="payment-method-heading"
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) => {
        if (values.method) onSubmit(values.method);
      })}
    >
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Payment method</p>
        <h2 id="payment-method-heading" className="font-display mt-2 text-3xl tracking-[-0.04em]">
          How would you like to pay?
        </h2>
      </div>

      <fieldset
        className="grid gap-3"
        aria-describedby={error ? "payment-method-error" : undefined}
        disabled={submitting}
      >
        <legend className="sr-only">Payment method</legend>
        {options.map((option) => {
          const selected = method === option.value;
          return (
            <label
              key={option.value}
              className="group relative flex cursor-pointer items-start gap-4 rounded-[1.25rem] border border-border bg-card p-5 transition-colors hover:border-foreground/30 has-checked:border-primary has-checked:bg-secondary/60 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-70 sm:p-6"
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                aria-invalid={error ? true : undefined}
                {...form.register("method")}
              />
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-foreground group-has-checked:bg-primary group-has-checked:text-primary-foreground"
              >
                {option.icon}
              </span>
              <span className="grid min-w-0 flex-1 gap-1.5">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-base font-semibold">
                    {PAYMENT_METHOD_LABELS[option.value]}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {option.tag}
                  </span>
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  {option.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-border group-has-checked:border-primary group-has-checked:bg-primary group-has-checked:text-primary-foreground"
              >
                {selected ? <Check className="size-3" /> : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      {error ? (
        <p id="payment-method-error" role="alert" className="-mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" loading={submitting}>
          {submitting ? "Saving" : SUBMIT_LABELS[method ?? ""]}
          {submitting ? null : <ArrowRight aria-hidden className="size-4" />}
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          {isPackage
            ? "Your sessions activate only after the studio checks your payment."
            : "Your booking is confirmed only after the front desk checks your payment."}
        </p>
      </div>
    </form>
  );
}
