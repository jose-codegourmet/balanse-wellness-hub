"use client";

import { BrandLockup } from "@balanse/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = params.get("returnTo") ?? "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <BrandLockup />
      <h1 className="mt-8 font-display text-3xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Staff accounts are provisioned by an existing admin. There is no public sign-up and no
        forgot-password page.
      </p>
      <button
        type="button"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => {
          setPrincipal({ role: "admin" });
          router.push(returnTo);
          router.refresh();
        }}
      >
        Continue as admin (mock)
      </button>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
