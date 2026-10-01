import { REFERRAL_CHANNEL_LABELS } from "@balanse/domain";
import { Badge, cn } from "@balanse/ui";
import { Share2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { CustomerReferralCardProps } from "./CustomerReferralCard.meta";

export type { CustomerReferralCardProps } from "./CustomerReferralCard.meta";

const LINK_CLASS =
  "font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground";

function defaultHref(customerId: string) {
  return `/customers/${customerId}`;
}

export function CustomerReferralCard({
  referral,
  customerHref = defaultHref,
  className,
}: CustomerReferralCardProps) {
  const channel = referral.channel ? REFERRAL_CHANNEL_LABELS[referral.channel] : null;
  const count = referral.referrals.length;

  return (
    <section
      aria-label="Referral"
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <h2 className="font-display text-xl leading-tight">Referral</h2>
        {channel ? (
          <Badge appearance="soft" size="sm" variant="info">
            {channel}
          </Badge>
        ) : null}
      </header>
      <dl className="grid gap-5 p-5 text-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
            <Share2Icon aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Sign-up</dt>
            <dd className="mt-0.5">
              {referral.referredBy ? (
                <>
                  Referred by{" "}
                  <Link className={LINK_CLASS} href={customerHref(referral.referredBy.id)}>
                    {referral.referredBy.fullName}
                  </Link>
                  {channel ? <span className="text-muted-foreground"> · {channel}</span> : null}
                </>
              ) : channel ? (
                <>Joined through {channel.toLowerCase()}</>
              ) : (
                <span className="text-muted-foreground">Not referred</span>
              )}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
            <UsersIcon aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Shared with others</dt>
            <dd className="mt-0.5">
              {count === 0 ? (
                <span className="text-muted-foreground">Hasn't referred anyone yet</span>
              ) : (
                <>
                  <p>
                    Referred <span className="tabular-nums">{count}</span>{" "}
                    {count === 1 ? "person" : "people"}
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {referral.referrals.map((person) => (
                      <li key={person.id}>
                        <Link className={LINK_CLASS} href={customerHref(person.id)}>
                          {person.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
