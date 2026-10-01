import { Button } from "@balanse/ui";
import { ArrowUpRight, PartyPopper } from "lucide-react";
import Link from "next/link";
import { isPublicShareReturn } from "../../../_lib/return-to";
import type { OnboardingStepDoneProps } from "./OnboardingStepDone.meta";

export function OnboardingStepDone({
  displayName,
  returnTo,
  returnLabel,
  headingRef,
}: OnboardingStepDoneProps) {
  const backToShared = isPublicShareReturn(returnTo);
  const primaryHref = backToShared ? returnTo : "/book/calendar";
  const primaryLabel = backToShared
    ? `Back to ${returnLabel ?? (returnTo.startsWith("/events/") ? "the event" : "the class")}`
    : "Browse the schedule";

  return (
    <div className="grid justify-items-start gap-5 py-4">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
        <PartyPopper className="size-5" aria-hidden="true" />
      </span>
      <div className="grid gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl tracking-tight outline-none"
        >
          You’re all set, {displayName}!
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Thanks for sharing. You can change any of this later in your profile under About you.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href={primaryHref} />}>
          {primaryLabel} <ArrowUpRight className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/portal" />}>
          Go to my portal
        </Button>
      </div>
    </div>
  );
}
