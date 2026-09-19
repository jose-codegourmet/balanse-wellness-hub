"use client";

import { ArrowRightIcon } from "lucide-react";
import { type FormEvent, useId } from "react";
import { Button } from "@/components/jabkit/button";
import { Input } from "@/components/jabkit/input";
import { Label } from "@/components/jabkit/label";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  Cta22Props,
  Cta22StoreLink,
  Cta22StorePlatform,
} from "./Cta22.types";

const defaults = {
  title: "Take Harbor into the field.",
  description:
    "Capture briefs, markups, and sign-off from the jobsite. Same workspace as the desk, without the laptop.",
  storeLinks: [
    {
      platform: "app-store" as const,
      href: "#app-store",
      caption: "Download on the",
      label: "App Store",
    },
    {
      platform: "play" as const,
      href: "#play",
      caption: "Get it on",
      label: "Google Play",
    },
  ],
  phoneImageSrc: "/assets/8853774f028d7a82.webp",
  phoneImageAlt: "Harbor field app on a smartphone",
  newsletterTitle: "Field notes, once a week",
  newsletterDescription:
    "Release notes, site templates, and one workflow worth stealing. Unsubscribe any time.",
  emailLabel: "Work email",
  emailPlaceholder: "you@studio.work",
  subscribeLabel: "Subscribe",
};

function AppleMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.2 9.2.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.7.7 3 .7 2-.1 2.9-2.2c1.1-1.5 1.5-3 1.5-3.1-.1 0-2.8-1.1-2.8-4.3ZM14.7 6.3c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.8 1.1.1 2.2-.5 2.9-1.4Z" />
    </svg>
  );
}

function PlayMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M4.2 3.4c-.5.3-.7.7-.7 1.4v14.4c0 .7.2 1.1.7 1.4l12.8-8.6L4.2 3.4Zm14.4 7.4-2.6-1.7-2.9 2 2.9 2 2.6-1.8c.8-.5.8-1.3 0-1.5ZM12.1 12.1 8.6 9.7 5.4 7.5l6.7 4.6Zm0-.2 6.7 4.6-3.2-2.2-3.5-2.4Z" />
    </svg>
  );
}

function StoreMark({
  platform,
  className,
}: {
  platform: Cta22StorePlatform;
  className?: string;
}) {
  if (platform === "play") return <PlayMark className={className} />;
  return <AppleMark className={className} />;
}

function StoreBadge({ link }: { link: Cta22StoreLink }) {
  return (
    <Button
      variant="secondary"
      size="md"
      asChild
      className="h-auto justify-start gap-3 rounded-[calc(var(--radius)+0.15rem)] border-transparent bg-background px-3.5 py-2 text-foreground shadow-[0_12px_24px_-18px_color-mix(in_oklab,var(--jk-foreground),transparent_55%)] hover:bg-background hover:brightness-110"
    >
      <a href={link.href}>
        <StoreMark platform={link.platform} className="size-7 shrink-0" />
        <span className="flex min-w-0 flex-col items-start leading-tight">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
            {link.caption}
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {link.label}
          </span>
        </span>
      </a>
    </Button>
  );
}

export function Cta22({
  className,
  title = defaults.title,
  description = defaults.description,
  storeLinks = defaults.storeLinks,
  phoneImageSrc = defaults.phoneImageSrc,
  phoneImageAlt = defaults.phoneImageAlt,
  newsletterTitle = defaults.newsletterTitle,
  newsletterDescription = defaults.newsletterDescription,
  emailLabel = defaults.emailLabel,
  emailPlaceholder = defaults.emailPlaceholder,
  subscribeLabel = defaults.subscribeLabel,
  onSubscribe,
  onSubmit,
  ...props
}: Cta22Props) {
  const headingId = useId();
  const newsletterId = useId();
  const emailId = useId();

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
    <section
      data-slot="cta22"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch lg:grid lg:grid-cols-3 lg:gap-5">
          <div className="dark relative isolate min-h-[22rem] overflow-hidden rounded-[calc(var(--radius)+0.7rem)] bg-background text-foreground sm:min-w-0 sm:flex-1 lg:col-span-2">
            <div className="grid h-full md:grid-cols-[minmax(0,1.05fr)_minmax(12rem,0.95fr)]">
              <div className="flex flex-col justify-center gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                <div className="max-w-md space-y-3">
                  <h2
                    id={headingId}
                    className="text-3xl font-semibold tracking-[-0.05em] text-balance sm:text-4xl"
                  >
                    {title}
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {storeLinks.map((link) => (
                    <StoreBadge
                      key={`${link.platform}-${link.label}`}
                      link={link}
                    />
                  ))}
                </div>
              </div>

              <div className="relative hidden min-h-[18rem] md:block">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-6 bottom-0 top-12 rounded-t-[1.75rem] bg-muted"
                />
                <img
                  src={phoneImageSrc}
                  alt={phoneImageAlt}
                  className="absolute inset-x-10 bottom-0 top-6 z-10 mx-auto w-[min(100%,14rem)] rounded-t-[1.6rem] object-cover object-top shadow-[0_28px_48px_-28px_color-mix(in_oklab,var(--jk-foreground),transparent_40%)]"
                />
              </div>
            </div>
          </div>

          <aside
            aria-labelledby={newsletterId}
            className="hidden min-h-[22rem] flex-col justify-between rounded-[calc(var(--radius)+0.7rem)] bg-muted px-6 py-8 text-foreground sm:flex sm:w-[min(100%,20.5rem)] sm:shrink-0 lg:w-auto lg:min-h-0"
          >
            <div className="space-y-3">
              <h3
                id={newsletterId}
                className="text-2xl font-semibold tracking-[-0.04em] text-balance"
              >
                {newsletterTitle}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {newsletterDescription}
              </p>
            </div>

            <form className="mt-8 flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor={emailId}>{emailLabel}</Label>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={emailPlaceholder}
                  className="h-11 rounded-[--radius] bg-background"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2"
              >
                {subscribeLabel}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
