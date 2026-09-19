"use client";

import { PROFILE_FIELDS_NOTE, safeAppPath, validateCustomerSignUp } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { BrandLockup, Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function CustomerSignUp({
  forcedStatus,
  returnTo: returnToProp,
}: {
  forcedStatus?: "submitting";
  returnTo?: string;
}) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = safeAppPath(returnToProp);
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
    <section className="mx-auto flex w-full max-w-sm flex-col items-center py-8">
      <BrandLockup />
      <h1 className="mt-8 text-center font-display text-3xl">Create your account</h1>
      {/* {PROFILE_FIELDS_NOTE} */}
      <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>

      <Button
        type="button"
        className="mt-8 w-full"
        onClick={() => {
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

      <form
        className="grid w-full gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = validateCustomerSignUp({
            fullName,
            email,
            contactNumber,
            password,
            confirmPassword,
          });
          if (!result.ok) {
            setErrors(result.errors);
            return;
          }
          setErrors({});
          setStatus("submitting");
          void getMockAdapter()
            .createCustomer({ fullName, email, contactNumber })
            .then((profile) => {
              setPrincipal({ role: "customer", customerId: profile.id });
              router.push(returnTo === "/portal" ? "/portal" : returnTo);
              router.refresh();
            });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="signup-name">Full name</Label>
          <Input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={fullName}
            aria-invalid={Boolean(errors.fullName)}
            onChange={(event) => setFullName(event.target.value)}
          />
          {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="signup-contact">Contact number</Label>
          <Input
            id="signup-contact"
            name="tel"
            type="tel"
            autoComplete="tel"
            value={contactNumber}
            aria-invalid={Boolean(errors.contactNumber)}
            onChange={(event) => setContactNumber(event.target.value)}
          />
          {errors.contactNumber ? (
            <p className="text-sm text-destructive">{errors.contactNumber}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="signup-confirm">Confirm password</Label>
          <Input
            id="signup-confirm"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            aria-invalid={Boolean(errors.confirmPassword)}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log In
        </Link>
      </p>
    </section>
  );
}
