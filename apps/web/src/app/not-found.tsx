import { BrandLockup } from "@balanse/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <BrandLockup className="items-center" />
      <h1 className="mt-8 font-display text-3xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground">That route is not part of the Balansé MVP map.</p>
      <Link href="/" className="mt-6 inline-block text-primary underline">
        Back to the calendar
      </Link>
    </section>
  );
}
