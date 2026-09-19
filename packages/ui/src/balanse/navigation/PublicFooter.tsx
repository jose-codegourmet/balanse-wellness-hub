import {
  CONTACT_DETAILS,
  PUBLIC_FOOTER_COLUMNS,
  PUBLIC_FOOTER_LOCATION,
  PUBLIC_FOOTER_NOTE,
  PUBLIC_SOCIAL_LINKS,
  publicFooterYear,
} from "@balanse/domain";
import { BrandLockup } from "../../brand/BrandLockup";
import { cn } from "../../lib/utils";
import { DefaultNavLink, type NavLinkComponent } from "./nav-link";

/**
 * Navy closing chrome for every public and customer page: brand, three link
 * columns, studio contact details, and the socials. Contact channels are
 * deliberately framed as questions-only so the footer never reads as a second
 * booking path.
 */
export function PublicFooter({
  link: Link = DefaultNavLink,
  className,
  year = publicFooterYear(),
}: {
  link?: NavLinkComponent;
  className?: string;
  year?: number;
}) {
  return (
    <footer
      data-section="footer"
      className={cn(
        "mt-auto border-t border-[var(--balanse-gold)]/25 bg-[var(--balanse-navy)] text-[var(--balanse-beige)]",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_2fr]">
          <div>
            <BrandLockup tone="inverse" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{PUBLIC_FOOTER_NOTE}</p>
            <address className="mt-5 not-italic text-sm">
              <span className="block text-[var(--balanse-warm-white)]">
                {CONTACT_DETAILS.address}
              </span>
              <a
                className="mt-2 inline-block underline-offset-4 hover:text-accent hover:underline"
                href={`tel:${CONTACT_DETAILS.phone}`}
              >
                {CONTACT_DETAILS.phone}
              </a>
              <span aria-hidden="true" className="px-2 text-[var(--balanse-tan)]">
                ·
              </span>
              <a
                className="inline-block underline-offset-4 hover:text-accent hover:underline"
                href={`mailto:${CONTACT_DETAILS.email}`}
              >
                {CONTACT_DETAILS.email}
              </a>
            </address>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {PUBLIC_FOOTER_COLUMNS.map((column) => (
              <nav key={column.id} aria-label={column.title}>
                <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-sm underline-offset-4 transition-colors hover:text-[var(--balanse-warm-white)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--balanse-gold)]/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {PUBLIC_SOCIAL_LINKS.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  rel="noreferrer"
                  target="_blank"
                  className="rounded-sm underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="text-[var(--balanse-warm-white)]">{social.label}</span>
                  <span className="ml-1.5 text-[var(--balanse-tan)]">{social.handle}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs tracking-wide text-[var(--balanse-tan)]">
            © {year} Balansé Wellness Hub · {PUBLIC_FOOTER_LOCATION}
          </p>
        </div>
      </div>
    </footer>
  );
}
