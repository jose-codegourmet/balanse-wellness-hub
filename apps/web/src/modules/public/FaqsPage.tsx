"use client";

import { FAQ_GROUPS, filterFaqs, flattenFaqs } from "@balanse/domain";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  MarketingImage,
} from "@balanse/ui";
import Link from "next/link";
import { useMemo, useState } from "react";

export function FaqsPage({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const items = useMemo(() => filterFaqs(query), [query]);
  const itemIds = new Set(items.map((item) => item.id));
  const visibleGroups = FAQ_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => itemIds.has(item.id)),
  })).filter((group) => group.items.length > 0);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="grid items-end gap-6 sm:grid-cols-[1fr_12rem]">
        <div>
          <h1 className="font-display text-3xl">FAQs</h1>
          <label className="mt-6 block text-sm font-medium" htmlFor="faq-search">
            Search
          </label>
          <Input
            id="faq-search"
            type="search"
            value={query}
            className="mt-2"
            placeholder="Search questions"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <MarketingImage assetId="faqs-a" />
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <Empty className="border border-dashed border-border bg-card">
            <EmptyHeader>
              <EmptyTitle>No matching questions</EmptyTitle>
              <EmptyDescription>
                Nothing in the FAQ list matches that search. Clear the field to see every group.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {visibleGroups.map((group) => (
            <section key={group.id} aria-labelledby={`faq-${group.id}`}>
              <h2 id={`faq-${group.id}`} className="font-display text-2xl">
                {group.title}
              </h2>
              <dl className="mt-4 space-y-4">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                    <dt className="font-medium">{item.question}</dt>
                    <dd className="mt-2 text-sm text-muted-foreground">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}

      <p className="sr-only">{flattenFaqs().length} canonical questions.</p>

      <Link
        href="/contact"
        className="mt-12 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Contact Us
      </Link>
    </article>
  );
}
