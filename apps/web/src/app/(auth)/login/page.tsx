"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setPrincipal } = useMockPrincipal();
  const returnTo = params.get("returnTo") ?? "/portal";

  return (
    <section>
      <h1 className="font-display text-3xl">Log in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mock login only. No Supabase call is made.
      </p>
      <button
        type="button"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => {
          setPrincipal({ role: "customer" });
          router.push(returnTo);
          router.refresh();
        }}
      >
        Continue as customer
      </button>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
