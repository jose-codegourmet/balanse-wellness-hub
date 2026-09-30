"use client";

import type { CustomerBooking } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Alert, AlertDescription, AlertTitle, Button, LocalizedSkeleton } from "@balanse/ui";
import { CircleAlert, Hourglass, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookingSummary } from "@/components/balanse/portal/BookingSummary";
import "@/components/balanse/portal/portal-booking.css";
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
    <main className="portal-page portal-cancellation">
      <header className="portal-page-head">
        <p className="portal-eyebrow">Booking confirmation</p>
        <h1 className="font-display">Request a cancellation</h1>
        <p className="portal-page-lead">
          Review this booking before you submit. The studio reviews each request manually; your
          place remains held while it does.
        </p>
      </header>

      <div className="cancellation-layout">
        <aside className="cancellation-booking" aria-labelledby="cancellation-booking-title">
          <div className="portal-section-title">
            <h2 id="cancellation-booking-title">The booking you&apos;re changing</h2>
          </div>
          <BookingSummary booking={booking} eyebrow="Current reservation" headingLevel={3} />
        </aside>

        <section className="cancellation-review" aria-labelledby="cancellation-review-title">
          <div className="cancellation-review-head">
            <p className="portal-eyebrow">Before you submit</p>
            <h2 id="cancellation-review-title" className="font-display">
              What happens next
            </h2>
          </div>

          <ul className="cancellation-consequences">
            <li>
              <Hourglass aria-hidden="true" />
              <span>
                <strong>The studio reviews the request</strong>
                <span>Submitting does not cancel the booking immediately.</span>
              </span>
            </li>
            <li>
              <CircleAlert aria-hidden="true" />
              <span>
                <strong>Your place stays held</strong>
                <span>The slot is released only if the studio completes the cancellation.</span>
              </span>
            </li>
            <li>
              <Wallet aria-hidden="true" />
              <span>
                <strong>Refunds are handled separately</strong>
                <span>
                  An approved cancellation does not mean a refund has already been returned.
                </span>
              </span>
            </li>
          </ul>

          {status === "failed" ? (
            <Alert className="booking-advisory" data-advisory="instruction" role="alert">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>We couldn&apos;t save your request</AlertTitle>
              <AlertDescription>Check your connection and try again.</AlertDescription>
            </Alert>
          ) : null}
          {status === "success" ? (
            <Alert className="booking-advisory" data-advisory="held" role="status">
              <Hourglass aria-hidden="true" />
              <AlertTitle>Cancellation requested</AlertTitle>
              <AlertDescription>
                Your slot stays held until the studio completes the request.
              </AlertDescription>
            </Alert>
          ) : null}

          {status !== "success" ? (
            <CancellationForm
              backHref={`/portal/bookings/${booking.id}`}
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
          ) : (
            <Button nativeButton={false} render={<Link href={`/portal/bookings/${booking.id}`} />}>
              Return to booking
            </Button>
          )}
        </section>
      </div>
    </main>
  );
}
