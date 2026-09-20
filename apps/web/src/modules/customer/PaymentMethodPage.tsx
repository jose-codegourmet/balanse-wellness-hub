"use client";

import type { CustomerBooking, PaymentMethod } from "@balanse/domain";
import { formatHoldDeadline, isHoldExpired } from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import { Button, FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";

export function PaymentMethodPage({
  booking,
  forcedExpired,
  forcedStatus,
}: {
  booking: CustomerBooking;
  forcedExpired?: boolean;
  forcedStatus?: "submitting";
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );
  const expired =
    forcedExpired ||
    booking.status === "EXPIRED" ||
    isHoldExpired(booking.holdExpiresAt, booking.session.startsAt, MOCK_NOW_ISO);

  if (status === "submitting") {
    return <LocalizedSkeleton lines={4} label="Saving payment method" />;
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <FeedbackState
          id="customer.reservation-expired"
          onAction={() => router.push("/portal/schedule")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">Payment</h1>
      <p className="text-sm font-medium">
        {booking.holdExpiresAt
          ? formatHoldDeadline(booking.holdExpiresAt, booking.session.startsAt)
          : "Reservation held until class start"}
      </p>
      <p className="text-sm text-muted-foreground">
        Hold length is developer-configured. There is no control here to change it.
      </p>

      <fieldset className="grid gap-3">
        <legend className="sr-only">Payment method</legend>
        <label className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm">
          <input
            type="radio"
            name="payment-method"
            value="GCASH"
            checked={method === "GCASH"}
            onChange={() => setMethod("GCASH")}
          />
          GCash
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm">
          <input
            type="radio"
            name="payment-method"
            value="PAY_AT_COUNTER"
            checked={method === "PAY_AT_COUNTER"}
            onChange={() => setMethod("PAY_AT_COUNTER")}
          />
          Pay at Counter
        </label>
      </fieldset>

      <Button
        type="button"
        disabled={!method}
        onClick={() => {
          if (!method) return;
          setStatus("submitting");
          void getMockAdapter()
            .setPaymentMethod(booking.id, method)
            .then(() => {
              if (method === "GCASH") {
                notify.portal("payment.gcash-selected");
                router.push(`/portal/bookings/${booking.id}/payment/gcash`);
                return;
              }
              notify.portal("payment.counter-selected");
              router.push(`/portal/bookings/${booking.id}`);
            });
        }}
      >
        Continue
      </Button>
    </div>
  );
}
