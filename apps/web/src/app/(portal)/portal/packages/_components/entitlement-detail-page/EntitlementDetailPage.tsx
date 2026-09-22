import type { BundleRedemption, CustomerEntitlement } from "@balanse/domain";
import {
  entitlementStatusLabel,
  formatPeso,
  formatSessionDate,
  redemptionStatusLabel,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  Clock3,
  RotateCcw,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export function EntitlementDetailPage({
  entitlement,
  redemptions,
}: {
  entitlement: CustomerEntitlement;
  redemptions: BundleRedemption[];
}) {
  const statusIcon = (status: BundleRedemption["status"]) => {
    if (status === "RESTORED") return <RotateCcw aria-hidden className="size-4" />;
    if (status === "HELD") return <Clock3 aria-hidden className="size-4" />;
    return <CircleCheck aria-hidden className="size-4" />;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        href="/portal/packages"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All packages
      </Link>

      <section className="mt-7 overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/66">
                <Ticket aria-hidden className="size-3.5" /> Package details
              </span>
              <Badge appearance="soft">{entitlementStatusLabel(entitlement.status)}</Badge>
            </div>
            <h1 className="font-display mt-6 text-4xl tracking-[-0.05em] sm:text-5xl">
              {entitlement.snapshot.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/74">
              {entitlement.status === "ACTIVE"
                ? "Your sessions are ready whenever an eligible studio class feels right."
                : "This package remains here as part of your personal practice history."}
            </p>
          </div>
          <div className="flex min-h-56 flex-col justify-end border-t border-primary-foreground/15 bg-primary-foreground/10 p-7 sm:p-10 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/64">
              Available now
            </p>
            <p className="font-display mt-3 text-6xl tracking-[-0.06em]">
              {entitlement.remainingCredits}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/74">
              {entitlement.remainingCredits === 1 ? "session remaining" : "sessions remaining"}
            </p>
            {entitlement.status === "ACTIVE" ? (
              <Link
                href="/portal/schedule"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--balanse-gold)] transition hover:text-primary-foreground"
              >
                Find a class
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Package totals"
      >
        {[
          ["Held", entitlement.heldCredits, "Reserved for a booking"],
          ["Used", entitlement.consumedCredits, "Completed class sessions"],
          ["Restored", entitlement.restoredCredits, "Returned to package history"],
          ["Granted", entitlement.grantedCredits, "Sessions included at acquisition"],
        ].map(([label, value, detail]) => (
          <div key={label as string} className="rounded-[1.25rem] border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </p>
            <p className="font-display mt-4 text-4xl tracking-[-0.045em]">{value}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="package-history-heading">
          <p className="text-sm font-semibold text-muted-foreground">Your activity</p>
          <h2
            id="package-history-heading"
            className="font-display mt-2 text-4xl tracking-[-0.045em]"
          >
            Session history
          </h2>
          {redemptions.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              No sessions have used this package yet.
            </p>
          ) : (
            <ul className="mt-7 grid gap-3 text-sm">
              {redemptions.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-4 rounded-[1.25rem] border border-border bg-card p-5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                    {statusIcon(row.status)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="font-medium">{redemptionStatusLabel(row.status)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatSessionDate(row.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {row.status === "HELD"
                        ? "One session is held while this booking is resolved."
                        : row.status === "RESTORED"
                          ? "This session returned to your package history."
                          : "One session was used for this booking."}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-border bg-secondary/45 p-6 lg:sticky lg:top-8">
          <CalendarDays aria-hidden className="size-5 text-[var(--balanse-gold-deep)]" />
          <h2 className="font-display mt-5 text-2xl tracking-[-0.035em]">Package terms</h2>
          <dl className="mt-6 grid gap-5 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Price at acquisition
              </dt>
              <dd className="mt-1 font-medium">{formatPeso(entitlement.snapshot.pricePhp)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Expiry
              </dt>
              <dd className="mt-1 font-medium">
                {entitlement.expiresAt ? formatSessionDate(entitlement.expiresAt) : "No expiry"}
              </dd>
            </div>
          </dl>
          <p className="mt-7 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            Restored sessions remain in your history. An expired package stays unavailable even if a
            session is restored later.
          </p>
        </aside>
      </div>
    </div>
  );
}
