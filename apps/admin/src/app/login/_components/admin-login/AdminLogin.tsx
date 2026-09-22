"use client";

import { ADMIN_LOGIN_HELP, safeAdminPath, validateAdminLogin } from "@balanse/domain";
import { BrandLockup, LocalizedSkeleton } from "@balanse/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
                  setPrincipal({ role: "admin", staffId: result.staffId });
                  router.push(returnTo);
                  router.refresh();
                }, 350);
              }}
            />
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
