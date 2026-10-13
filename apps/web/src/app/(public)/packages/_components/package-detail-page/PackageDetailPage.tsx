"use client";

import type { PublicPackage } from "@balanse/domain";
import { formatPeso } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, Ticket } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { PackageRequestForm } from "./package-request-form/PackageRequestForm";

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
  package: packageDefinition,
  customerId,
  signedIn,
}: {
  package: PublicPackage;
  customerId?: string;
  signedIn: boolean;
}) {
  const free = packageDefinition.pricePhp === 0;
  const actionLabel = signedIn
    ? free
      ? "Claim this package"
      : "Request this package"
    : `Sign in to ${free ? "claim" : "request"}`;

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
                {packageDefinition.name}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/76 sm:text-lg">
                {packageDefinition.summary}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-primary-foreground/15 bg-primary-foreground/10 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/66">
                Your package
              </p>
              <p className="font-display mt-4 text-4xl tracking-[-0.045em]">
                {packageDefinition.sessionCreditCount}{" "}
                {packageDefinition.sessionCreditCount === 1 ? "session" : "sessions"}
              </p>
              <p className="mt-1 text-sm text-primary-foreground/72">
                {free ? "Complimentary" : formatPeso(packageDefinition.pricePhp)}
              </p>
              {signedIn ? (
                <PackageRequestForm
                  customerId={customerId ?? ""}
                  bundleId={packageDefinition.id}
                  free={free}
                  actionLabel={actionLabel}
                />
              ) : (
                <Button
                  nativeButton={false}
                  variant="accent"
                  size="lg"
                  className="mt-7 w-full"
                  render={<Link href={`/login?returnTo=/packages/${packageDefinition.slug}`} />}
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
            {packageDefinition.description}
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
              children: `${packageDefinition.sessionCreditCount} ${packageDefinition.sessionCreditCount === 1 ? "session" : "sessions"}`,
            })}
            {detailTerm({
              icon: CalendarDays,
              label: "Class access",
              children:
                packageDefinition.applicabilityMode === "ALL_ACTIVE_CLASSES"
                  ? "Any active studio class"
                  : "Selected studio classes",
            })}
            {detailTerm({
              icon: Clock3,
              label: "Validity",
              children: packageDefinition.validityDays
                ? `${packageDefinition.validityDays} days after activation`
                : "No expiry",
            })}
          </dl>
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs leading-5 text-muted-foreground">
              {packageDefinition.perCustomerLimit
                ? `Limited to ${packageDefinition.perCustomerLimit} per customer.`
                : "Available while this package is published."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
