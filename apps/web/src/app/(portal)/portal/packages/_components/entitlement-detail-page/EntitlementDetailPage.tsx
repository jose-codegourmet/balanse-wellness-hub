import type { BundleRedemption, CustomerEntitlement } from "@balanse/domain";
import {
  entitlementStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionsRemaining,
  redemptionStatusLabel,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import Link from "next/link";

export function EntitlementDetailPage({
  entitlement,
  redemptions,
}: {
  entitlement: CustomerEntitlement;
  redemptions: BundleRedemption[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">Package</p>
      <h1 className="font-display mt-2 text-3xl">{entitlement.snapshot.name}</h1>
      <div className="mt-3">
        <Badge appearance="soft">{entitlementStatusLabel(entitlement.status)}</Badge>
      </div>
      <dl className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Sessions remaining</dt>
          <dd>{formatSessionsRemaining(entitlement.remainingCredits)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Held</dt>
          <dd>{entitlement.heldCredits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Used</dt>
          <dd>{entitlement.consumedCredits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Restored</dt>
          <dd>{entitlement.restoredCredits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Granted</dt>
          <dd>{entitlement.grantedCredits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Price at acquisition</dt>
          <dd>{formatPeso(entitlement.snapshot.pricePhp)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Expires</dt>
          <dd>{entitlement.expiresAt ? formatSessionDate(entitlement.expiresAt) : "No expiry"}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">
        Restored sessions return to history. An expired package stays unusable even if a credit is
        restored later.
      </p>
      <h2 className="font-display mt-8 text-2xl">Redemption history</h2>
      {redemptions.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No sessions have used this package yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {redemptions.map((row) => (
            <li key={row.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{redemptionStatusLabel(row.status)}</span>
                <span className="text-muted-foreground">{formatSessionDate(row.createdAt)}</span>
              </div>
              <p className="mt-1 text-muted-foreground">Booking {row.bookingId}</p>
            </li>
          ))}
        </ul>
      )}
      <Link
        className="mt-8 inline-flex text-sm underline underline-offset-4"
        href="/portal/packages"
      >
        Back to packages
      </Link>
    </div>
  );
}
