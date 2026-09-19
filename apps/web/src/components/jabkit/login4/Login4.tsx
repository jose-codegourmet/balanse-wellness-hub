"use client";

import * as React from "react";
import { Button } from "@/components/jabkit/button";
import { Input } from "@/components/jabkit/input";
import { Label } from "@/components/jabkit/label";
import { cn } from "@/components/jabkit/lib/cn";
import type { Login4Logo, Login4Props, Login4Provider } from "./Login4.types";

const defaultLogo: Login4Logo = {
  name: "Northline",
  href: "#home",
};

const defaultProviders: Login4Provider[] = [
  {
    id: "google",
    label: "Log in with Google",
    href: "#google",
    iconSrc: "/assets/6f2cfdbd3438a4a5.webp",
  },
  {
    id: "facebook",
    label: "Log in with Facebook",
    href: "#facebook",
    iconSrc: "/assets/e1639f9fd2040338.webp",
  },
  {
    id: "github",
    label: "Log in with GitHub",
    href: "#github",
    iconSrc: "/assets/e44cf7114e4655ad.webp",
    invertOnDark: true,
  },
];

const defaults = {
  title: "Log in to your account",
  emailLabel: "Email",
  emailPlaceholder: "you@northline.app",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  submitLabel: "Log in",
  signupPrompt: "Don't have an account?",
  signupLabel: "Sign up",
  signupHref: "#signup",
} as const;

function BrandMark({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "N";
  return (
    <span
      aria-hidden="true"
      className="grid size-10 place-items-center rounded-[calc(var(--radius)-2px)] bg-foreground text-base font-semibold text-background"
    >
      {initial}
    </span>
  );
}

function Brand({
  logo,
  logoMark,
}: {
  logo: Login4Logo;
  logoMark?: React.ReactNode;
}) {
  const mark =
    logoMark ??
    (logo.src ? (
      <img
        src={logo.src}
        alt=""
        className="size-10 rounded-[calc(var(--radius)-2px)] object-cover"
      />
    ) : (
      <BrandMark name={logo.name} />
    ));

  const content = (
    <span className="flex flex-col items-center gap-3">
      {mark}
      <span className="text-sm font-medium tracking-[-0.01em]">
        {logo.name}
      </span>
    </span>
  );

  if (logo.href) {
    return (
      <a
        href={logo.href}
        className="text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </a>
    );
  }

  return <div className="text-foreground">{content}</div>;
}

function ProviderIcon({ provider }: { provider: Login4Provider }) {
  if (!provider.iconSrc) return null;
  return (
    <img
      src={provider.iconSrc}
      alt=""
      className={cn("size-4", provider.invertOnDark && "dark:invert")}
    />
  );
}

function ProviderButton({
  provider,
  onProviderClick,
}: {
  provider: Login4Provider;
  onProviderClick?: (providerId: string) => void;
}) {
  const handleClick = () => onProviderClick?.(provider.id);
  const content = (
    <>
      <ProviderIcon provider={provider} />
      {provider.label}
    </>
  );

  if (provider.href) {
    return (
      <Button variant="secondary" className="w-full gap-2.5" asChild>
        <a href={provider.href} onClick={handleClick}>
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full gap-2.5"
      onClick={handleClick}
    >
      {content}
    </Button>
  );
}

export function Login4({
  className,
  logo = defaultLogo,
  logoMark,
  title = defaults.title,
  emailLabel = defaults.emailLabel,
  emailPlaceholder = defaults.emailPlaceholder,
  emailDefaultValue,
  passwordLabel = defaults.passwordLabel,
  passwordPlaceholder = defaults.passwordPlaceholder,
  submitLabel = defaults.submitLabel,
  providers = defaultProviders,
  signupPrompt = defaults.signupPrompt,
  signupLabel = defaults.signupLabel,
  signupHref = defaults.signupHref,
  onLogin,
  onProviderClick,
  ...props
}: Login4Props) {
  const headingId = React.useId();
  const emailId = React.useId();
  const passwordId = React.useId();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailValue = data.get("email");
    const passwordValue = data.get("password");
    const email = typeof emailValue === "string" ? emailValue.trim() : "";
    const password = typeof passwordValue === "string" ? passwordValue : "";
    if (!email || !password) return;
    onLogin?.({ email, password });
  };

  return (
    <section
      data-slot="login4"
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <Brand logo={logo} logoMark={logoMark} />
        <h1
          id={headingId}
          className="mt-8 text-center text-2xl font-semibold tracking-[-0.03em] text-balance"
        >
          {title}
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 grid w-full gap-5">
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
          <div className="grid gap-2">
            <Label htmlFor={passwordId}>{passwordLabel}</Label>
            <Input
              id={passwordId}
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder={passwordPlaceholder}
              className="h-11 rounded-[--radius] px-3"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            {submitLabel}
          </Button>
          <div className="grid gap-2">
            {providers.map((provider) => (
              <ProviderButton
                key={provider.id}
                provider={provider}
                onProviderClick={onProviderClick}
              />
            ))}
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {signupPrompt}{" "}
          <a
            href={signupHref}
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {signupLabel}
          </a>
        </p>
      </div>
    </section>
  );
}
