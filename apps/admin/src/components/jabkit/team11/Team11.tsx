import { useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { Team11Member, Team11Props } from "./Team11.types";

const DEFAULT_TITLE = "The people behind the work";
const DEFAULT_DESCRIPTION =
  "A dense roster for a studio that ships every week. Hover a name on larger screens to read a short bio without the grid shifting.";

const DEFAULT_MEMBERS: Team11Member[] = [
  {
    src: "/assets/bd48582e630a15fa.webp",
    alt: "Portrait of Amara Cole",
    name: "Amara Cole",
    role: "Design director",
    bio: "Sets the crop, the type, and the argument for leaving a layout alone when it already reads.",
  },
  {
    src: "/assets/2a364f729e4f7c09.webp",
    alt: "Portrait of Julian Hart",
    name: "Julian Hart",
    role: "Product engineer",
    bio: "Builds the parts that have to survive a Thursday ship without a product tour.",
  },
  {
    src: "/assets/d111cc60a8f2bf68.webp",
    alt: "Portrait of Priya Nair",
    name: "Priya Nair",
    role: "Brand lead",
    bio: "Keeps photography, wordmark, and color on the same desk so the page does not get translated twice.",
  },
  {
    src: "/assets/040bd026249d7af9.webp",
    alt: "Portrait of Eli Voss",
    name: "Eli Voss",
    role: "Studio producer",
    bio: "Runs the calendar, the reviews, and the quiet hour before a launch.",
  },
  {
    src: "/assets/45dad0903fef5d02.webp",
    alt: "Portrait of Ines Calder",
    name: "Ines Calder",
    role: "Research lead",
    bio: "Talks to operators, writes the brief in plain language, and cuts anything that needs a legend.",
  },
  {
    src: "/assets/1391b53bc91d2127.webp",
    alt: "Portrait of Rowan Hale",
    name: "Rowan Hale",
    role: "Frontend",
    bio: "Turns tokens and type into pages that still hold together at 375 pixels.",
  },
  {
    src: "/assets/fc2d8371236ac90c.webp",
    alt: "Portrait of Lena Ortiz",
    name: "Lena Ortiz",
    role: "Creative director",
    bio: "Holds the first sentence and the last crop. If either slips, the rest of the page follows.",
  },
  {
    src: "/assets/8c18989537b833e8.webp",
    alt: "Portrait of Malik Adeyemi",
    name: "Malik Adeyemi",
    role: "Engineering",
    bio: "Owns the install path, the registry shape, and the parts that fail loudly instead of quietly.",
  },
  {
    src: "/assets/4132445424a19cc6.webp",
    alt: "Portrait of Hana Iwasaki",
    name: "Hana Iwasaki",
    role: "Art director",
    bio: "Lights portraits, edits color, and refuses stock that looks like a template.",
  },
  {
    src: "/assets/2bd1b12951fdbdb5.webp",
    alt: "Portrait of Owen Briggs",
    name: "Owen Briggs",
    role: "Producer",
    bio: "Keeps print proofs, asset hashes, and Friday handoffs on one list.",
  },
  {
    src: "/assets/8e9489842d5e2cdf.webp",
    alt: "Portrait of Noor Elamin",
    name: "Noor Elamin",
    role: "Ops",
    bio: "Pays vendors, books the table, and notices when a file still has a placeholder name.",
  },
  {
    src: "/assets/9b8fa9955b8bd54f.webp",
    alt: "Portrait of Mira Solano",
    name: "Mira Solano",
    role: "Copy",
    bio: "Writes the line that can survive a quiet room, then cuts the rest.",
  },
];

function MemberCell({
  member,
  highlighted,
}: {
  member: Team11Member;
  highlighted: boolean;
}) {
  return (
    <li
      className={cn(
        "group relative z-0 min-h-[5.75rem] border-b border-r border-border",
        "md:hover:z-20 md:focus-within:z-20",
        highlighted && "z-20",
      )}
    >
      <button
        type="button"
        aria-label={`${member.name}, ${member.role}. ${member.bio}`}
        className="relative w-full px-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-3",
            "md:transition-opacity md:duration-200 md:ease-out md:motion-reduce:transition-none",
            highlighted
              ? "md:opacity-0"
              : "md:group-hover:opacity-0 md:group-focus-within:opacity-0",
          )}
        >
          <img
            src={member.src}
            alt=""
            className="size-12 shrink-0 rounded-[calc(var(--radius)-0.35rem)] bg-muted object-cover object-top"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium tracking-[-0.02em]">
              {member.name}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {member.role}
            </span>
          </span>
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 z-10 hidden w-[min(19rem,calc(100%+2.5rem))] -translate-x-1/2 -translate-y-1/2 md:block",
            "md:transition-opacity md:duration-200 md:ease-out md:motion-reduce:transition-none",
            highlighted
              ? "md:pointer-events-auto md:opacity-100"
              : "md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100",
          )}
        >
          <span className="block overflow-hidden rounded-[--radius] border border-border bg-card text-card-foreground shadow-lg">
            <span className="block h-1 w-full bg-[linear-gradient(90deg,var(--color-chart-1),var(--color-chart-2),var(--color-chart-3),var(--color-chart-4),var(--color-chart-5))]" />
            <span className="flex gap-3 p-4">
              <img
                src={member.src}
                alt=""
                className="size-16 shrink-0 rounded-[calc(var(--radius)-0.25rem)] bg-muted object-cover object-top"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium tracking-[-0.02em]">
                  {member.name}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {member.role}
                </span>
                <span className="mt-2 block text-sm leading-5 text-muted-foreground">
                  {member.bio}
                </span>
              </span>
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function Team11({
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  members = DEFAULT_MEMBERS,
  highlightedName,
  ...props
}: Team11Props) {
  const headingId = useId();

  return (
    <section
      data-slot="team11"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <header className="rounded-[calc(var(--radius)+0.2rem)] border border-border px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-[-0.05em] text-balance sm:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {description}
            </p>
          ) : null}
        </header>

        {members.length > 0 ? (
          <ul
            className="mt-8 grid list-none grid-cols-2 border-t border-l border-border p-0 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Team members"
          >
            {members.map((member) => (
              <MemberCell
                key={`${member.name}-${member.src}`}
                member={member}
                highlighted={highlightedName === member.name}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
