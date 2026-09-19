import {
  CONTACT_DETAILS,
  PUBLIC_FOOTER_COLUMNS,
  PUBLIC_SOCIAL_LINKS,
  publicFooterYear,
} from "@balanse/domain";
import { BrandLockup } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** Brand composition: readable, static content instead of a photo-backed footer. */
export function BalanseFooter({ year = publicFooterYear() }: { year?: number }) {
  return (
    <footer
      data-section="footer"
      className="marketing-footer mt-auto border-t border-border bg-card"
    >
      <div className="marketing-container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_2fr] lg:gap-20">
          <div>
            <Link
              href="/"
              className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <BrandLockup className="[&>span:first-child]:text-3xl [&>span:last-child]:text-muted-foreground" />
            </Link>
            <p className="mt-6 max-w-64 text-sm leading-7 text-muted-foreground">
              A little movement.
              <br />A deeper breath. A space for you.
            </p>
            <a
              href={CONTACT_DETAILS.mapHref}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block max-w-64 text-sm leading-6 text-muted-foreground hover:text-foreground"
            >
              {CONTACT_DETAILS.address}
            </a>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {PUBLIC_FOOTER_COLUMNS.map((column) => (
              <div key={column.id}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                  {column.title}
                </h2>
                <ul className="mt-5 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-7 border-t border-border pt-8 md:flex-row md:items-start md:justify-between">
          <div className="text-sm">
            <a
              className="break-all hover:underline underline-offset-4"
              href={`mailto:${CONTACT_DETAILS.email}`}
            >
              {CONTACT_DETAILS.email}
            </a>
            <a
              className="mt-2 block text-muted-foreground hover:text-foreground"
              href={`tel:${CONTACT_DETAILS.phone}`}
            >
              {CONTACT_DETAILS.phone}
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {PUBLIC_SOCIAL_LINKS.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {social.label}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {year} Balansé Wellness Hub</p>
          <p>Book on the calendar. Reach out for everything else.</p>
        </div>
      </div>
    </footer>
  );
}
