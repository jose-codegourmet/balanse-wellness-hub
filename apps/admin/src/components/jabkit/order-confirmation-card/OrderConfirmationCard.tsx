"use client";

import { CheckCircle2 } from "lucide-react";
import { useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { orderConfirmationCardMocks } from "./OrderConfirmationCard.mocks";
import type {
  OrderConfirmationCardProps,
  OrderConfirmationDetail,
} from "./OrderConfirmationCard.types";

const defaults = orderConfirmationCardMocks.default;

const enter =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-500 motion-safe:fill-mode-both motion-reduce:animate-none";

const rise =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both motion-reduce:animate-none";

function defaultDetails({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  orderIdLabel,
  paymentMethodLabel,
  dateTimeLabel,
  totalLabel,
}: {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  orderIdLabel: string;
  paymentMethodLabel: string;
  dateTimeLabel: string;
  totalLabel: string;
}): OrderConfirmationDetail[] {
  return [
    { label: orderIdLabel, value: orderId },
    { label: paymentMethodLabel, value: paymentMethod },
    { label: dateTimeLabel, value: dateTime },
    { label: totalLabel, value: totalAmount, emphasize: true },
  ];
}

export function OrderConfirmationCard({
  className,
  title = defaults.title,
  orderId = defaults.orderId,
  paymentMethod = defaults.paymentMethod,
  dateTime = defaults.dateTime,
  totalAmount = defaults.totalAmount,
  orderIdLabel = defaults.orderIdLabel,
  paymentMethodLabel = defaults.paymentMethodLabel,
  dateTimeLabel = defaults.dateTimeLabel,
  totalLabel = defaults.totalLabel,
  details,
  buttonText = defaults.buttonText,
  accountHref = defaults.accountHref,
  onGoToAccount,
  icon,
  ...props
}: OrderConfirmationCardProps) {
  const headingId = useId();
  const rows =
    details ??
    defaultDetails({
      orderId: orderId ?? "",
      paymentMethod: paymentMethod ?? "",
      dateTime: dateTime ?? "",
      totalAmount: totalAmount ?? "",
      orderIdLabel: orderIdLabel ?? "Order ID",
      paymentMethodLabel: paymentMethodLabel ?? "Payment Method",
      dateTimeLabel: dateTimeLabel ?? "Date & Time",
      totalLabel: totalLabel ?? "Total",
    });

  const actionClassName = cn(
    "inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-medium text-primary-foreground shadow-none",
    "transition-[transform,background-color,filter] duration-200 ease-out hover:brightness-110 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
  );

  return (
    <section
      aria-labelledby={headingId}
      aria-live="polite"
      className={cn(
        "flex w-full items-center justify-center bg-background px-4 py-16 text-foreground sm:py-24",
        className,
      )}
      data-slot="order-confirmation-card"
      {...props}
    >
      <article
        className={cn(
          "w-full max-w-sm rounded-[2rem] border border-border bg-card p-6 text-card-foreground shadow-[0_24px_48px_-28px_color-mix(in_oklab,var(--jk-foreground),transparent_72%)] sm:p-8",
          enter,
        )}
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <span
            aria-hidden="true"
            className={cn("text-success", rise, "motion-safe:delay-75")}
          >
            {icon ?? <CheckCircle2 className="size-12" strokeWidth={1.75} />}
          </span>

          <h2
            className={cn(
              "max-w-[16ch] text-2xl font-semibold tracking-tight text-balance",
              rise,
              "motion-safe:delay-150",
            )}
            id={headingId}
          >
            {title}
          </h2>

          <dl
            className={cn(
              "w-full space-y-4 pt-4 text-left",
              rise,
              "motion-safe:delay-200",
            )}
          >
            {rows.map((row, index) => {
              const last = index === rows.length - 1;
              const strong = Boolean(row.emphasize);
              return (
                <div
                  className={cn(
                    "flex items-center justify-between gap-4 border-border pb-4 text-sm",
                    last ? "border-0 pb-0" : "border-b",
                    strong
                      ? "font-bold text-card-foreground"
                      : "text-muted-foreground",
                  )}
                  key={`${row.label}-${row.value}`}
                >
                  <dt className="shrink-0">{row.label}</dt>
                  <dd
                    className={cn(
                      "min-w-0 text-right",
                      strong && "text-lg tabular-nums",
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              );
            })}
          </dl>

          {buttonText && (accountHref || onGoToAccount) ? (
            <div className={cn("w-full pt-4", rise, "motion-safe:delay-300")}>
              {accountHref ? (
                <a
                  className={actionClassName}
                  href={accountHref}
                  onClick={onGoToAccount}
                >
                  {buttonText}
                </a>
              ) : (
                <button
                  className={actionClassName}
                  onClick={onGoToAccount}
                  type="button"
                >
                  {buttonText}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
