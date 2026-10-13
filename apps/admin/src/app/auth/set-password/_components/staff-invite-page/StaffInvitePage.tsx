"use client";

import { BrandLockup, Button } from "@balanse/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StaffPasswordForm } from "../staff-password-form/StaffPasswordForm";
import type { StaffInvitePageProps } from "./StaffInvitePage.meta";

export function StaffInvitePage({
  canResume = false,
  defaultTokenType = "invite",
  onSubmit,
}: StaffInvitePageProps) {
  const [tokenHash, setTokenHash] = useState<string>();
  const [tokenType, setTokenType] = useState<"invite" | "recovery">(defaultTokenType);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    function readInvitation() {
      if (window.location.hash) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get("token_hash");
        const type = params.get("type") ?? "invite";
        const validType = type === "invite" || type === "recovery";
        setTokenHash(
          validType && token && /^[a-zA-Z0-9_-]{20,512}$/.test(token) ? token : undefined,
        );
        setTokenType(type === "recovery" ? "recovery" : "invite");
        setComplete(false);
        // Keep the credential only in memory, not in history or persistent browser storage.
        window.history.replaceState(null, "", window.location.pathname);
      }
      setReady(true);
    }
    readInvitation();
    window.addEventListener("hashchange", readInvitation);
    return () => window.removeEventListener("hashchange", readInvitation);
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <BrandLockup />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {tokenType === "recovery" ? "Staff password reset" : "Staff invitation"}
          </p>
          <h1 className="font-heading text-3xl">
            {complete
              ? "Your password is ready"
              : tokenType === "recovery"
                ? "Reset your password"
                : "Set your password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {complete
              ? "You can now sign in to the staff portal with your email and new password."
              : tokenType === "recovery"
                ? "Choose a new password for your staff account. This will replace any existing password."
                : "Welcome to Balansé. Choose a password to finish setting up your staff account."}
          </p>
        </div>
        {!ready ? (
          <p role="status">Loading password link…</p>
        ) : complete ? (
          <Button nativeButton={false} render={<Link href="/login" />}>
            Continue to sign in
          </Button>
        ) : tokenHash || canResume ? (
          <StaffPasswordForm
            onSubmit={async (values) => {
              const result = await onSubmit({ ...values, tokenHash, tokenType });
              if (!result.ok) throw new Error(result.message);
              setTokenHash(undefined);
              setComplete(true);
            }}
          />
        ) : (
          <div className="space-y-4">
            <p role="alert" className="text-sm">
              Open the full invite or reset link shared by your administrator. If it has expired or
              was already used, ask them for help.
            </p>
            <Link className="text-sm underline underline-offset-4" href="/login">
              Back to sign in
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
