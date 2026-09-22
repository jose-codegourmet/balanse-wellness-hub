import type { PublicBundle } from "@balanse/domain";
import { formatPeso, formatSessionsRemaining } from "@balanse/domain";
import { FeedbackState } from "@balanse/ui";
import Link from "next/link";

export function PackagesPage({ bundles }: { bundles: PublicBundle[] }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">Packages</p>
      <h1 className="font-display mt-2 text-4xl">Start with a set of sessions</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A package is a fixed number of class sessions. It is not cash, a membership, or store
        credit. Capacity, cutoff, and studio confirmation still apply.
      </p>
      {bundles.length === 0 ? (
        <FeedbackState id="public.no-packages" className="mt-10" />
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {bundles.map((bundle) => (
            <li key={bundle.id}>
              <Link
                href={`/packages/${bundle.slug}`}
                className="block rounded-2xl border border-border p-6 hover:bg-muted/40"
              >
                <h2 className="font-display text-2xl">{bundle.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{bundle.summary}</p>
                <p className="mt-4 text-sm">
                  {formatSessionsRemaining(bundle.sessionCredits)} · {formatPeso(bundle.pricePhp)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
