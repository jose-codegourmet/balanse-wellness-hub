"use client";

import { validateForgotPasswordEmail } from "@balanse/domain";
import { BrandLockup, Button, Input, Label, MarketingImage } from "@balanse/ui";
import { ArrowUpRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ForgotPasswordView = "initial" | "submitted" | "invalid" | "expired";

export function CustomerForgotPassword({ forcedView }: { forcedView?: ForgotPasswordView }) {
  const initialView: ForgotPasswordView = forcedView ?? "initial";
  const [view, setView] = useState<ForgotPasswordView>(initialView);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialView === "invalid" ? "Enter a valid email." : "");
  const expired = view === "expired";
  const submitted = view === "submitted";

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/" className="auth-brand" aria-label="Balansé home">
            <BrandLockup />
          </Link>
          {submitted ? (
            <div className="auth-heading">
              <p className="auth-kicker">Reset link requested</p>
              <MailCheck
                className="mt-5 size-8 text-[var(--balanse-gold-deep)]"
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <h1>Check your inbox</h1>
              <p>
                If that address is on file, a reset link is on the way. This mock does not reveal
                whether an account exists.
              </p>
              <Link href="/login" className="auth-forgot-link">
                Back to login <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          ) : expired ? (
            <div className="auth-heading">
              <p className="auth-kicker">Reset link expired</p>
              <h1>Request a new link</h1>
              <p>
                That mock reset link is no longer valid. Request another one and we will send it if
                the address is on file.
              </p>
              <Button
                type="button"
                className="auth-submit-button mt-7"
                onClick={() => setView("initial")}
              >
                Request a new link <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
              </Button>
              <Link href="/login" className="auth-forgot-link">
                Back to login <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <p className="auth-kicker">Account support</p>
                <h1>Reset your password</h1>
                <p>
                  Enter your email and we will send a link to help you get back to your practice.
                </p>
              </div>
              <form
                className="auth-form"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = validateForgotPasswordEmail(email);
                  if (!result.ok) {
                    setError(result.error);
                    setView("invalid");
                    return;
                  }
                  setError("");
                  setView("submitted");
                }}
              >
                <div className="auth-field">
                  <Label htmlFor="reset-email">Email address</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(error)}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  {error ? (
                    <p className="auth-error">{error}</p>
                  ) : (
                    <p className="auth-field-hint">
                      We will only send a link if the address is on file.
                    </p>
                  )}
                </div>
                <Button type="submit" className="auth-submit-button">
                  Send reset link <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                </Button>
              </form>
              <Link href="/login" className="auth-forgot-link">
                Back to login <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
      <aside className="auth-aside">
        <MarketingImage
          assetId="about-d"
          decorative
          loading="eager"
          className="auth-aside-image"
          sizes="(max-width: 767px) 100vw, 54vw"
        />
        <div className="auth-aside-copy">
          <p className="auth-kicker">Take your time</p>
          <p className="auth-aside-quote">Your space will be here when you are ready.</p>
          <p className="auth-aside-location">Balansé Wellness Hub · Cebu City</p>
        </div>
      </aside>
    </section>
  );
}
