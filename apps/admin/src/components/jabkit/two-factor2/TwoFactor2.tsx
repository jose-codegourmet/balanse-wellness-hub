"use client";

import * as React from "react";
import { Button } from "@/components/jabkit/button";
import { Input } from "@/components/jabkit/input";
import { Label } from "@/components/jabkit/label";
import { cn } from "@/components/jabkit/lib/cn";
import type { TwoFactor2Logo, TwoFactor2Props } from "./TwoFactor2.types";

const defaultLogo: TwoFactor2Logo = {
  name: "Northline",
  href: "#home",
};

const defaults = {
  title: "Check your authenticator",
  description:
    "Enter the 6-digit code from your authenticator app to finish signing in.",
  codeLabel: "Verification code",
  codeLength: 6,
  submitLabel: "Continue",
  resendPrompt: "Lost your device?",
  resendLabel: "Use a backup code",
  resendHref: "#backup",
  imageSrc: "/assets/6746a1f6081b08db.webp",
  imageAlt: "Open-plan studio with long desks and pendant lights",
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
  logo: TwoFactor2Logo;
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

function digitsFromCode(code: string | undefined, length: number) {
  const cleaned = (code ?? "").replace(/\D/g, "").slice(0, length);
  return Array.from({ length }, (_, index) => cleaned[index] ?? "");
}

export function TwoFactor2({
  className,
  logo = defaultLogo,
  logoMark,
  title = defaults.title,
  description = defaults.description,
  codeLabel = defaults.codeLabel,
  codeLength = defaults.codeLength,
  defaultCode,
  submitLabel = defaults.submitLabel,
  resendPrompt = defaults.resendPrompt,
  resendLabel = defaults.resendLabel,
  resendHref = defaults.resendHref,
  imageSrc = defaults.imageSrc,
  imageAlt = defaults.imageAlt,
  onVerify,
  onResend,
  ...props
}: TwoFactor2Props) {
  const headingId = React.useId();
  const codeLabelId = React.useId();
  const length = Math.max(4, Math.min(8, Math.trunc(codeLength) || 6));
  const [digits, setDigits] = React.useState(() =>
    digitsFromCode(defaultCode, length),
  );
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (index: number) => {
    const next = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[next]?.focus();
    inputRefs.current[next]?.select();
  };

  const writeDigits = (next: string[], focusIndex?: number) => {
    setDigits(next);
    if (focusIndex != null) {
      queueMicrotask(() => focusAt(focusIndex));
    }
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      writeDigits(digits.map((digit, i) => (i === index ? "" : digit)));
      return;
    }

    const next = [...digits];
    const chars = cleaned.slice(0, length - index).split("");
    chars.forEach((char, offset) => {
      next[index + offset] = char;
    });
    writeDigits(next, index + chars.length);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      writeDigits(next, index - 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    writeDigits(digitsFromCode(event.clipboardData.getData("text"), length), 0);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const code = digits.join("");
    if (code.length !== length) return;
    onVerify?.(code);
  };

  return (
    <section
      data-slot="two-factor2"
      aria-labelledby={headingId}
      className={cn("min-h-[100dvh] bg-background text-foreground", className)}
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
              {title}
            </h1>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted-foreground">
              {description}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
                <Label id={codeLabelId} htmlFor={`otp-${codeLabelId}-0`}>
                  {codeLabel}
                </Label>
                <div className="flex max-w-xs gap-2">
                  {digits.map((digit, index) => {
                    const slotId = `otp-${codeLabelId}-${index}`;
                    return (
                      <Input
                        key={slotId}
                        ref={(node) => {
                          inputRefs.current[index] = node;
                        }}
                        id={index === 0 ? slotId : undefined}
                        name={index === 0 ? "code" : undefined}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={index === 0 ? length : 1}
                        aria-label={`Digit ${index + 1} of ${length}`}
                        value={digit}
                        onChange={(event) =>
                          handleChange(index, event.currentTarget.value)
                        }
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={handlePaste}
                        className="size-11 shrink-0 p-0 text-center text-lg font-semibold tabular-nums"
                      />
                    );
                  })}
                </div>
              </fieldset>
              <Button type="submit" size="lg" className="w-full max-w-xs">
                {submitLabel}
              </Button>
            </form>

            <p className="mt-8 text-sm text-muted-foreground">
              {resendPrompt}{" "}
              <a
                href={resendHref}
                onClick={onResend}
                className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {resendLabel}
              </a>
            </p>
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
