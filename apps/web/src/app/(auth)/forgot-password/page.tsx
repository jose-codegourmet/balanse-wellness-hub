import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset a Balansé customer password.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Forgot password</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Auth shell only. FE-CUS-003 owns the form.
      </p>
    </section>
  );
}
