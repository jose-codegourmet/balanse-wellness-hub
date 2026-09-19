import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Studio content and payment info.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Studio content and payment info. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
