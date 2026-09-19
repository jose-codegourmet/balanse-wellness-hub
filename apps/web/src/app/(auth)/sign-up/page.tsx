import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Balansé customer account.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Sign up</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Auth shell only. FE-CUS-002 owns the form.
      </p>
    </section>
  );
}
