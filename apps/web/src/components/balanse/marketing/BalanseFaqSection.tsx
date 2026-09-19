"use client";

import type { FaqGroup } from "@balanse/domain";
import { Faq12 } from "@/components/jabkit/faq12";
import { cn } from "@/lib/utils";

/**
 * FAQ body built on Jabkit `faq12`: sticky category rail plus per-group
 * accordions. Groups come from the canonical `FAQ_GROUPS` catalog, already
 * narrowed by the page's search field.
 */
export function BalanseFaqSection({
  groups,
  kicker,
  title,
  description,
  className,
}: {
  groups: readonly FaqGroup[];
  kicker?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Faq12
      kicker={kicker}
      title={title}
      description={description}
      categories={groups.map((group) => ({
        id: group.id,
        label: group.title,
        items: group.items.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
      }))}
      className={cn(
        "bg-transparent",
        "[&_h2]:font-display [&_h2]:tracking-tight",
        "[&_h3]:font-display",
        className,
      )}
    />
  );
}
