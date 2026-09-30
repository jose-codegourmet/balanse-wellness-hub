"use client";

import {
  type PolicyDocumentVersion,
  PROFILE_FIELDS_NOTE,
  safeAppPath,
  toPolicyAcceptances,
  validateCustomerSignUp,
} from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import { BrandLockup, Button, LocalizedSkeleton, MarketingImage } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { CustomerSignUpForm } from "./customer-sign-up-form/CustomerSignUpForm";

export function CustomerSignUp({
  forcedStatus,
  returnTo: returnToProp,
  policies = [],
}: {
  forcedStatus?: "submitting";
  returnTo?: string;
  /** Current versions of the policies admin attached to sign up. */
  policies?: PolicyDocumentVersion[];
}) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = safeAppPath(returnToProp);
  const policyAcceptance = usePolicyAcceptance(policies);
  function policiesAccepted() {
    if (policyAcceptance.check()) return true;
    document.getElementById("signup-policies")?.scrollIntoView({ block: "center" });
    return false;
  }
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "contactNumber" | "password" | "confirmPassword", string>>
  >({});
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  if (status === "submitting") {
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
          {/* {PROFILE_FIELDS_NOTE} */}
          <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full md:mt-9"
            onClick={() => {
              if (!policiesAccepted()) return;
              setPrincipal({ role: "customer", customerId: "cust-ana" });
              router.push(returnTo);
              router.refresh();
            }}
          >
            Continue with Google
          </Button>

          <div className="my-6 flex w-full items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <CustomerSignUpForm
            values={{ fullName, email, contactNumber, password, confirmPassword }}
            errors={errors}
            onChange={(field, value) => {
              if (field === "fullName") setFullName(value);
              if (field === "email") setEmail(value);
              if (field === "contactNumber") setContactNumber(value);
              if (field === "password") setPassword(value);
              if (field === "confirmPassword") setConfirmPassword(value);
            }}
            beforeSubmit={
              <PolicyAcceptance
                {...policyAcceptance.props}
                id="signup-policies"
                title="Before you join"
              />
            }
            onSubmit={() => {
              const result = validateCustomerSignUp({
                fullName,
                email,
                contactNumber,
                password,
                confirmPassword,
              });
              const accepted = policiesAccepted();
              if (!result.ok) {
                setErrors(result.errors);
                return;
              }
              if (!accepted) return;
              setErrors({});
              setStatus("submitting");
              void getMockAdapter()
                .createCustomer({ fullName, email, contactNumber })
                .then(async (profile) => {
                  await getMockAdapter().acceptPolicies(
                    profile.id,
                    toPolicyAcceptances(policies, MOCK_NOW_ISO, "sign_up"),
                  );
                  setPrincipal({ role: "customer", customerId: profile.id });
                  router.push(returnTo === "/portal" ? "/portal" : returnTo);
                  router.refresh();
                });
            }}
          />

          <p className="auth-signup-prompt">
            Already have an account?{" "}
            <Link href="/login" className="auth-inline-link">
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
