"use client";

import { FAQ_GROUPS, filterFaqs, flattenFaqs } from "@balanse/domain";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle, Input, ScrollReveal } from "@balanse/ui";
import { useMemo, useState } from "react";
import { BalanseCtaSection } from "@/components/balanse/marketing/BalanseCtaSection";
import { BalanseFaqSection } from "@/components/balanse/marketing/BalanseFaqSection";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";

export function FaqsPage({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const items = useMemo(() => filterFaqs(query), [query]);
  const itemIds = new Set(items.map((item) => item.id));
  const visibleGroups = FAQ_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => itemIds.has(item.id)),
  })).filter((group) => group.items.length > 0);

  return (
    <article>
      <BalanseHero
        assetId="faqs-a"
        eyebrow="Before you book"
        titleLines={["Questions, answered."]}
        primaryAction={{ label: "View the schedule", href: "/#schedule" }}
        secondaryAction={{ label: "Contact the studio", href: "/contact" }}
        align="compact"
      />

      {/* Matches the Jabkit faq12 container so the field lines up with the rail. */}
      <ScrollReveal>
        <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 md:pt-16 lg:px-10">
          <label className="block text-sm font-medium" htmlFor="faq-search">
            Search
          </label>
          <Input
            id="faq-search"
            type="search"
            value={query}
            className="mt-2 max-w-md"
            placeholder="Search questions"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </ScrollReveal>

      {visibleGroups.length === 0 ? (
        <ScrollReveal>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
            <Empty className="border border-dashed border-border bg-card">
              <EmptyHeader>
                <EmptyTitle>No matching questions</EmptyTitle>
                <EmptyDescription>
                  Nothing in the FAQ list matches that search. Clear the field to see every group.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={0.08}>
          <BalanseFaqSection
            groups={visibleGroups}
            kicker="Booking, payment, waitlist, changes, walk-ins"
            title="Everything the studio gets asked"
            description="Pick a topic on the rail. Answers are canonical — booking, payment, and cancellation all work exactly as described here."
            className="[&>div]:py-12 md:[&>div]:py-16"
          />
        </ScrollReveal>
      )}

      <p className="sr-only">{flattenFaqs().length} canonical questions.</p>

      <BalanseCtaSection
        blockId="faqs-final"
        assetIds={["faqs-a", "landing-c", "contact-b"]}
        features={[
          { icon: "sparkles", label: "An account is required to reserve" },
          { icon: "workflow", label: "GCash or Pay at Counter" },
          { icon: "users", label: "Waitlist order is first in, first out" },
          { icon: "shield", label: "Cancellations are reviewed by an admin" },
        ]}
      />
    </article>
  );
}
