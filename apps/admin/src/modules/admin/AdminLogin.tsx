"use client";

import { ADMIN_LOGIN_HELP, safeAdminPath, validateAdminLogin } from "@balanse/domain";
import { BrandLockup, Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function AdminLogin({
  forcedStatus,
  returnTo: returnToProp,
}: {
  forcedStatus?: "submitting" | "invalid" | "not-admin";
  returnTo?: string;
}) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = safeAdminPath(returnToProp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"email" | "password" | "form", string>>>(
    forcedStatus === "invalid"
      ? { form: "Those credentials are not recognised in this mock." }
      : forcedStatus === "not-admin"
        ? { form: "This account is not an admin. Contact the system administrator." }
        : {},
  );
  const [status, setStatus] = useState<"idle" | "submitting">(
    forcedStatus === "submitting" ? "submitting" : "idle",
  );

  if (status === "submitting") {
    return <LocalizedSkeleton lines={5} label="Signing in" />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-4 py-8">
      <BrandLockup />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Balansé Admin
      </p>
      <h1 className="sr-only">Balansé Admin</h1>
      <form
        className="mt-8 grid w-full gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = validateAdminLogin({ email, password });
          if (!result.ok) {
            setErrors(result.errors);
            return;
          }
          setErrors({});
          setStatus("submitting");
          window.setTimeout(() => {
            setPrincipal({ role: "admin" });
            router.push(returnTo);
            router.refresh();
          }, 350);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
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
      <p className="mt-6 text-center text-sm text-muted-foreground">{ADMIN_LOGIN_HELP}</p>
    </main>
  );
}
