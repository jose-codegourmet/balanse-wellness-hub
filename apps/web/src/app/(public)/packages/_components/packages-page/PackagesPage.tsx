import type { PublicBundle } from "@balanse/domain";
import { formatPeso } from "@balanse/domain";
import { FeedbackState } from "@balanse/ui";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";

function renderPackageTerms(bundle: PublicBundle) {
  return (
    <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border text-sm">
      <div className="bg-card p-4">
        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Included
        </span>
        <span className="mt-1 block font-medium">
          {bundle.sessionCredits} {bundle.sessionCredits === 1 ? "session" : "sessions"}
        </span>
      </div>
      <div className="bg-card p-4">
        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Investment
        </span>
        <span className="mt-1 block font-medium">
          {bundle.pricePhp === 0 ? "Complimentary" : formatPeso(bundle.pricePhp)}
        </span>
      </div>
    </div>
  );
}

export function PackagesPage({ bundles }: { bundles: PublicBundle[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <section className="grid overflow-hidden rounded-[2rem] bg-primary text-primary-foreground shadow-[0_24px_65px_color-mix(in_oklab,var(--balanse-navy)_24%,transparent)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex min-h-[29rem] flex-col justify-between p-7 sm:p-10 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Studio packages
            </div>
            <h1 className="font-display mt-6 max-w-xl text-5xl leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              More room to move.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-primary-foreground/76 sm:text-base">
              Choose a set of class sessions that supports the practice you want to build, at your
              own pace.
            </p>
          </div>
          <p className="max-w-md text-xs leading-5 text-primary-foreground/62">
            Packages are session credits, not cash or a membership. Studio capacity, booking
            cutoffs, and confirmation still apply.
          </p>
        </div>
        <div className="relative isolate min-h-[20rem] overflow-hidden border-t border-primary-foreground/15 bg-[radial-gradient(circle_at_68%_22%,color-mix(in_oklab,var(--balanse-gold)_86%,transparent),transparent_28%),radial-gradient(circle_at_23%_80%,color-mix(in_oklab,var(--balanse-beige)_26%,transparent),transparent_38%),linear-gradient(135deg,color-mix(in_oklab,var(--balanse-navy)_88%,black),var(--balanse-navy))] lg:border-l lg:border-t-0">
          <div className="absolute -right-10 top-8 size-72 rounded-full border border-primary-foreground/20" />
          <div className="absolute right-12 top-20 size-40 rounded-full border border-primary-foreground/30" />
          <div className="absolute bottom-9 left-8 right-8 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-6 backdrop-blur-sm sm:left-12 sm:right-12">
            <p className="text-xs uppercase tracking-[0.14em] text-primary-foreground/66">
              Start where you are
            </p>
            <p className="font-display mt-3 max-w-xs text-3xl leading-tight tracking-[-0.04em]">
              Small commitments make space for a lasting practice.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 lg:mt-24" aria-labelledby="package-catalogue-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-muted-foreground">Find your rhythm</p>
          <h2
            id="package-catalogue-heading"
            className="font-display mt-3 text-4xl tracking-[-0.045em] sm:text-5xl"
          >
            Choose the sessions that fit your season.
          </h2>
        </div>

        {bundles.length === 0 ? (
          <FeedbackState id="public.no-packages" className="mt-10" />
        ) : (
          <ul className="mt-10 grid gap-5 lg:grid-cols-2">
            {bundles.map((bundle, index) => (
              <li key={bundle.id}>
                <Link
                  href={`/packages/${bundle.slug}`}
                  className={`group relative block min-h-full overflow-hidden rounded-[1.5rem] border border-border p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_45px_color-mix(in_oklab,var(--balanse-navy)_12%,transparent)] sm:p-8 ${
                    index === 0 ? "bg-secondary/55" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-4" />
                      {bundle.applicability.allActiveClasses
                        ? "All studio classes"
                        : "Selected classes"}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                  <h3 className="font-display mt-10 text-3xl tracking-[-0.04em] sm:text-4xl">
                    {bundle.name}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    {bundle.summary}
                  </p>
                  {renderPackageTerms(bundle)}
                  <p className="mt-5 text-xs leading-5 text-muted-foreground">
                    {bundle.validityDays
                      ? `Use within ${bundle.validityDays} days after activation.`
                      : "No expiry is attached to this package."}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
