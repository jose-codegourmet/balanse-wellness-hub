"use client";

import type { CustomerBooking } from "@balanse/domain";
import { formatPeso, formatSessionDate, sessionDisplayName } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { LocalizedSkeleton } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";
import { CancellationForm } from "./cancellation-form/CancellationForm";

export function CancellationRequest({
  booking,
  forcedStatus,
}: {
  booking: CustomerBooking;
  forcedStatus?: "submitting" | "success" | "failed";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "failed">(
    forcedStatus ?? "idle",
  );

  if (status === "submitting") {
    return <LocalizedSkeleton lines={4} label="Submitting cancellation request" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-display text-3xl">Request cancellation</h1>
      <p className="text-sm">
        {sessionDisplayName(booking.session)} · {formatSessionDate(booking.session.startsAt)} ·{" "}
        {formatPeso(booking.session.pricePhp)}
      </p>
      <p className="text-sm">
        This is a request. The studio reviews it manually. Any applicable refund is also manual.
        Submitting does not free the slot and does not mean money has been returned.
      </p>

      {status === "failed" ? (
        <p role="alert" className="text-sm text-destructive">
          The mock request could not be saved. Try again.
        </p>
      ) : null}
      {status === "success" ? (
        <p role="status" className="text-sm">
          Cancellation requested. Your slot stays held until the studio completes the request.
        </p>
      ) : null}

      <CancellationForm
        submitting={false}
        onSubmit={(reason) => {
          setStatus("submitting");
          void getMockAdapter()
            .createCancellationRequest(booking.id, reason || undefined)
            .then(() => {
              setStatus("success");
              notify.portal("cancellation.submitted");
              router.push(`/portal/bookings/${booking.id}`);
            })
            .catch(() => {
              setStatus("failed");
              notify.portal("cancellation.failed");
            });
        }}
      />
    </div>
  );
}
