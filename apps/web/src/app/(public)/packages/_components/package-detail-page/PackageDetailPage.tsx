"use client";

import type { PublicBundle } from "@balanse/domain";
import { formatPeso } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button } from "@balanse/ui";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { notify } from "@/modules/notifications/notify";

function detailTerm({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--balanse-gold-deep)]" />
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-medium leading-6">{children}</dd>
      </div>
    </div>
  );
}

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
  const actionLabel = signedIn
    ? free
      ? "Claim this package"
      : "Request this package"
    : `Sign in to ${free ? "claim" : "request"}`;

  const claim = () => {
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
  };

  return (
    <div className="pb-16 lg:pb-24">
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/72 transition hover:text-primary-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            All packages
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/66">
                {free ? "Welcome package" : "Focused practice package"}
              </p>
              <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                {bundle.name}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/76 sm:text-lg">
                {bundle.summary}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-primary-foreground/15 bg-primary-foreground/10 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/66">
                Your package
              </p>
              <p className="font-display mt-4 text-4xl tracking-[-0.045em]">
                {bundle.sessionCredits} {bundle.sessionCredits === 1 ? "session" : "sessions"}
              </p>
              <p className="mt-1 text-sm text-primary-foreground/72">
                {free ? "Complimentary" : formatPeso(bundle.pricePhp)}
              </p>
              {signedIn ? (
                <Button
                  className="mt-7 w-full rounded-full bg-[var(--balanse-gold)] text-[var(--balanse-navy)] hover:bg-[var(--balanse-beige)]"
                  disabled={status === "working"}
                  onClick={claim}
                >
                  {status === "working" ? "Preparing your package" : actionLabel}
                  <ArrowUpRight aria-hidden className="size-4" />
                </Button>
              ) : (
                <Button
                  nativeButton={false}
                  className="mt-7 w-full rounded-full bg-[var(--balanse-gold)] text-[var(--balanse-navy)] hover:bg-[var(--balanse-beige)]"
                  render={<Link href={`/login?returnTo=/packages/${bundle.slug}`} />}
                >
                  {actionLabel}
                  <ArrowUpRight aria-hidden className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:px-8 lg:pt-20">
        <article className="max-w-2xl">
          <p className="text-sm font-semibold text-muted-foreground">About this package</p>
          <div className="prose prose-sm mt-5 max-w-none text-base leading-8 text-foreground prose-p:leading-8 prose-strong:text-foreground">
            {bundle.description}
          </div>

          <div className="mt-12 rounded-[1.5rem] bg-secondary/55 p-6 sm:p-8">
            <h2 className="font-display text-3xl tracking-[-0.04em]">A few good things to know</h2>
            <ul className="mt-6 grid gap-4 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-3">
                <Check
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
                />
                Your sessions are used only when you reserve an eligible class.
              </li>
              <li className="flex gap-3">
                <Check
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
                />
                Capacity, cutoffs, and studio confirmation still protect every class.
              </li>
              <li className="flex gap-3">
                <Check
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-[var(--balanse-gold-deep)]"
                />
                A waitlist intention never spends or holds a session.
              </li>
            </ul>
          </div>
        </article>

        <aside className="h-fit rounded-[1.5rem] border border-border bg-card p-6 lg:sticky lg:top-8">
          <h2 className="font-display text-2xl tracking-[-0.035em]">Package details</h2>
          <dl className="mt-7 grid gap-6">
            {detailTerm({
              icon: Ticket,
              label: "Sessions",
              children: `${bundle.sessionCredits} ${bundle.sessionCredits === 1 ? "session" : "sessions"}`,
            })}
            {detailTerm({
              icon: CalendarDays,
              label: "Class access",
              children: bundle.applicability.allActiveClasses
                ? "Any active studio class"
                : "Selected studio classes",
            })}
            {detailTerm({
              icon: Clock3,
              label: "Validity",
              children: bundle.validityDays
                ? `${bundle.validityDays} days after activation`
                : "No expiry",
            })}
          </dl>
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs leading-5 text-muted-foreground">
              {bundle.perCustomerLimit
                ? `Limited to ${bundle.perCustomerLimit} per customer.`
                : "Available while this package is published."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
