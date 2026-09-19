"use client";

import * as React from "react";
import { Button } from "@/components/jabkit/button";
import { Input } from "@/components/jabkit/input";
import { Label } from "@/components/jabkit/label";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  ForgotPassword2Logo,
  ForgotPassword2Props,
} from "./ForgotPassword2.types";

const defaultLogo: ForgotPassword2Logo = {
  name: "Northline",
  href: "#home",
};

const defaults = {
  title: "Forgot your password?",
  description:
    "Enter the email on your account. We will send a reset link if it matches a workspace.",
  emailLabel: "Email",
  emailPlaceholder: "you@northline.app",
  submitLabel: "Send reset link",
  sentTitle: "Check your inbox",
  sentDescription:
    "If that address is on file, a reset link is on the way. It expires in 30 minutes.",
  imageSrc: "/assets/2c2fae7d2bbfbdb2.webp",
  imageAlt: "Sunlit studio desks beside a tall window",
} as const;

function BrandMark({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "N";
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-[calc(var(--radius)-2px)] bg-foreground text-sm font-semibold text-background"
    >
      {initial}
    </span>
  );
}

function Brand({
  logo,
  logoMark,
}: {
  logo: ForgotPassword2Logo;
  logoMark?: React.ReactNode;
}) {
  const content = (
    <>
      {logoMark ??
        (logo.src ? (
          <img
            src={logo.src}
            alt=""
            className="size-8 rounded-[calc(var(--radius)-2px)] object-cover"
          />
        ) : (
          <BrandMark name={logo.name} />
        ))}
      <span className="text-sm font-medium tracking-[-0.01em]">
        {logo.name}
      </span>
    </>
  );

  if (logo.href) {
    return (
      <a
        href={logo.href}
        className="inline-flex items-center gap-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 text-foreground">
      {content}
    </div>
  );
}

export function ForgotPassword2({
  className,
  logo = defaultLogo,
  logoMark,
  title = defaults.title,
  description = defaults.description,
  emailLabel = defaults.emailLabel,
  emailPlaceholder = defaults.emailPlaceholder,
  emailDefaultValue,
  submitLabel = defaults.submitLabel,
  sentTitle = defaults.sentTitle,
  sentDescription = defaults.sentDescription,
  imageSrc = defaults.imageSrc,
  imageAlt = defaults.imageAlt,
  defaultSent = false,
  onSendLink,
  ...props
}: ForgotPassword2Props) {
  const headingId = React.useId();
  const emailId = React.useId();
  const [sent, setSent] = React.useState(defaultSent);
  const [email, setEmail] = React.useState(emailDefaultValue ?? "");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("email");
    const nextEmail = typeof value === "string" ? value.trim() : "";
    if (!nextEmail) return;
    onSendLink?.(nextEmail);
    setEmail(nextEmail);
    setSent(true);
  };

  const handleReset: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setSent(false);
  };

  return (
    <section
      data-slot="forgot-password2"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground min-h-[100dvh]", className)}
      {...props}
    >
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Brand logo={logo} logoMark={logoMark} />
            <h1
              id={headingId}
              className="mt-10 text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl sm:leading-[1.08]"
            >
              {sent ? sentTitle : title}
            </h1>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted-foreground">
              {sent ? sentDescription : description}
            </p>

            {sent ? (
              <form onSubmit={handleReset} className="mt-8 grid gap-4">
                <p
                  role="status"
                  className="rounded-[--radius] border border-border bg-muted/60 px-3.5 py-3 text-sm text-foreground"
                >
                  Sent to{" "}
                  <span className="font-medium">
                    {email || emailDefaultValue}
                  </span>
                </p>
                <Button type="submit" variant="secondary" className="w-full">
                  Use a different email
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor={emailId}>{emailLabel}</Label>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder={emailPlaceholder}
                    defaultValue={emailDefaultValue}
                    className="h-11 rounded-[--radius] px-3"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {submitLabel}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="relative hidden min-h-[100dvh] overflow-hidden bg-muted lg:block">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
