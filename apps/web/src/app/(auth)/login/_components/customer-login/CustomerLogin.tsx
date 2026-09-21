"use client";

import { safeAppPath, validateCustomerLogin } from "@balanse/domain";
import { BrandLockup, Button, LocalizedSkeleton, MarketingImage } from "@balanse/ui";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { CustomerLoginForm } from "./customer-login-form/CustomerLoginForm";

export function CustomerLogin({
  forcedStatus,
  returnTo: returnToProp,
}: {
  forcedStatus?: "submitting" | "invalid";
  returnTo?: string;
}) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = safeAppPath(returnToProp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"email" | "password" | "form", string>>>(
    forcedStatus === "invalid"
      ? { form: "Those credentials are not recognised in this mock." }
      : {},
  );
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  function completeLogin(customerId: string) {
    setPrincipal({ role: "customer", customerId });
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
          <p className="sr-only">Mock login only. Google is the primary path.</p>

          <Button
            type="button"
            variant="secondary"
            className="auth-google-button"
            onClick={() => completeLogin("cust-ana")}
          >
            <span className="auth-google-mark" aria-hidden="true">
              G
            </span>
            Continue with Google
            <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
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
            onSubmit={() => {
              const result = validateCustomerLogin({ email, password });
              if (!result.ok) {
                setErrors(result.errors);
                return;
              }
              setErrors({});
              setStatus("submitting");
              window.setTimeout(() => completeLogin(result.customerId), 350);
            }}
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
