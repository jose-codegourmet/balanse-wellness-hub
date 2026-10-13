"use client";

import { ADMIN_LOGIN_HELP, safeAdminPath } from "@balanse/domain";
import { BrandLockup, LocalizedSkeleton } from "@balanse/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "../../_lib/admin-login-actions";
import { AdminLoginForm } from "./admin-login-form/AdminLoginForm";
import type { AdminLoginFormValues } from "./admin-login-form/AdminLoginForm.schema";

export function AdminLogin({
  forcedStatus,
  returnTo: returnToProp,
}: {
  /** Story-only: renders the loading skeleton without submitting anything. */
  forcedStatus?: "submitting";
  returnTo?: string;
}) {
  const router = useRouter();

  if (forcedStatus === "submitting") {
    return <LocalizedSkeleton lines={5} label="Signing in" />;
  }

  async function handleSubmit(values: AdminLoginFormValues) {
    const result = await signInWithPassword(values);
    if (!result.ok) {
      throw new Error(
        result.errors.form ??
          result.errors.email ??
          result.errors.password ??
          "We couldn't sign you in. Try again in a moment.",
      );
    }
    router.push(safeAdminPath(returnToProp));
    router.refresh();
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
            <AdminLoginForm onSubmit={handleSubmit} />
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
