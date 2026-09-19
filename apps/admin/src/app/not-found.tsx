import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-6 py-16">
      <h1 className="font-display text-3xl">Not found</h1>
      <p className="mt-2 text-muted-foreground">That admin route is not in the MVP map.</p>
      <Link href="/dashboard" className="mt-4 inline-block text-primary underline">
        Dashboard
      </Link>
    </section>
  );
}
