import { Button } from "@balanse/ui";
import { CircleX, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function AcquisitionPaymentEndState(
  props: { kind: "approved"; entitlementId: string; name: string } | { kind: "closed" },
) {
  const approved = props.kind === "approved";
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      <section className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {approved ? (
            <ShieldCheck aria-hidden className="size-3.5" />
          ) : (
            <CircleX aria-hidden className="size-3.5" />
          )}
          {approved ? "Approved" : "Request closed"}
        </p>
        <h1 className="font-display mt-4 text-4xl tracking-[-0.05em]">
          {approved ? "You’re all set." : "This package request is no longer open."}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {approved
            ? `The studio approved your payment. ${props.name} is ready to use on eligible classes.`
            : "It may have been declined or cancelled by the studio, so there's nothing to pay here. Your packages page shows anything still in progress."}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {approved ? (
            <Button
              nativeButton={false}
              render={<Link href={`/portal/packages/${props.entitlementId}`} />}
            >
              View package
            </Button>
          ) : (
            <>
              <Button nativeButton={false} render={<Link href="/portal/packages" />}>
                My packages
              </Button>
              <Button variant="ghost" nativeButton={false} render={<Link href="/packages" />}>
                Browse packages
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
