import type { BundleAcquisition, CustomerEntitlement, PublicBundle } from "@balanse/domain";
import {
  BUNDLE_ACQUISITION_STATUS_LABELS,
  entitlementStatusLabel,
  formatPeso,
  formatSessionsRemaining,
} from "@balanse/domain";
import { Badge, FeedbackState } from "@balanse/ui";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">Packages</p>
      <h1 className="font-display mt-2 text-3xl">Your packages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sessions remaining are class credits, not money. Browse published packages to claim or
        request another.
      </p>
      <p className="mt-4">
        <Link className="underline underline-offset-4" href="/packages">
          Browse packages
        </Link>
      </p>

      {pending.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl">Awaiting review</h2>
          <ul className="mt-3 space-y-2">
            {pending.map((row) => (
              <li key={row.id} className="rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{row.bundleName}</span>
                  <Badge appearance="soft" size="sm">
                    {BUNDLE_ACQUISITION_STATUS_LABELS[row.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {formatPeso(row.pricePhp)} · credits activate after studio approval
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-2xl">Owned packages</h2>
        {entitlements.length === 0 ? (
          <FeedbackState id="customer.no-packages" className="mt-4" />
        ) : (
          <ul className="mt-3 space-y-2">
            {entitlements.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/portal/packages/${row.id}`}
                  className="block rounded-xl border border-border p-4 hover:bg-muted/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{row.snapshot.name}</span>
                    <Badge appearance="soft" size="sm">
                      {entitlementStatusLabel(row.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatSessionsRemaining(row.remainingCredits)} of {row.grantedCredits}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {catalogue.length > 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {catalogue.length} published package{catalogue.length === 1 ? "" : "s"} available in the
          studio catalogue.
        </p>
      ) : null}
    </div>
  );
}
