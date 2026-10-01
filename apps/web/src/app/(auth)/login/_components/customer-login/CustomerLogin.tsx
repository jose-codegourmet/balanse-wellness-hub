"use client";

import { safeReturnTo } from "@balanse/domain";
import { BrandLockup, Button, LocalizedSkeleton, MarketingImage } from "@balanse/ui";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LoginErrors, SignInWithPasswordResult } from "../../_lib/login-actions";
import { CustomerLoginForm } from "./customer-login-form/CustomerLoginForm";

const AUTH_ERRORS: Record<string, string> = {
  google: "We couldn't reach Google. Try again.",
  callback: "Sign in didn't finish. Try again.",
};

export function CustomerLogin({
  forcedStatus,
  returnTo: returnToProp,
  authError,
  signIn,
}: {
  forcedStatus?: "submitting" | "invalid";
  returnTo?: string;
  /** `?error=` from `/auth/google` or `/auth/callback`. */
  authError?: string;
  /**
   * Email/password log in. The route passes the `signInWithPassword` server
   * action (Supabase Auth); stories pass a stub.
   */
  signIn: (input: { email: string; password: string }) => Promise<SignInWithPasswordResult>;
}) {
  const router = useRouter();
  const returnTo = safeReturnTo(returnToProp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>(() => {
    if (forcedStatus === "invalid") {
      return { form: "That email and password don't match. Try again." };
    }
    const message = authError ? AUTH_ERRORS[authError] : undefined;
    return message ? { form: message } : {};
  });
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  function continueWithGoogle() {
    setStatus("submitting");
    // Server route: starts Supabase OAuth and redirects to Google.
    window.location.assign(`/auth/google?returnTo=${encodeURIComponent(returnTo)}`);
  }

  async function submitPassword() {
    setStatus("submitting");
    const result = await signIn({ email, password }).catch(
      (): SignInWithPasswordResult => ({
        ok: false,
        errors: { form: "We couldn't sign you in. Try again in a moment." },
      }),
    );
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      return;
    }
    setErrors({});
    router.push(returnTo);
    router.refresh();
  }

  if (status === "submitting") {
    return (
      <div className="auth-login-loading">
        <LocalizedSkeleton lines={5} label="Signing in" />
      </div>
    );
  }

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/" className="auth-brand" aria-label="Balansé home">
            <BrandLockup />
          </Link>
          <div className="auth-heading">
            <p className="auth-kicker">Member access</p>
            <h1>Welcome back</h1>
            <p>Pick up where you left off, or make room for your next class.</p>
          </div>
          <p className="sr-only">Google is the primary way to log in.</p>

          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full md:mt-9"
            onClick={continueWithGoogle}
          >
            <span className="auth-google-mark" aria-hidden="true">
              G
            </span>
            Continue with Google
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <CustomerLoginForm
            email={email}
            password={password}
            errors={errors}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={() => void submitPassword()}
          />
          <Link href="/forgot-password" className="auth-forgot-link">
            Forgot password <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
          <p className="auth-signup-prompt">
            New to Balansé?{" "}
            <Link
              href={`/sign-up?returnTo=${encodeURIComponent(returnTo)}`}
              className="auth-inline-link"
            >
              Create an account
            </Link>
          </p>
          <div className="auth-trust-note">
            <Check className="size-4" aria-hidden="true" />
            <span>Your details stay private and your spot stays yours.</span>
          </div>
        </div>
      </div>
      <aside className="auth-aside">
        <MarketingImage
          assetId="landing-a"
          decorative
          loading="eager"
          className="auth-aside-image"
          sizes="(max-width: 767px) 100vw, 48vw"
        />
        <div className="auth-aside-copy">
          <p className="auth-kicker">A little space for yourself</p>
          <p className="auth-aside-quote">Come back to your practice, your rhythm, your people.</p>
          <p className="auth-aside-location">Balansé Wellness Hub · Cebu City</p>
        </div>
      </aside>
    </section>
  );
}
