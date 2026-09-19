"use client";

import { safeAppPath, validateCustomerLogin } from "@balanse/domain";
import { BrandLockup, Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

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
    return <LocalizedSkeleton lines={5} label="Signing in" />;
  }

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col items-center py-8">
      <BrandLockup />
      <h1 className="mt-8 text-center font-display text-3xl">Welcome back</h1>
      <p className="sr-only">
        Mock login only. Google is the primary path. Jabkit login4 stays unedited; this wrapper
        follows the customer spec order.
      </p>

      <Button type="button" className="mt-8 w-full" onClick={() => completeLogin("cust-ana")}>
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
          const result = validateCustomerLogin({ email, password });
          if (!result.ok) {
            setErrors(result.errors);
            return;
          }
          setErrors({});
          setStatus("submitting");
          window.setTimeout(() => completeLogin(result.customerId), 350);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
        </div>
        {errors.form ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" className="w-full">
          Log In
        </Button>
      </form>

      <Link
        href="/forgot-password"
        className="mt-4 text-sm font-medium underline underline-offset-4"
      >
        Forgot Password
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={`/sign-up?returnTo=${encodeURIComponent(returnTo)}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create Account
        </Link>
      </p>
    </section>
  );
}
