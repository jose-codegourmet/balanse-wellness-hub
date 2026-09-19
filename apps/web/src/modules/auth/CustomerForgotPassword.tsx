"use client";

import { validateForgotPasswordEmail } from "@balanse/domain";
import { BrandLockup, Button, Input, Label } from "@balanse/ui";
import Link from "next/link";
import { useState } from "react";
import { ForgotPassword2 } from "@/components/jabkit/forgot-password2";

export type ForgotPasswordView = "initial" | "submitted" | "invalid" | "expired";

export function CustomerForgotPassword({ forcedView }: { forcedView?: ForgotPasswordView }) {
  const initialView: ForgotPasswordView = forcedView ?? "initial";
  const [view, setView] = useState<ForgotPasswordView>(initialView);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialView === "invalid" ? "Enter a valid email." : "");

  if (view === "expired") {
    return (
      <section className="mx-auto max-w-md py-10">
        <BrandLockup />
        <h1 className="mt-8 font-display text-3xl">Reset link expired</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          That mock reset link is no longer valid. Request a new one — we will not say whether an
          account exists.
        </p>
        <Button type="button" className="mt-6" onClick={() => setView("initial")}>
          Request a new link
        </Button>
        <p className="mt-4">
          <Link href="/login" className="text-sm underline underline-offset-4">
            Back to Login
          </Link>
        </p>
      </section>
    );
  }

  if (view === "submitted") {
    return (
      <div>
        <ForgotPassword2
          className="min-h-0"
          logo={{ name: "Balansé", href: "/" }}
          logoMark={<BrandLockup showTagline={false} />}
          title="Reset your password"
          sentTitle="Check your inbox"
          sentDescription="If that address is on file, a reset link is on the way. This mock does not reveal whether an account exists."
          defaultSent
          emailDefaultValue={email || "you@example.com"}
        />
        <p className="px-6 pb-8">
          <Link href="/login" className="text-sm underline underline-offset-4">
            Back to Login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-md py-10">
      <BrandLockup />
      <h1 className="mt-8 font-display text-3xl">Reset your password</h1>
      <form
        className="mt-8 grid gap-4"
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
        <div className="grid gap-1.5">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(error)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <Button type="submit">Send Reset Link</Button>
      </form>
      <p className="mt-4">
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to Login
        </Link>
      </p>
    </section>
  );
}
