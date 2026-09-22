"use client";

import type { PublicBundle } from "@balanse/domain";
import { formatPeso, formatSessionsRemaining } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";

export function PackageDetailPage({
  bundle,
  customerId,
  signedIn,
}: {
  bundle: PublicBundle;
  customerId?: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const free = bundle.pricePhp === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">Package</p>
      <h1 className="font-display mt-2 text-4xl">{bundle.name}</h1>
      <p className="mt-3 text-muted-foreground">{bundle.summary}</p>
      <dl className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Sessions</dt>
          <dd>{formatSessionsRemaining(bundle.sessionCredits)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Price</dt>
          <dd>{formatPeso(bundle.pricePhp)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Classes</dt>
          <dd>
            {bundle.applicability.allActiveClasses ? "All active classes" : "Selected classes only"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Validity</dt>
          <dd>
            {bundle.validityDays ? `${bundle.validityDays} days after you receive it` : "No expiry"}
          </dd>
        </div>
      </dl>
      <div className="prose prose-sm mt-6 max-w-none text-sm text-muted-foreground">
        {bundle.description}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        A package does not skip capacity, cutoff, waitlist, or studio confirmation. Sessions
        remaining are not a cash balance.
      </p>
      {!signedIn ? (
        <Button
          nativeButton={false}
          className="mt-8"
          render={<Link href={`/login?returnTo=/packages/${bundle.slug}`} />}
        >
          Sign in to {free ? "claim" : "request"}
        </Button>
      ) : (
        <Button
          className="mt-8"
          disabled={status === "working"}
          onClick={() => {
            if (!customerId) return;
            setStatus("working");
            const adapter = getMockAdapter();
            const request = free
              ? adapter.claimFreeBundle({ customerId, bundleId: bundle.id })
              : adapter.requestPaidBundle({ customerId, bundleId: bundle.id });
            void request
              .then(() => {
                notify.portal(free ? "package.claimed" : "package.requested");
                router.push("/portal/packages");
              })
              .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : "";
                notify.portal(
                  message.includes("already") ? "package.limit-reached" : "package.action-failed",
                );
                setStatus("idle");
              });
          }}
        >
          {free ? "Claim this package" : "Request this package"}
        </Button>
      )}
    </div>
  );
}
