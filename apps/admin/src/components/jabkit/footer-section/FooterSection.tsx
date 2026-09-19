"use client";

import {
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  MoonIcon,
  PhoneIcon,
  SendIcon,
  SunIcon,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import { Button } from "@/components/jabkit/button";
import { Input } from "@/components/jabkit/input";
import { Label } from "@/components/jabkit/label";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  FooterSectionContactIcon,
  FooterSectionProps,
  FooterSectionSocialIcon,
  FooterSectionTheme,
} from "./FooterSection.types";

const contactIcons: Record<FooterSectionContactIcon, LucideIcon> = {
  "map-pin": MapPinIcon,
  phone: PhoneIcon,
  mail: MailIcon,
};

function SocialMark({
  icon,
  className,
}: {
  icon: FooterSectionSocialIcon;
  className?: string;
}) {
  const marks: Record<FooterSectionSocialIcon, ReactNode> = {
    facebook: (
      <path d="M14.5 8.5H16V5.8c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V12H6.5v2.8h2.5V22h3.2v-7.2h2.7l.4-2.8h-3.1V10.5c0-.8.2-1.4 1.3-1.4Z" />
    ),
    twitter: (
      <path d="M14.3 10.7 21.2 3h-1.6l-6 6.9L8.8 3H3.2l7.3 10.6L3.2 21h1.6l6.4-7.3L15.2 21h5.6l-6.5-10.3ZM11.2 12.7l-.7-1.1-5.8-8.2h2.5l4.7 6.7.7 1.1 6.1 8.7h-2.5l-4.9-7.2Z" />
    ),
    instagram: (
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm8 1.6H8A3.4 3.4 0 0 0 4.6 8v8A3.4 3.4 0 0 0 8 19.4h8a3.4 3.4 0 0 0 3.4-3.4V8A3.4 3.4 0 0 0 16 4.6ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Zm5.1-2.6a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z" />
    ),
    linkedin: (
      <path d="M6.5 9.2H4V20h2.5V9.2ZM5.2 4A1.5 1.5 0 1 0 6.7 5.5 1.5 1.5 0 0 0 5.2 4ZM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6a2.1 2.1 0 0 0-2 1.4 2.6 2.6 0 0 0-.1.9V20H11V9.2h2.4v1.5a3.3 3.3 0 0 1 3-1.6c2.2 0 3.6 1.4 3.6 4.5V20Z" />
    ),
    github: (
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2a2.7 2.7 0 0 0-1.1-1.5c-.9-.6.1-.6.1-.6a2.1 2.1 0 0 1 1.6 1.1 2.2 2.2 0 0 0 3 1 2.2 2.2 0 0 1 .6-1.4c-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 0 1 .1 2.6 3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5a2.4 2.4 0 0 1 .7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    ),
    youtube: (
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
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

const defaults = {
  brandTitle: "Stay connected",
  brandDescription:
    "Field notes, release lines, and one workflow worth stealing. No ads. Unsubscribe any time.",
  emailPlaceholder: "you@studio.work",
  subscribeLabel: "Subscribe",
  linksTitle: "Quick links",
  links: [
    { label: "About Harbor", href: "#about" },
    { label: "Workspace", href: "#workspace" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ],
  contactTitle: "Contact us",
  contactItems: [
    { icon: "map-pin" as const, label: "18 Dock Street, Portland" },
    {
      icon: "phone" as const,
      label: "+1 (503) 555-0148",
      href: "tel:+15035550148",
    },
    {
      icon: "mail" as const,
      label: "hello@harbor.work",
      href: "mailto:hello@harbor.work",
    },
  ],
  socialTitle: "Follow us",
  socialLinks: [
    { name: "Facebook", href: "#facebook", icon: "facebook" as const },
    { name: "Twitter", href: "#twitter", icon: "twitter" as const },
    { name: "Instagram", href: "#instagram", icon: "instagram" as const },
    { name: "LinkedIn", href: "#linkedin", icon: "linkedin" as const },
  ],
  legalLinks: [
    { label: "Privacy policy", href: "#privacy" },
    { label: "Terms of service", href: "#terms" },
    { label: "Cookie settings", href: "#cookies" },
  ],
  copyright: "© 2026 Harbor. All rights reserved.",
};

function readDocumentTheme(): FooterSectionTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyDocumentTheme(next: FooterSectionTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", next === "dark");
}

export function FooterSection({
  className,
  brandTitle = defaults.brandTitle,
  brandDescription = defaults.brandDescription,
  emailPlaceholder = defaults.emailPlaceholder,
  subscribeLabel = defaults.subscribeLabel,
  onSubscribe,
  onSubmit,
  linksTitle = defaults.linksTitle,
  links = defaults.links,
  contactTitle = defaults.contactTitle,
  contactItems = defaults.contactItems,
  socialTitle = defaults.socialTitle,
  socialLinks = defaults.socialLinks,
  legalLinks = defaults.legalLinks,
  copyright = defaults.copyright,
  theme: themeProp,
  defaultTheme,
  onThemeChange,
  showThemeToggle = true,
  ...props
}: FooterSectionProps) {
  const headingId = useId();
  const emailId = useId();
  const [uncontrolledTheme, setUncontrolledTheme] =
    useState<FooterSectionTheme>(() => defaultTheme ?? "light");

  useEffect(() => {
    if (themeProp !== undefined || defaultTheme !== undefined) return;
    setUncontrolledTheme(readDocumentTheme());
  }, [defaultTheme, themeProp]);

  const theme = themeProp ?? uncontrolledTheme;

  const setTheme = (next: FooterSectionTheme) => {
    if (themeProp === undefined) {
      setUncontrolledTheme(next);
      applyDocumentTheme(next);
    }
    onThemeChange?.(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    const email = String(
      new FormData(event.currentTarget).get("email") ?? "",
    ).trim();
    onSubscribe?.(email);
  };

  return (
    <footer
      data-slot="footer-section"
      className={cn(
        "relative overflow-hidden border-t border-border bg-background text-foreground",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 size-40 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="max-w-sm">
            <h2
              id={headingId}
              className="text-3xl font-semibold tracking-[-0.05em] text-balance"
            >
              {brandTitle}
            </h2>
            {brandDescription ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {brandDescription}
              </p>
            ) : null}
            <form className="relative mt-6" onSubmit={handleSubmit}>
              <Label htmlFor={emailId} className="sr-only">
                Email
              </Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={emailPlaceholder}
                className="h-11 rounded-full bg-card pr-12"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="absolute top-1 right-1 size-9 rounded-full p-0"
                aria-label={subscribeLabel}
              >
                <SendIcon className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>

          <nav aria-labelledby={`${headingId}-links`}>
            <h3
              id={`${headingId}-links`}
              className="text-sm font-semibold tracking-tight"
            >
              {linksTitle}
            </h3>
            <ul className="mt-4 m-0 flex list-none flex-col gap-2 p-0">
              {links.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              {contactTitle}
            </h3>
            <ul className="mt-4 m-0 flex list-none flex-col gap-3 p-0">
              {contactItems.map((item) => {
                const Icon = contactIcons[item.icon];
                const body = (
                  <>
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
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
                        className="inline-flex items-start gap-2.5 transition-colors hover:text-foreground focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {body}
                      </a>
                    ) : (
                      <span className="inline-flex items-start gap-2.5">
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              {socialTitle}
            </h3>
            {socialLinks.length ? (
              <ul className="mt-4 m-0 flex list-none flex-wrap gap-2 p-0">
                {socialLinks.map((item) => (
                  <li key={item.name}>
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="size-10 rounded-full p-0"
                    >
                      <a href={item.href} aria-label={item.name}>
                        <SocialMark icon={item.icon} className="size-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}

            {showThemeToggle ? (
              <fieldset className="mt-6 border-0 p-0">
                <legend className="text-sm font-semibold tracking-tight">
                  Theme
                </legend>
                <div className="mt-3 inline-flex rounded-full border border-border bg-muted p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-pressed={theme === "light"}
                    onClick={() => setTheme("light")}
                    className={cn(
                      "h-8 gap-1.5 rounded-full px-3 text-xs",
                      theme === "light"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <SunIcon className="size-3.5" aria-hidden="true" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-pressed={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "h-8 gap-1.5 rounded-full px-3 text-xs",
                      theme === "dark"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <MoonIcon className="size-3.5" aria-hidden="true" />
                    Dark
                  </Button>
                </div>
              </fieldset>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          {legalLinks.length ? (
            <nav aria-label="Legal">
              <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-2 p-0">
                {legalLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
