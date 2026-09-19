"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Badge } from "@/components/jabkit/badge";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  Content1Block,
  Content1Callout,
  Content1ListItem,
  Content1Props,
  Content1Section,
  Content1Table,
} from "./Content1.types";

const DEFAULT_KICKER = "Field note";
const DEFAULT_TITLE = "How Northline ships a brief";
const DEFAULT_DESCRIPTION =
  "A long-form walkthrough with a sticky outline. Jump to the beat you need, or read it through like a chapter.";
const DEFAULT_OUTLINE_LABEL = "On this page";

const DEFAULT_SECTIONS: Content1Section[] = [
  {
    id: "brief",
    title: "The brief we keep",
    blocks: [
      {
        type: "paragraph",
        text: "Northline writes one page before any ticket is opened. The page names the room, the decision, and the first thing a new teammate should see. Everything else waits.",
      },
      {
        type: "paragraph",
        text: "The outline on the right is not decoration. It is the same list the author used to structure the note, so a reader can skip to proof without losing the thread.",
      },
      {
        type: "image",
        image: {
          src: "/assets/8b10f8ca8e999989.webp",
          alt: "Sunlit studio desks with plants, notebooks, and open laptops",
          caption: "The floor after standup: one canvas, no extra tabs.",
        },
      },
    ],
  },
  {
    id: "floor",
    title: "How the floor actually works",
    blocks: [
      {
        type: "paragraph",
        text: "Work moves in three beats: write the brief, pin the owner, then show the room a live preview. Status lives on the page, not in a chat that expires overnight.",
      },
      {
        type: "list",
        items: [
          {
            title: "One owner",
            text: "A name on the brief. Questions go there first, not to a group thread.",
          },
          {
            title: "One preview",
            text: "A running surface the room can click. Screenshots are a last resort.",
          },
          {
            title: "One decision log",
            text: "What changed and why, written under the heading it belongs to.",
          },
        ],
      },
      {
        type: "callout",
        callout: {
          badge: "Note",
          title: "Keep the outline honest",
          body: "If a heading has nothing to jump to, cut it. The sticky list should match the story, not a template.",
        },
      },
    ],
  },
  {
    id: "week",
    title: "What ships in the first week",
    blocks: [
      {
        type: "paragraph",
        text: "Week one is not a roadmap. It is the smallest note a customer can read without a call. The table below is the checklist we paste into the brief.",
      },
      {
        type: "table",
        table: {
          caption: "First-week delivery checklist",
          columns: ["Beat", "Owner", "Done when"],
          rows: [
            ["Brief", "Lead", "One page names the decision"],
            ["Preview", "Build", "A URL the room can click"],
            ["Proof", "Ops", "A number the room can repeat"],
          ],
        },
      },
      {
        type: "image",
        image: {
          src: "/assets/3a3bdafcc198e463.webp",
          alt: "Team gathered around a table reviewing work together",
          caption:
            "Friday review: read the note out loud, then close the loop.",
        },
      },
    ],
  },
  {
    id: "proof",
    title: "Numbers the room can repeat",
    blocks: [
      {
        type: "paragraph",
        text: "We keep three numbers on the last heading: time to first preview, questions that needed a meeting, and whether the customer could retell the story. If they cannot retell it, the note is not done.",
      },
      {
        type: "list",
        items: [
          {
            title: "Time to preview",
            text: "Measured in working days from brief to a clickable URL.",
          },
          {
            title: "Meetings avoided",
            text: "Questions answered on the page instead of a calendar hold.",
          },
          {
            title: "Retell test",
            text: "A person who was not in the room can explain the decision.",
          },
        ],
      },
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("size-3.5", className)}
      fill="none"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="none"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7.25V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ArticleImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-[--radius] border border-border bg-muted">
      <img src={src} alt={alt} className="aspect-[16/10] w-full object-cover" />
      {caption ? (
        <figcaption className="border-t border-border px-4 py-3 text-sm leading-6 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArticleList({ items }: { items: Content1ListItem[] }) {
  return (
    <ul className="grid list-none gap-4 p-0">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
          >
            <CheckIcon />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {item.text}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArticleCallout({ callout }: { callout: Content1Callout }) {
  return (
    <aside
      role="note"
      className="rounded-[--radius] border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <InfoIcon />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {callout.badge ? (
              <Badge variant="secondary">{callout.badge}</Badge>
            ) : null}
            <p className="text-sm font-semibold tracking-tight">
              {callout.title}
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {callout.body}
          </p>
        </div>
      </div>
    </aside>
  );
}

function ArticleTable({ table }: { table: Content1Table }) {
  return (
    <div className="overflow-x-auto rounded-[--radius] border border-border">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        {table.caption ? (
          <caption className="sr-only">{table.caption}</caption>
        ) : null}
        <thead className="bg-muted">
          <tr>
            {table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-border px-4 py-3 font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join("-")} className="bg-card last:[&>td]:border-b-0">
              {row.map((cell, index) => (
                <td
                  key={`${table.columns[index] ?? index}-${cell}`}
                  className={cn(
                    "border-b border-border px-4 py-3",
                    index === 0
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block: Content1Block, key: string) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className="text-base leading-7 text-muted-foreground">
          {block.text}
        </p>
      );
    case "image":
      return (
        <ArticleImage
          key={key}
          src={block.image.src}
          alt={block.image.alt}
          caption={block.image.caption}
        />
      );
    case "list":
      return <ArticleList key={key} items={block.items} />;
    case "callout":
      return <ArticleCallout key={key} callout={block.callout} />;
    case "table":
      return <ArticleTable key={key} table={block.table} />;
    default:
      return null;
  }
}

function OutlineNav({
  label,
  sections,
  activeId,
  idFor,
  className,
}: {
  label: string;
  sections: Content1Section[];
  activeId: string;
  idFor: (id: string) => string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <p className="text-xs font-semibold tracking-tight text-foreground">
        {label}
      </p>
      <ol className="mt-3 list-none space-y-1 p-0">
        {sections.map((section) => {
          const href = `#${idFor(section.id)}`;
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={href}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block border-l-2 py-1.5 pl-3 text-sm leading-6 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
                  isActive
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {section.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Content1({
  className,
  kicker = DEFAULT_KICKER,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  outlineLabel = DEFAULT_OUTLINE_LABEL,
  sections = DEFAULT_SECTIONS,
  ...props
}: Content1Props) {
  const headingId = useId();
  const instanceId = useId().replace(/:/g, "");
  const idFor = useCallback(
    (id: string) => `content1-${instanceId}-${id}`,
    [instanceId],
  );
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(idFor(section.id)))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const rawId = entry.target.getAttribute("data-section-id");
          if (!rawId) continue;
          if (entry.isIntersecting) visible.set(rawId, entry.intersectionRatio);
          else visible.delete(rawId);
        }
        const ranked = [...visible.entries()].sort((a, b) => b[1] - a[1]);
        if (ranked[0]) setActiveId(ranked[0][0]);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.4, 0.6, 1] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [idFor, sections]);

  return (
    <section
      data-slot="content1"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <header className="max-w-2xl">
          {kicker ? (
            <p className="mb-3 text-sm font-medium text-primary">{kicker}</p>
          ) : null}
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-[-0.05em] text-balance sm:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {description}
            </p>
          ) : null}
        </header>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-16 xl:grid-cols-[minmax(0,1fr)_16.5rem]">
          <OutlineNav
            label={outlineLabel}
            sections={sections}
            activeId={activeId}
            idFor={idFor}
            className="rounded-[--radius] border border-border bg-card p-4 lg:hidden"
          />

          <article className="min-w-0">
            <div className="grid gap-14 sm:gap-16">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={idFor(section.id)}
                  data-section-id={section.id}
                  aria-labelledby={`${idFor(section.id)}-title`}
                  className="scroll-mt-24"
                >
                  <h3
                    id={`${idFor(section.id)}-title`}
                    className="text-2xl font-semibold tracking-[-0.04em] text-balance sm:text-3xl"
                  >
                    {section.title}
                  </h3>
                  <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6">
                    {section.blocks.map((block, index) =>
                      renderBlock(
                        block,
                        `${section.id}-${block.type}-${index}`,
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
            <OutlineNav
              label={outlineLabel}
              sections={sections}
              activeId={activeId}
              idFor={idFor}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
