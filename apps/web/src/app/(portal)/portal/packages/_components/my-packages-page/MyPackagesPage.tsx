import type { BundleAcquisition, CustomerEntitlement, PublicBundle } from "@balanse/domain";
import {
  BUNDLE_ACQUISITION_STATUS_LABELS,
  entitlementStatusLabel,
  formatPeso,
  formatSessionsRemaining,
} from "@balanse/domain";
import { Badge, FeedbackState } from "@balanse/ui";
import { ArrowUpRight, CircleAlert, Clock3, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";

export function MyPackagesPage({
  entitlements,
  acquisitions,
  catalogue,
}: {
  entitlements: CustomerEntitlement[];
  acquisitions: BundleAcquisition[];
  catalogue: PublicBundle[];
}) {
  const pending = acquisitions.filter(
    (row) => row.status === "PENDING_REVIEW" || row.status === "PENDING_PAYMENT",
  );
  const active = entitlements.filter((row) => row.status === "ACTIVE");
  const remaining = active.reduce((total, row) => total + row.remainingCredits, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <section className="overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="p-7 sm:p-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
              <Sparkles aria-hidden className="size-3.5" />
              Your practice
            </div>
            <h1 className="font-display mt-5 text-4xl tracking-[-0.05em] sm:text-5xl">
              Your sessions, ready when you are.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/74 sm:text-base">
              Packages keep your sessions in one clear place. They are class credits, never a cash
              balance.
            </p>
            <Link
              href="/packages"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground transition hover:text-[var(--balanse-gold)]"
            >
              Browse packages
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="flex min-h-56 flex-col justify-end border-t border-primary-foreground/15 bg-primary-foreground/10 p-7 sm:p-10 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/64">
              Ready to reserve
            </p>
            <p className="font-display mt-3 text-6xl tracking-[-0.06em]">{remaining}</p>
            <p className="mt-1 text-sm text-primary-foreground/74">
              {remaining === 1 ? "session remaining" : "sessions remaining"}
            </p>
          </div>
        </div>
      </section>

      {pending.length > 0 ? (
        <section
          className="mt-10 rounded-[1.5rem] border border-[color-mix(in_oklab,var(--balanse-gold)_55%,var(--border))] bg-[color-mix(in_oklab,var(--balanse-gold)_14%,var(--card))] p-6 sm:p-8"
          aria-labelledby="pending-packages-heading"
        >
          <div className="flex flex-wrap items-start gap-4">
            <CircleAlert
              aria-hidden
              className="mt-1 size-5 shrink-0 text-[var(--balanse-gold-deep)]"
            />
            <div>
              <h2
                id="pending-packages-heading"
                className="font-display text-2xl tracking-[-0.035em]"
              >
                Action in progress
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Your package will appear in your available sessions once the studio finishes its
                review.
              </p>
            </div>
          </div>
          <ul className="mt-6 grid gap-3">
            {pending.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border/80 bg-card/80 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{row.bundleName}</span>
                  <Badge appearance="soft" size="sm">
                    {BUNDLE_ACQUISITION_STATUS_LABELS[row.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {formatPeso(row.pricePhp)}. Credits activate after studio approval.
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14" aria-labelledby="owned-packages-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Use what you have</p>
            <h2
              id="owned-packages-heading"
              className="font-display mt-2 text-4xl tracking-[-0.045em]"
            >
              Your packages
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            See what is ready to use, held for a booking, or saved in your history.
          </p>
        </div>
        {entitlements.length === 0 ? (
          <FeedbackState id="customer.no-packages" className="mt-4" />
        ) : (
          <ul className="mt-7 grid gap-4 lg:grid-cols-2">
            {entitlements.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/portal/packages/${row.id}`}
                  className="group block min-h-full rounded-[1.35rem] border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_42px_color-mix(in_oklab,var(--balanse-navy)_12%,transparent)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      <Ticket aria-hidden className="size-4" /> Package
                    </span>
                    <Badge appearance="soft" size="sm">
                      {entitlementStatusLabel(row.status)}
                    </Badge>
                  </div>
                  <div className="mt-9 flex items-end justify-between gap-5">
                    <div>
                      <h3 className="font-display text-3xl tracking-[-0.04em]">
                        {row.snapshot.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatSessionsRemaining(row.remainingCredits)} of {row.grantedCredits}{" "}
                        granted
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="mb-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                  <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    <Clock3 aria-hidden className="size-3.5" />
                    {row.expiresAt
                      ? "View validity and redemption history"
                      : "No expiry. View redemption history"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {catalogue.length > 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {catalogue.length} published package{catalogue.length === 1 ? "" : "s"} available in the
          studio catalogue.
        </p>
      ) : null}
    </div>
  );
}
