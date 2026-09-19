import { type LucideIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { type ReactNode, useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  FooterColumnContactIcon,
  FooterColumnLink,
  FooterColumnProps,
  FooterColumnSocialIcon,
} from "./FooterColumn.types";

function SocialMark({
  icon,
  className,
}: {
  icon: FooterColumnSocialIcon;
  className?: string;
}) {
  const marks: Record<FooterColumnSocialIcon, ReactNode> = {
    facebook: (
      <path d="M14.5 8.5H16V5.8c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V12H6.5v2.8h2.5V22h3.2v-7.2h2.7l.4-2.8h-3.1V10.5c0-.8.2-1.4 1.3-1.4Z" />
    ),
    twitter: (
      <path d="M14.3 10.7 21.2 3h-1.6l-6 6.9L8.8 3H3.2l7.3 10.6L3.2 21h1.6l6.4-7.3L15.2 21h5.6l-6.5-10.3ZM11.2 12.7l-.7-1.1-5.8-8.2h2.5l4.7 6.7.7 1.1 6.1 8.7h-2.5l-4.9-7.2Z" />
    ),
    instagram: (
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm8 1.6H8A3.4 3.4 0 0 0 4.6 8v8A3.4 3.4 0 0 0 8 19.4h8a3.4 3.4 0 0 0 3.4-3.4V8A3.4 3.4 0 0 0 16 4.6ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Zm5.1-2.6a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z" />
    ),
    github: (
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2a2.7 2.7 0 0 0-1.1-1.5c-.9-.6.1-.6.1-.6a2.1 2.1 0 0 1 1.6 1.1 2.2 2.2 0 0 0 3 1 2.2 2.2 0 0 1 .6-1.4c-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 0 1 .1 2.6 3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5a2.4 2.4 0 0 1 .7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    ),
    dribbble: (
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.5 5.2a8.3 8.3 0 0 1 1.3 4.1 20 20 0 0 0-6.4-.2 29 29 0 0 0-2.1-4.8 8.4 8.4 0 0 1 7.2.9ZM12 3.6a8.3 8.3 0 0 1 3.4.7 27 27 0 0 1-2 4.6 32 32 0 0 1-5.7-.8A8.4 8.4 0 0 1 12 3.6ZM4.7 8.7a8.3 8.3 0 0 1 4.9-4.1 30 32 0 0 0 6 1 27 27 0 0 1 1.6 4.6 20 20 0 0 0-7.4.8 8.5 8.5 0 0 1-5.1-2.3Zm-.1 3.5a8.3 8.3 0 0 1 .4-2.4 10 10 0 0 0 5.8 2.5 32 32 0 0 1-1.1 6.3A8.4 8.4 0 0 1 4.6 12.2Zm8.6 8.2a8.3 8.3 0 0 1-5.3-1.9 30 30 0 0 0 1.2-6.6 19 19 0 0 0 6.9-.5 21 21 0 0 1-2.8 9Zm1.6.3a23 23 0 0 0 2.9-8.7 18 18 0 0 1 5.7.4 8.4 8.4 0 0 1-8.6 8.3Z" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      {marks[icon]}
    </svg>
  );
}

const contactIcons: Record<FooterColumnContactIcon, LucideIcon> = {
  mail: MailIcon,
  phone: PhoneIcon,
  "map-pin": MapPinIcon,
};

const defaults = {
  brandName: "Harbor",
  brandHref: "#home",
  description:
    "Quiet tools for studios that already ship. Landing blocks, registries, and the copy that holds a page together.",
  socialLinks: [
    { name: "Facebook", href: "#facebook", icon: "facebook" as const },
    { name: "Instagram", href: "#instagram", icon: "instagram" as const },
    { name: "Twitter", href: "#twitter", icon: "twitter" as const },
    { name: "GitHub", href: "#github", icon: "github" as const },
    { name: "Dribbble", href: "#dribbble", icon: "dribbble" as const },
  ],
  aboutTitle: "About us",
  aboutLinks: [
    { label: "Studio history", href: "#history" },
    { label: "Meet the desk", href: "#team" },
    { label: "Handbook", href: "#handbook" },
    { label: "Careers", href: "#careers" },
  ],
  servicesTitle: "Our services",
  serviceLinks: [
    { label: "Product sites", href: "#sites" },
    { label: "Design systems", href: "#systems" },
    { label: "Launch copy", href: "#copy" },
    { label: "Launch ads", href: "#ads" },
  ],
  helpTitle: "Helpful links",
  helpLinks: [
    { label: "FAQs", href: "#faqs" },
    { label: "Support", href: "#support" },
    { label: "Live chat", href: "#chat", indicator: true },
  ],
  contactTitle: "Contact us",
  contactItems: [
    {
      icon: "mail" as const,
      label: "hello@harbor.work",
      href: "mailto:hello@harbor.work",
    },
    {
      icon: "phone" as const,
      label: "+1 (503) 555-0148",
      href: "tel:+15035550148",
    },
    {
      icon: "map-pin" as const,
      label: "18 Dock Street, Portland",
      address: true,
    },
  ],
  copyright: "© 2026 Harbor",
  rightsLabel: "All rights reserved.",
};

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={className}
      fill="none"
    >
      <rect width="32" height="32" rx="16" className="fill-primary/15" />
      <path d="M9 21.5 16 8.5l7 13H9Z" className="fill-primary" />
    </svg>
  );
}

function LinkList({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: FooterColumnLink[];
}) {
  return (
    <nav aria-labelledby={id} className="text-center sm:text-left">
      <h3 id={id} className="text-lg font-medium tracking-tight">
        {title}
      </h3>
      {links.length ? (
        <ul className="mt-8 m-0 flex list-none flex-col gap-4 p-0">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href}
                className={cn(
                  linkClass,
                  link.indicator &&
                    "inline-flex items-center justify-center gap-1.5 sm:justify-start",
                )}
              >
                <span>{link.label}</span>
                {link.indicator ? (
                  <span
                    className="relative inline-flex size-2"
                    aria-hidden="true"
                  >
                    <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}

export function FooterColumn({
  className,
  brandName = defaults.brandName,
  brandHref = defaults.brandHref,
  description = defaults.description,
  logoSrc,
  logoAlt,
  socialLinks = defaults.socialLinks,
  aboutTitle = defaults.aboutTitle,
  aboutLinks = defaults.aboutLinks,
  servicesTitle = defaults.servicesTitle,
  serviceLinks = defaults.serviceLinks,
  helpTitle = defaults.helpTitle,
  helpLinks = defaults.helpLinks,
  contactTitle = defaults.contactTitle,
  contactItems = defaults.contactItems,
  copyright = defaults.copyright,
  rightsLabel = defaults.rightsLabel,
  ...props
}: FooterColumnProps) {
  const headingId = useId();

  return (
    <footer
      data-slot="footer-column"
      className={cn(
        "w-full rounded-t-[calc(var(--radius)+0.75rem)] bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <a
              href={brandHref}
              className="inline-flex w-full items-center justify-center gap-2 text-primary sm:justify-start focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={logoAlt ?? ""}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <BrandMark className="size-8" />
              )}
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {brandName}
              </span>
            </a>

            {description ? (
              <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed text-muted-foreground sm:mx-0 sm:max-w-xs sm:text-left">
                {description}
              </p>
            ) : null}

            {socialLinks.length ? (
              <ul className="mt-8 m-0 flex list-none justify-center gap-6 p-0 sm:justify-start md:gap-8">
                {socialLinks.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-primary transition-colors hover:text-primary/80 focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    >
                      <span className="sr-only">{item.name}</span>
                      <SocialMark icon={item.icon} className="size-6" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
            <LinkList
              id={`${headingId}-about`}
              title={aboutTitle}
              links={aboutLinks}
            />
            <LinkList
              id={`${headingId}-services`}
              title={servicesTitle}
              links={serviceLinks}
            />
            <LinkList
              id={`${headingId}-help`}
              title={helpTitle}
              links={helpLinks}
            />

            <div className="text-center sm:text-left">
              <h3
                id={`${headingId}-contact`}
                className="text-lg font-medium tracking-tight"
              >
                {contactTitle}
              </h3>
              {contactItems.length ? (
                <ul className="mt-8 m-0 flex list-none flex-col gap-4 p-0">
                  {contactItems.map((item) => {
                    const Icon = contactIcons[item.icon];
                    const label = item.address ? (
                      <address className="-mt-0.5 flex-1 not-italic">
                        {item.label}
                      </address>
                    ) : (
                      <span className="flex-1">{item.label}</span>
                    );
                    const body = (
                      <>
                        <Icon
                          className="size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {label}
                      </>
                    );
                    return (
                      <li
                        key={item.label}
                        className="text-sm text-muted-foreground"
                      >
                        {item.href ? (
                          <a
                            href={item.href}
                            className="inline-flex w-full items-center justify-center gap-1.5 transition-colors hover:text-foreground sm:justify-start focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                          >
                            {body}
                          </a>
                        ) : (
                          <span className="inline-flex w-full items-center justify-center gap-1.5 sm:justify-start">
                            {body}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            {rightsLabel ? (
              <p className="text-sm text-foreground">{rightsLabel}</p>
            ) : null}
            {copyright ? (
              <p className="mt-4 text-sm text-muted-foreground sm:order-first sm:mt-0">
                {copyright}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
