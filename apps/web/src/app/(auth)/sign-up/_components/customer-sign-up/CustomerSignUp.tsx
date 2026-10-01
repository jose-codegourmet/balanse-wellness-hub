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
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  MOCK_GOOGLE_SIGN_UP_IDENTITY,
  type MockGoogleIdentity,
} from "../../_lib/mock-google-identity";
import type { CreateCustomerAccountResult } from "../../_lib/sign-up-actions";
import { CustomerSignUpForm } from "./customer-sign-up-form/CustomerSignUpForm";
import {
  customerSignUpFormDefaultValues,
  customerSignUpGoogleDefaults,
} from "./customer-sign-up-form/CustomerSignUpForm.defaults";
import type {
  CustomerSignUpFormValues,
  CustomerSignUpIdentity,
} from "./customer-sign-up-form/CustomerSignUpForm.schema";

export type CustomerSignUpProps = {
  forcedStatus?: "submitting";
  returnTo?: string;
  /** Current versions of the policies admin attached to sign up. */
  policies?: PolicyDocumentVersion[];
  /**
   * Creates the account. The route passes the `createCustomerAccount` server
   * action (reads and clears the share-attribution cookie); stories pass a stub.
   */
  createAccount: (input: CustomerSignUpIdentity) => Promise<CreateCustomerAccountResult>;
  /** Mock Google identity used by "Continue with Google". */
  googleIdentity?: MockGoogleIdentity;
};

/** Onboarding runs right after sign-up and then returns to `returnTo` (#352). */
export function welcomePathFor(returnTo: string): string {
  return `/portal/welcome?returnTo=${encodeURIComponent(returnTo)}`;
}

export function CustomerSignUp({
  forcedStatus,
  returnTo: returnToProp,
  policies = [],
  createAccount,
  googleIdentity = MOCK_GOOGLE_SIGN_UP_IDENTITY,
}: CustomerSignUpProps) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = safeReturnTo(returnToProp);
  const policyAcceptance = usePolicyAcceptance(policies);
  const [prefill, setPrefill] = useState<CustomerSignUpFormValues>(customerSignUpFormDefaultValues);
  const [status, setStatus] = useState<"idle" | "submitting" | "redirecting">(
    forcedStatus === "submitting" ? "redirecting" : "idle",
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
    const result = await createAccount({
      authMethod: values.authMethod,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      contactNumber: values.contactNumber,
    });
    if (!result.ok) {
      setStatus("idle");
      setFormError(result.error);
      return;
    }
    setStatus("redirecting");
    setPrincipal({ role: "customer", customerId: result.customerId });
    router.push(welcomePathFor(returnTo));
    router.refresh();
  }

  if (status === "redirecting") {
    return <LocalizedSkeleton lines={6} label="Creating account" />;
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
                onClick={() => setPrefill(customerSignUpFormDefaultValues)}
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
                onClick={() =>
                  setPrefill(
                    customerSignUpGoogleDefaults({
                      givenName: googleIdentity.given_name,
                      familyName: googleIdentity.family_name,
                      email: googleIdentity.email,
                    }),
                  )
                }
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
