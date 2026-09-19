"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/jabkit/button";
import { cn } from "@/components/jabkit/lib/cn";
import type { Faq12Category, Faq12Item, Faq12Props } from "./Faq12.types";

const DEFAULT_KICKER = "Help center";
const DEFAULT_TITLE = "Answers grouped the way teams already search";
const DEFAULT_DESCRIPTION =
  "Pick a topic on the rail. The list on the right jumps with you, and the active category stays marked as you scroll.";

const DEFAULT_CATEGORIES: Faq12Category[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        question: "How do I invite someone to a room?",
        answer:
          "Open the room, choose Members, then send an email invite. They land in the same draft you already have open.",
      },
      {
        question: "Where do unpublished drafts live?",
        answer:
          "Drafts stay on the shelf for that room. Filter by Draft to see only pages that have not shipped.",
      },
      {
        question: "Can I archive a project without deleting it?",
        answer:
          "Yes. Archive moves it out of the live index. You can restore it later from the archive filter.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    items: [
      {
        question: "When does the monthly invoice close?",
        answer:
          "Invoices close on the first weekday after your billing date. The PDF lands in Billing within a few hours.",
      },
      {
        question: "Can we pay by wire instead of a card?",
        answer:
          "Annual plans can pay by wire. Send the invoice number with the transfer so finance can match it.",
      },
      {
        question: "What happens if a seat sits unused?",
        answer:
          "Unused seats stay on the invoice until you remove them. Proration applies on the next cycle.",
      },
    ],
  },
  {
    id: "access",
    label: "Access",
    items: [
      {
        question: "Who can publish a page?",
        answer:
          "Owners and editors can publish. Viewers can comment, but they cannot ship a draft.",
      },
      {
        question: "How do SSO logins work?",
        answer:
          "Turn on SSO in Access, then map groups to roles. Existing passwords stop working on the next login.",
      },
      {
        question: "Can I revoke an API key without downtime?",
        answer:
          "Create the replacement key first, update the client, then revoke the old one. Revokes take effect immediately.",
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [
      {
        question: "How quickly do you reply?",
        answer:
          "Weekday tickets get a first reply within one business day. Priority plans get a same-day window.",
      },
      {
        question: "Do you offer a live onboarding call?",
        answer:
          "Yes, for teams of five or more. Book it from Support after you finish the first workspace setup.",
      },
      {
        question: "Where do we check service status?",
        answer:
          "Status notes live at status.harbor.work. Incidents also post in the in-app banner until they clear.",
      },
    ],
  },
];

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "category";
}

function categoryKey(category: Faq12Category, index: number) {
  return category.id ?? `${slugify(category.label)}-${index}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function AccordionRow({
  item,
  open,
  onToggle,
  panelId,
  triggerId,
  reducedMotion,
}: {
  item: Faq12Item;
  open: boolean;
  onToggle: () => void;
  panelId: string;
  triggerId: string;
  reducedMotion: boolean;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <h4 className="m-0 text-base font-medium">
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium tracking-[-0.02em] text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-[0.95rem]"
        >
          <span>{item.question}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              !reducedMotion && "transition-transform duration-200 ease-out",
              open && "rotate-180",
            )}
          />
        </button>
      </h4>
      <section
        id={panelId}
        aria-labelledby={triggerId}
        hidden={!open}
        className="pb-4"
      >
        <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
      </section>
    </div>
  );
}

function CategoryAccordion({
  category,
  reducedMotion,
}: {
  category: Faq12Category;
  reducedMotion: boolean;
}) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      {category.items.map((item, index) => {
        const open = openIndex === index;
        return (
          <AccordionRow
            key={item.question}
            item={item}
            open={open}
            onToggle={() => setOpenIndex(open ? null : index)}
            panelId={`${baseId}-panel-${index}`}
            triggerId={`${baseId}-trigger-${index}`}
            reducedMotion={reducedMotion}
          />
        );
      })}
    </div>
  );
}

export function Faq12({
  className,
  kicker = DEFAULT_KICKER,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  categories = DEFAULT_CATEGORIES,
  ...props
}: Faq12Props) {
  const headingId = useId();
  const instanceId = useId().replace(/:/g, "");
  const reducedMotion = usePrefersReducedMotion();
  const lockRef = useRef(false);
  const keys = useMemo(
    () => categories.map((category, index) => categoryKey(category, index)),
    [categories],
  );
  const sectionIds = useMemo(
    () => keys.map((key) => `faq12-${instanceId}-${key}`),
    [instanceId, keys],
  );
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    setActiveId(sectionIds[0] ?? "");
  }, [sectionIds]);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const next = visible[0]?.target.id;
        if (next) setActiveId(next);
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 0.15, 0.4],
      },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToCategory = useCallback(
    (id: string) => {
      const node = document.getElementById(id);
      if (!node) return;
      setActiveId(id);
      lockRef.current = true;
      node.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(
        () => {
          lockRef.current = false;
        },
        reducedMotion ? 50 : 700,
      );
    },
    [reducedMotion],
  );

  return (
    <section
      data-slot="faq12"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <header className="max-w-2xl">
          {kicker ? (
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {kicker}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-[-0.05em] text-balance sm:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {description}
            </p>
          ) : null}
        </header>

        {categories.length ? (
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
            <nav aria-label="FAQ categories" className="lg:sticky lg:top-8">
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0 lg:flex-col lg:gap-1">
                {categories.map((category, index) => {
                  const id = sectionIds[index];
                  const active = activeId === id;
                  return (
                    <li key={id} className="min-w-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-current={active ? "true" : undefined}
                        onClick={() => scrollToCategory(id)}
                        className={cn(
                          "h-9 w-auto justify-start px-3 font-medium lg:w-full",
                          active
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {category.label}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-w-0 space-y-10 sm:space-y-12">
              {categories.map((category, index) => {
                const id = sectionIds[index];
                const groupHeadingId = `${id}-heading`;
                return (
                  <section
                    key={id}
                    id={id}
                    aria-labelledby={groupHeadingId}
                    className="scroll-mt-8"
                  >
                    <h3
                      id={groupHeadingId}
                      className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
                    >
                      {category.label}
                    </h3>
                    <div className="mt-3 border-t border-border">
                      <CategoryAccordion
                        category={category}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
