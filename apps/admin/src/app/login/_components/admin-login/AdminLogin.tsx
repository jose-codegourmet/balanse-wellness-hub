"use client";

import { ADMIN_LOGIN_HELP, MOCK_ADMIN_CREDENTIALS, validateAdminLogin } from "@balanse/domain";
import { resolveMockStaffActor } from "@balanse/mock/session";
import { BrandLockup, LocalizedSkeleton } from "@balanse/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  firstImplementedPermittedAdminRoute,
  resolvePermittedReturnTo,
} from "@/lib/authorization/admin-access";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { AdminLoginForm } from "./admin-login-form/AdminLoginForm";

export function AdminLogin({
  forcedStatus,
  returnTo: returnToProp,
}: {
  forcedStatus?: "submitting" | "invalid" | "not-admin";
  returnTo?: string;
}) {
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const requestedReturnTo = returnToProp;
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
    <section className="min-h-[100dvh] bg-background text-foreground">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <BrandLockup />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Balansé Admin
            </p>
            <h1 className="sr-only">Balansé Admin</h1>
            <AdminLoginForm
              email={email}
              password={password}
              errors={errors}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={() => {
                const result = validateAdminLogin({ email, password });
                if (!result.ok) {
                  setErrors(result.errors);
                  return;
                }
                setErrors({});
                setStatus("submitting");
                window.setTimeout(() => {
                  const nextPrincipal = setPrincipal({ role: "admin", staffId: result.staffId });
                  const actor = resolveMockStaffActor(nextPrincipal);
                  const landing = firstImplementedPermittedAdminRoute(actor, "/login") ?? "/login";
                  router.push(resolvePermittedReturnTo(actor, requestedReturnTo, landing));
                  router.refresh();
                }, 350);
              }}
            />
            <details className="mt-6 rounded-xl border border-border/70 bg-muted/25 p-3 open:bg-card">
              <summary className="cursor-pointer text-sm font-semibold">
                Try a sample staff account
              </summary>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Each account has a different role. Selecting one fills the mock credentials so you
                can verify hidden navigation, blocked routes, and allowed actions.
              </p>
              <div className="mt-3 grid gap-2">
                {MOCK_ADMIN_CREDENTIALS.map((account) => (
                  <button
                    key={account.staffId}
                    type="button"
                    className="rounded-lg border border-border/70 bg-background p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setErrors({});
                    }}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium">{account.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-semibold text-muted-foreground">
                        {account.roleLabel}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {account.accessSummary}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Password for every sample: <code className="font-semibold">welcome</code>
              </p>
            </details>
            <p className="mt-6 text-center text-sm text-muted-foreground">{ADMIN_LOGIN_HELP}</p>
          </div>
        </div>
        <div className="relative hidden min-h-[100dvh] overflow-hidden bg-muted lg:block">
          <Image
            src="/assets/marketing/hero-16x9.webp"
            alt="Balansé studio interior"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
