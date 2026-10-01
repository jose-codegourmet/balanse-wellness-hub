"use client";

import { type PolicyDocumentVersion, PROFILE_FIELDS_NOTE, safeReturnTo } from "@balanse/domain";
import { BrandLockup, Button, LocalizedSkeleton, MarketingImage } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import type { CreateCustomerAccountResult, CustomerSignUpInput } from "../../_lib/sign-up-actions";
import { welcomePathFor } from "../../_lib/welcome-path";
import { CustomerSignUpForm } from "./customer-sign-up-form/CustomerSignUpForm";
import {
  customerSignUpFormDefaultValues,
  customerSignUpGoogleDefaults,
} from "./customer-sign-up-form/CustomerSignUpForm.defaults";
import type { CustomerSignUpFormValues } from "./customer-sign-up-form/CustomerSignUpForm.schema";

/** Google claims of a signed-in account that has not finished sign-up. */
export type GoogleSignUpIdentity = {
  givenName: string;
  familyName?: string | null;
  email: string;
};

export type CustomerSignUpProps = {
  forcedStatus?: "submitting" | "confirm_email";
  returnTo?: string;
  /** Current versions of the policies admin attached to sign up. */
  policies?: PolicyDocumentVersion[];
  /**
   * Creates (email) or finishes (Google) the account. The route passes the
   * `createCustomerAccount` server action (Supabase Auth; reads and clears the
   * share-attribution cookie); stories pass a stub.
   */
  createAccount: (
    input: CustomerSignUpInput,
    returnTo?: string,
  ) => Promise<CreateCustomerAccountResult>;
  /**
   * Set when the visitor is already signed in with Google but has not
   * finished sign-up (`/auth/callback` sends new accounts here). Prefills the
   * form so they check their name and add a contact number.
   */
  googleIdentity?: GoogleSignUpIdentity | null;
};

export function CustomerSignUp({
  forcedStatus,
  returnTo: returnToProp,
  policies = [],
  createAccount,
  googleIdentity,
}: CustomerSignUpProps) {
  const router = useRouter();
  const returnTo = safeReturnTo(returnToProp);
  const policyAcceptance = usePolicyAcceptance(policies);
  const [prefill, setPrefill] = useState<CustomerSignUpFormValues>(() =>
    googleIdentity ? customerSignUpGoogleDefaults(googleIdentity) : customerSignUpFormDefaultValues,
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "redirecting">(
    forcedStatus === "submitting" ? "redirecting" : "idle",
  );
  const [confirmEmail, setConfirmEmail] = useState<string | null>(
    forcedStatus === "confirm_email" ? "you@example.com" : null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const usingGoogle = prefill.authMethod === "google";

  function policiesAccepted() {
    if (policyAcceptance.check()) return true;
    document.getElementById("signup-policies")?.scrollIntoView({ block: "center" });
    return false;
  }

  async function submit(values: CustomerSignUpFormValues) {
    setStatus("submitting");
    setFormError(null);
    const result = await createAccount(
      {
        authMethod: values.authMethod,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        contactNumber: values.contactNumber,
        ...(values.authMethod === "email" ? { password: values.password } : {}),
      },
      returnTo,
    ).catch(
      (): CreateCustomerAccountResult => ({
        ok: false,
        error: "We couldn't create your account. Try again.",
      }),
    );
    if (!result.ok) {
      setStatus("idle");
      setFormError(result.error);
      return;
    }
    if (result.next === "confirm_email") {
      setStatus("idle");
      setConfirmEmail(result.email);
      return;
    }
    setStatus("redirecting");
    router.push(welcomePathFor(returnTo));
    router.refresh();
  }

  function continueWithGoogle() {
    setStatus("redirecting");
    // Server route: starts Supabase OAuth. New accounts come back here to finish.
    window.location.assign(`/auth/google?returnTo=${encodeURIComponent(returnTo)}`);
  }

  async function switchToEmail() {
    // Leave the half-finished Google session so the email form starts clean.
    await fetch("/auth/sign-out", { method: "POST" }).catch(() => undefined);
    setPrefill(customerSignUpFormDefaultValues);
    router.refresh();
  }

  if (status === "redirecting") {
    return <LocalizedSkeleton lines={6} label="Creating account" />;
  }

  if (confirmEmail) {
    return (
      <section className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <Link href="/" className="auth-brand" aria-label="Balansé home">
              <BrandLockup />
            </Link>
            <div className="auth-heading" role="status">
              <p className="auth-kicker">Almost there</p>
              <h1>Check your inbox</h1>
              <p>
                We sent a confirmation link to <strong>{confirmEmail}</strong>. Open it on this
                device to finish creating your account.
              </p>
            </div>
            <p className="auth-signup-prompt">
              Already confirmed?{" "}
              <Link
                href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                className="auth-inline-link"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </section>
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
            <p className="auth-kicker">Join the studio</p>
            <h1>Create your account</h1>
            <p>Set up your member profile, then reserve the classes that fit your week.</p>
          </div>
          <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>

          {usingGoogle ? (
            <div className="mt-8 grid gap-2 text-sm md:mt-9" role="status">
              <p>
                Signed in with Google as <strong>{prefill.email}</strong>. Check your name and add
                your contact number to finish.
              </p>
              <Button
                type="button"
                variant="link"
                className="self-start"
                onClick={() => void switchToEmail()}
              >
                Use email instead
              </Button>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-8 w-full md:mt-9"
                onClick={continueWithGoogle}
              >
                Continue with Google
              </Button>

              <div className="my-6 flex w-full items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <CustomerSignUpForm
            key={prefill.authMethod}
            defaultValues={prefill}
            submitting={status === "submitting"}
            formError={formError}
            canSubmit={policiesAccepted}
            beforeSubmit={
              <PolicyAcceptance
                {...policyAcceptance.props}
                id="signup-policies"
                title="Before you join"
              />
            }
            onSubmit={submit}
          />

          <p className="auth-signup-prompt">
            Already have an account?{" "}
            <Link
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="auth-inline-link"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
      <aside className="auth-aside">
        <MarketingImage
          assetId="about-a"
          decorative
          loading="eager"
          className="auth-aside-image"
          sizes="(max-width: 767px) 100vw, 54vw"
        />
        <div className="auth-aside-copy">
          <p className="auth-kicker">Your wellness space</p>
          <p className="auth-aside-quote">One place to move, learn, recover, and connect.</p>
          <p className="auth-aside-location">Balansé Wellness Hub · Cebu City</p>
        </div>
      </aside>
    </section>
  );
}
